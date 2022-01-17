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

const audioContext = new window.AudioContext();

const ATTACK_TIME_SECS = 0.04;
const DECAY_TIME_SECS = 10.0;
const RELEASE_TIME_SECS = 0.3;
const STOP_TIME_SECS = 0.2;

function newGlobalVolume(): GainNode {
  const globalVol = audioContext.createGain();
  globalVol.gain.setValueAtTime(0.35, audioContext.currentTime);  // About -9 dB.
  return globalVol;
}

function newLimiter(): DynamicsCompressorNode {
  // Best currently available in WebAudio API is a 20:1 compressor.
  // Ideally, this would be a lookahead brickwall limiter.
  const limiter = audioContext.createDynamicsCompressor();

  const currentTime = audioContext.currentTime;
  limiter.threshold.setValueAtTime(-3 /* dB */, currentTime);
  limiter.ratio.setValueAtTime(20 /* 20:1 */, currentTime);
  limiter.attack.setValueAtTime(0 /* s */, currentTime);
  limiter.release.setValueAtTime(0.1 /* s */, currentTime);
  limiter.knee.setValueAtTime(0 /* hard knee */, currentTime);

  return limiter;
}

export type OscWaveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

function newOscillator(waveform: OscWaveform): OscillatorNode {
  const osc = audioContext.createOscillator();
  osc.type = waveform;
  return osc;
}

function newAmplitudeEnvelope(): GainNode {
  const ampEnv = audioContext.createGain();
  ampEnv.gain.setValueAtTime(0, audioContext.currentTime);
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

/** A simple polyphonic WebAudio synthesizer. */
@Injectable({providedIn: 'root'})
export class SynthService {
  private readonly voices_: Voice[] = [];
  private readonly globalVol_: GainNode;
  private readonly limiter_: DynamicsCompressorNode;

  private waveform_ = new BehaviorSubject<OscWaveform>('square');

  constructor() {
    this.globalVol_ = newGlobalVolume();
    this.limiter_ = newLimiter();

    this.globalVol_.connect(this.limiter_);
    this.limiter_.connect(audioContext.destination);
  }

  /**
   * Starts playing a new note with the given frequency. Caller must call stop()
   * on the returned result to halt playback (i.e. for the note off).
   */
  playNoteOn(freqHz: FreqHz): StoppableNote {
    const voice = this.getOrCreateFreeVoice_();

    const currentTime = audioContext.currentTime;
    voice.osc.frequency.setValueAtTime(freqHz, currentTime);
    voice.ampEnv.gain.setValueAtTime(0.0, currentTime);

    const peakTime = currentTime + ATTACK_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(1.0, peakTime);

    const maxReleaseTime = peakTime + DECAY_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(0.2, maxReleaseTime);

    // Guard against note not being stopped sooner by always releasing after a
    // certain maximum duration (the decay time).
    const maxTrueEndTime = maxReleaseTime + RELEASE_TIME_SECS;
    voice.ampEnv.gain.linearRampToValueAtTime(0.0, maxTrueEndTime);

    voice.stopTimeSecs = maxTrueEndTime;

    voice.osc.start();

    return {
      stop() {
        const actualReleaseTime = audioContext.currentTime;
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

  waveform(): Observable<OscWaveform> {
    return this.waveform_;
  }

  setOscWaveform(waveform: OscWaveform): void {
    // Update existing voice oscillators.
    for (const voice of this.voices_) {
      voice.osc.type = waveform;
    }

    this.waveform_.next(waveform);
  }

  private getOrCreateFreeVoice_(): Voice {
    const currentTime = audioContext.currentTime;

    // Reuse a free voice, if available.
    const freeVoice = this.voices_.find(voice => voice.stopTimeSecs < currentTime);
    if (freeVoice) {
      return freeVoice;
    }

    // No free voices; dynamically add another one.
    const osc = newOscillator(this.waveform_.value);
    const ampEnv = newAmplitudeEnvelope();

    osc.connect(ampEnv);
    ampEnv.connect(this.globalVol_);

    return {osc, ampEnv, stopTimeSecs: currentTime};
  }
}
