// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

///  <reference types="@types/webmidi"/>

import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {Injectable} from '@angular/core';
import {DisplayedIndex} from '@arghotuning/argho-editor';
import {MidiPitch} from '@arghotuning/arghotun';

import {StoppableNote, SynthService} from './synth.service';

export enum WebMidiAccessState {
  UNSUPPORTED,
  UNREQUESTED,
  GRANTED,
  DENIED,
}

export interface WebMidiInputPorts {
  readonly inputs: WebMidiInputPort[];
}

export interface WebMidiInputPort {
  readonly id: string;
  readonly name: string;
}

export interface OpenedMidiInput {
  readonly id: string;
  readonly connectionStatus: 'pending' | 'open';
  readonly channel: 'omni' | DisplayedIndex;
}

const STARTING_ACCESS_STATE = navigator['requestMIDIAccess'] ?
    WebMidiAccessState.UNREQUESTED :
    WebMidiAccessState.UNSUPPORTED;

const MIDI_CMD_NOTE_ON = 0x90;
const MIDI_CMD_NOTE_OFF = 0x80;

function midiCommand(msg: WebMidi.MIDIMessageEvent): number {
  return msg.data[0] & 0xF0;
}

function midiChannel(msg: WebMidi.MIDIMessageEvent): number {
  // (Assuming this is a channel-voice message).
  return msg.data[0] & 0x0F;
}

function midiPitch(msg: WebMidi.MIDIMessageEvent): number {
  // (Assuming this is a note on/off message).
  return msg.data[1] & 0x7F;
}

function midiVelocity(msg: WebMidi.MIDIMessageEvent): number {
  // (Assuming this is a note on/off message).
  return msg.data[2] & 0x7F;
}

@Injectable({providedIn: 'root'})
export class MidiService {
  private accessState_ = new BehaviorSubject<WebMidiAccessState>(STARTING_ACCESS_STATE);

  private access_: WebMidi.MIDIAccess | undefined;

  private allInputs_: BehaviorSubject<WebMidiInputPorts> | undefined;
  private activeInput_ = new BehaviorSubject<OpenedMidiInput | null>(null);
  private midiChannel_: 'omni' | DisplayedIndex = 'omni';

  private readonly playingNotes_: {[midiPitch: number]: StoppableNote} = {};
  private noteOns_ = new Subject<MidiPitch>();
  private noteOffs_ = new Subject<MidiPitch>();

  constructor(
    private readonly data: TuningDataService,
    private readonly synth: SynthService,
  ) {}

  noteOns(): Observable<MidiPitch> {
    return this.noteOns_;
  }

  noteOffs(): Observable<MidiPitch> {
    return this.noteOffs_;
  }

  accessState(): Observable<WebMidiAccessState> {
    return this.accessState_;
  }

  requestAccess(): Promise<void> {
    if (this.accessState_.value !== WebMidiAccessState.UNREQUESTED) {
      return Promise.reject();
    }

    return navigator.requestMIDIAccess()
        .then(access => {
          this.access_ = access;
          this.initInputs_();
          this.accessState_.next(WebMidiAccessState.GRANTED);
        })
        .catch(err => {
          this.accessState_.next(WebMidiAccessState.DENIED);
          throw err;
        });
  }

  private initInputs_(): void {
    this.allInputs_ = new BehaviorSubject<WebMidiInputPorts>(this.getAllCurrentInputs_());
    if (this.allInputs_.value.inputs.length >= 1) {
      // Auto open the first input.
      this.openInput(this.allInputs_.value.inputs[0].id);
    }

    this.access_!.addEventListener('statechange', () => {
      this.allInputs_!.next(this.getAllCurrentInputs_());
    });
  }

  private getAllCurrentInputs_(): WebMidiInputPorts {
    const inputs: WebMidiInputPort[] = [];
    this.access_!.inputs.forEach(input => {
      if (input.state === 'disconnected') {
        return;  // Not available to the system.
      }

      inputs.push({
        id: input.id,
        name: input.name || input.id,
      });
    });

    return {inputs};
  }

  activeInput(): Observable<OpenedMidiInput | null> {
    return this.activeInput_;
  }

  allAvailableInputs(): Observable<WebMidiInputPorts> {
    if (!this.allInputs_) {
      throw Error('WebMIDI inputs not available yet');
    }
    return this.allInputs_;
  }

