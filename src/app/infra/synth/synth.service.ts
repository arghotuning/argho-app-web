// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {BehaviorSubject, Observable} from 'rxjs';

import {Injectable} from '@angular/core';
import {FreqHz} from '@arghotuning/arghotun';

declare global {
  interface Window {
    webkitAudioContext: AudioContext;  // Still prefixed in Safari.
  }
}
window.AudioContext = window.AudioContext || window.webkitAudioContext;

/** Converts [0.0, 1.0] volume slider value to nicer gain. */
function scaledVol(normalizedVolume: number): number {
  // Anything less than 0.1: volume off.
  if (normalizedVolume < 0.1) {
    return 0.0;
  }

  // Scale [0.0, 1.0] to [-36 dB, -3 dB].
  const db = -36.0 + 33.0 * normalizedVolume;
  return Math.pow(10.0, db / 20.0);
}

const ATTACK_TIME_SECS = 0.04;
const DECAY_TIME_SECS = 10.0;
const RELEASE_TIME_SECS = 0.3;
const STOP_TIME_SECS = 0.2;

function newGlobalVolume(audioContext: AudioContext, normalizedVolume: number): GainNode {
  const globalVol = audioContext.createGain();
  globalVol.gain.setValueAtTime(scaledVol(normalizedVolume), audioContext.currentTime);
  return globalVol;
}

function newLimiter(audioContext: AudioContext): DynamicsCompressorNode {
  // Best currently available in WebAudio API is a 20:1 compressor.
  // Ideally, this would be a brickwall limiter.
  const limiter = audioContext.createDynamicsCompressor();

  const currentTime = audioContext.currentTime;
  limiter.threshold.setValueAtTime(-1 /* dB */, currentTime);
  limiter.ratio.setValueAtTime(20 /* 20:1 */, currentTime);
  limiter.attack.setValueAtTime(0 /* s */, currentTime);
  limiter.release.setValueAtTime(0.1 /* s */, currentTime);
  limiter.knee.setValueAtTime(0 /* hard knee */, currentTime);

  return limiter;
}

export type OscWaveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

function newOscillator(audioContext: AudioContext, waveform: OscWaveform): OscillatorNode {
  const osc = audioContext.createOscillator();
  osc.type = waveform;
  return osc;
}

function gainCompensation(waveform: OscWaveform): number {
  // Compensate to make each oscillator waveform similar in loudness.
  if (waveform === 'sine' || waveform === 'triangle') {
    return 0.8;
  } else if (waveform === 'sawtooth') {
    return 0.45;
  } else {
    return 0.35;
  }
}

function newAmplitudeEnvelope(audioContext: AudioContext): GainNode {
  const ampEnv = audioContext.createGain();
  ampEnv.gain.setValueAtTime(0.0, audioContext.currentTime);
  return ampEnv;
}

/** Monophonic voice within this polyphonic synth. */
interface Voice {
  osc: OscillatorNode;
  ampEnv: GainNode;
  stopTimeSecs: number;
}

/** Interface for a single note that must be stopped to end its playback. */
export interface StoppableNote {
  stop(): void;
}

/**
 * Holds AudioContext dependent state; initialization delayed until after user
 * interaction.
 */
class AudioState {
  readonly audioContext: AudioContext;

  readonly voices: Voice[] = [];
  readonly globalVol: GainNode;
  readonly limiter: DynamicsCompressorNode;

  constructor(vol: number) {
    this.audioContext = new window.AudioContext();

    this.globalVol = newGlobalVolume(this.audioContext, vol);
    this.limiter = newLimiter(this.audioContext);

    this.globalVol.connect(this.limiter);
    this.limiter.connect(this.audioContext.destination);
  }
}

/** A simple polyphonic WebAudio synthesizer. */
@Injectable({providedIn: 'root'})
export class SynthService {
  private stateValue_: AudioState | null = null;  // Delay until user interaction.

  private volume_ = new BehaviorSubject<number>(0.8);  // Init to about -9 dB.
  private waveform_ = new BehaviorSubject<OscWaveform>('square');

  /** Lazily initializes audio state. */
  private audioState(): AudioState {
    if (this.stateValue_ === null) {
      this.stateValue_ = new AudioState(this.volume_.value);
    }
    return this.stateValue_;
  }

  /**
   * Starts playing a new note with the given frequency. Caller must call stop()
   * on the returned result to halt playback (i.e. for the note off).
   */
  playNoteOn(freqHz: FreqHz): StoppableNote {
    const state = this.audioState();
    const voice = this.getOrCreateFreeVoice_();

    const currentTime = state.audioContext.currentTime;
    voice.osc.frequency.setValueAtTime(freqHz, currentTime);
    voice.ampEnv.gain.setValueAtTime(0.0, currentTime);

    const gainComp = gainCompensation(voice.osc.type as OscWaveform);

    const peakTime = currentTime + ATTACK_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(1.0 * gainComp, peakTime);

    const maxReleaseTime = peakTime + DECAY_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(0.2 * gainComp, maxReleaseTime);

    // Guard against note not being stopped sooner by always releasing after a
    // certain maximum duration (the decay time).
    const maxTrueEndTime = maxReleaseTime + RELEASE_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(0.0, maxTrueEndTime);

    voice.stopTimeSecs = maxTrueEndTime;

    voice.osc.start();

    return {
      stop(): void {
        const actualReleaseTime = state.audioContext.currentTime;
        voice.ampEnv.gain.cancelScheduledValues(actualReleaseTime);

        voice.ampEnv.gain.setValueAtTime(voice.ampEnv.gain.value, actualReleaseTime);

        const actualEndTime = actualReleaseTime + RELEASE_TIME_SECS;
        voice.ampEnv.gain.exponentialRampToValueAtTime(0.0001, actualEndTime);

        const safeStopTime = actualEndTime + STOP_TIME_SECS;
        voice.ampEnv.gain.linearRampToValueAtTime(0.0, safeStopTime);

        voice.osc.stop(safeStopTime);
        voice.stopTimeSecs = safeStopTime;
      }
    };
  }

  volume(): Observable<number> {
    return this.volume_;
  }

  setVolume(volume: number): void {
    if ((volume < 0.0) || (1.0 < volume)) {
      throw Error('SynthService: volume must be in [0.0, 1.0]');
    }

    // Ramp to new volume quickly, but avoid clicks.
    const state = this.audioState();
    state.globalVol.gain.linearRampToValueAtTime(
      scaledVol(volume),
      state.audioContext.currentTime + ATTACK_TIME_SECS);
    this.volume_.next(volume);
  }

  waveform(): Observable<OscWaveform> {
    return this.waveform_;
  }

  setOscWaveform(waveform: OscWaveform): void {
    // Update existing voice oscillators.
    for (const voice of this.audioState().voices) {
      voice.osc.type = waveform;
    }

    this.waveform_.next(waveform);
  }

  private getOrCreateFreeVoice_(): Voice {
    const state = this.audioState();

    const currentTime = state.audioContext.currentTime;

    // Reuse a free voice, if available.
    const freeVoice = state.voices.find(voice => voice.stopTimeSecs < currentTime);
    if (freeVoice) {
      return freeVoice;
    }

    // No free voices; dynamically add another one.
    const osc = newOscillator(state.audioContext, this.waveform_.value);
    const ampEnv = newAmplitudeEnvelope(state.audioContext);

    osc.connect(ampEnv);
    ampEnv.connect(state.globalVol);

    return {osc, ampEnv, stopTimeSecs: currentTime};
  }
}