  async closeInput(id: string): Promise<void> {
    const currentActiveInput = this.activeInput_.value;
    if (!currentActiveInput || currentActiveInput.id !== id) {
      return Promise.reject();
    }

    const input = this.access_!.inputs.get(id);
    if (input) {
      await input.close();
    }

    return Promise.resolve();
  }

  async openInput(id: string): Promise<void> {
    if (!this.allInputs_) {
      throw Error('WebMIDI inputs not available yet');
    }

    const currentActiveInput = this.activeInput_.value;
    if (currentActiveInput) {
      if (currentActiveInput.id === id) {
        return Promise.resolve();  // Already opened.
      }

      await this.closeInput(currentActiveInput.id);
    }


    const input = this.access_!.inputs.get(id);
    if (!input) {
      return Promise.reject();
    }

    const midiMessageListener = (msg: WebMidi.MIDIMessageEvent) => this.handleMidiMessage_(msg);

    const stateChangeListener = (connectionEvent: WebMidi.MIDIConnectionEvent) => {
      switch (input.connection) {
        case 'pending':
          this.activeInput_.next({
            id,
            connectionStatus: 'pending',
            channel: this.midiChannel_,
          });
          break;

        case 'open':
          input.addEventListener('midimessage', midiMessageListener);

          this.activeInput_.next({
            id,
            connectionStatus: 'open',
            channel: this.midiChannel_,
          });
          break;

        case 'closed':
          if (this.activeInput_.value?.id === id) {
            this.activeInput_.next(null);
          }

          // Clean these listeners up, since they aren't needed unless the
          // input port is opened again.
          input.removeEventListener('midimessage', midiMessageListener as EventListener);
          input.removeEventListener('statechange', stateChangeListener as EventListener);
          break;
      }
    };
    input.addEventListener('statechange', stateChangeListener);

    // Explicitly open, in case exclusive access is required.
    return input.open().then(() => undefined);
  }

  private handleMidiMessage_(msg: WebMidi.MIDIMessageEvent): void {
    let cmd = midiCommand(msg);

    // Only handle note on & note off messgaes.
    if (cmd !== MIDI_CMD_NOTE_ON && cmd !== MIDI_CMD_NOTE_OFF) {
      return;
    }

    // Only handle if it matches input channel.
    if (this.midiChannel_ !== 'omni') {
      if (midiChannel(msg) !== this.midiChannel_.index) {
        return;
      }
    }

    const pitch = midiPitch(msg);
    const vel = midiVelocity(msg);

    // Interpret note on with velocity 0 the same as a note off.
    if (cmd === MIDI_CMD_NOTE_ON && vel === 0) {
      cmd = MIDI_CMD_NOTE_OFF;
    }

    this.handleNote_(pitch, cmd);
  }

  /** Plays note on from on-screen piano. */
  playNoteOn(pitch: MidiPitch): void {
    this.handleNote_(pitch, MIDI_CMD_NOTE_ON);
  }

  /** Stops note from on-screen piano. */
  stopNote(pitch: MidiPitch): void {
    this.handleNote_(pitch, MIDI_CMD_NOTE_OFF);
  }

  handleNote_(pitch: MidiPitch, cmd: number): void {
    const keyToSoundMap = this.data.keyToSoundMap();
    if (!keyToSoundMap.isMapped(pitch)) {
      return;  // Unmapped.
    }

    const freqHz = keyToSoundMap.mappedSoundFor(pitch).freqHz;
    const currentlyPlayingNote = this.playingNotes_[pitch];

    switch (cmd) {
      case MIDI_CMD_NOTE_ON:
        if (currentlyPlayingNote) {
          currentlyPlayingNote.stop();
        }
        this.playingNotes_[pitch] = this.synth.playNoteOn(freqHz);
        this.noteOns_.next(pitch);
        break;

      case MIDI_CMD_NOTE_OFF:
        if (currentlyPlayingNote) {
          currentlyPlayingNote.stop();
          delete this.playingNotes_[pitch];
        }
        this.noteOffs_.next(pitch);
        break;
    }
  }

  setMidiChannel(ch: 'omni' | DisplayedIndex): void {
    if (this.midiChannel_ === ch) {
      return;
    }
    this.midiChannel_ = ch;

    const activeInput = this.activeInput_.value;
    if (activeInput) {
      this.activeInput_.next({
        id: activeInput.id,
        connectionStatus: activeInput.connectionStatus,
        channel: this.midiChannel_,
      });
    }
  }
}
