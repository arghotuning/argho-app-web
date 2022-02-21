// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {MidiService} from 'src/app/infra/synth/midi.service';
import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorSettings,
  DisplayedMidiPitch,
  PitchLetter,
  SimpleAccidental,
} from '@arghotuning/argho-editor';
import {AccidentalDisplayPref, MidiPitch} from '@arghotuning/arghotun';

const WHITE_KEY_WIDTH_PX = 24;

const WHITE_KEYS_PER_OCTAVE = 7;
const TWO_OCTAVE_WIDTH_PX = (1 + 2 * WHITE_KEYS_PER_OCTAVE) * WHITE_KEY_WIDTH_PX;
const THREE_OCTAVE_WIDTH_PX = (1 + 3 * WHITE_KEYS_PER_OCTAVE) * WHITE_KEY_WIDTH_PX;

const MIDI_PITCHES_PER_OCTAVE = 12;
const MIDI_PITCH_C4 = 60;
const MIDI_PITCH_C9 = 120;

export interface PianoWhiteKey {
  pitch: DisplayedMidiPitch;
  precedesBlackKey?: DisplayedMidiPitch;
}

@Component({
  selector: 'app-piano-keyboard',
  templateUrl: './piano-keyboard.component.html',
  styleUrls: ['./piano-keyboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PianoKeyboardComponent implements AfterViewInit {
  settings!: ArghoEditorSettings;
  displayPref!: AccidentalDisplayPref;

  numOctaves = 0;
  startPitch: MidiPitch | undefined;

  whiteKeys: PianoWhiteKey[] = [];

  activePoints: {[pointerId: number]: MidiPitch} = {};

  constructor(
    data: TuningDataService,
    private readonly midi: MidiService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    // NOTE: Always called back synchronously to start.
    data.model.settings().subscribe(settings => {
      this.settings = settings;
      this.updatePianoKeys_();
      this.changeDetector.markForCheck();
    });

    data.model.tuningMetadata().subscribe(metadata => {
      this.displayPref = metadata.accidentalDisplayPref;
      this.updatePianoKeys_();
      this.changeDetector.markForCheck();
    });

    this.midi.noteOns().subscribe(pitch => {
      this.displayNoteOn_(pitch);
      this.changeDetector.markForCheck();
    });

    this.midi.noteOffs().subscribe(pitch => {
      this.displayNoteOff_(pitch);
      this.changeDetector.markForCheck();
    });
  }

  @ViewChild('pianoKeys')
  pianoKeys: ElementRef<HTMLElement> | undefined;

  ngAfterViewInit(): void {
    this.handleResize();
  }

  handleResize(): void {
    const oldNumOctaves = this.numOctaves;

    this.numOctaves = this.numVisibleOctaves_();
    if (this.numOctaves !== oldNumOctaves) {
      this.updatePianoKeys_();
    }

    this.changeDetector.markForCheck();
  }

  private numVisibleOctaves_(): number {
    if (!this.pianoKeys) {
      return 0;
    }

    const keyboardWidth = this.pianoKeys.nativeElement.clientWidth;
    return (keyboardWidth >= THREE_OCTAVE_WIDTH_PX)
      ? 3
      : (keyboardWidth >= TWO_OCTAVE_WIDTH_PX) ? 2 : 1;
  }

  private updatePianoKeys_(): void {
    this.whiteKeys = [];
    if (this.numOctaves === 0) {
      return;
    }

    if (this.startPitch === undefined) {
      this.startPitch = MIDI_PITCH_C4;
    }
    this.startPitch = Math.min(this.startPitch, this.maxStartPitch_());

    for (let octIndex = 0; octIndex < this.numOctaves; octIndex++) {
      const octStartPitch = this.startPitch + octIndex * MIDI_PITCHES_PER_OCTAVE;

      for (let pc = 0; pc < MIDI_PITCHES_PER_OCTAVE; pc++) {
        const pitch = new DisplayedMidiPitch(octStartPitch + pc, this.displayPref, this.settings);
        if (pitch.accidental === SimpleAccidental.NATURAL) {
          this.whiteKeys.push({
            pitch,
            precedesBlackKey: this.sharpKeyAfter_(pitch),
          });
        }
      }
    }

    // Always end with a top C (no following C#).
    this.whiteKeys.push({
      pitch: new DisplayedMidiPitch(this.endPitch_(), this.displayPref, this.settings),
    });
  }

  private maxStartPitch_(): MidiPitch {
    return MIDI_PITCH_C9 - MIDI_PITCHES_PER_OCTAVE * this.numOctaves;
  }

  private sharpKeyAfter_(pitch: DisplayedMidiPitch): DisplayedMidiPitch | undefined {
    if (pitch.accidental !== SimpleAccidental.NATURAL
      || (pitch.letter !== PitchLetter.C
        && pitch.letter !== PitchLetter.D
        && pitch.letter !== PitchLetter.F
        && pitch.letter !== PitchLetter.G
        && pitch.letter !== PitchLetter.A)) {
      return undefined;
    }

    return new DisplayedMidiPitch(pitch.midiPitch + 1, this.displayPref, this.settings);
  }

  handlePianoKeyDown(event: PointerEvent): void {
    const key = this.keyForTarget_(event.target as HTMLElement);
    if (key === null) {
      return;
    }

    this.activePoints[event.pointerId] = key;
    this.midi.playNoteOn(key);
  }

  keyForTarget_(targetEl: HTMLElement): MidiPitch | null {
    // Find first parent <div> (or self).
    let keyEl = targetEl;
    while (!keyEl.classList.contains('piano-keys')
        && !keyEl.hasAttribute('data-key')) {
      if (!keyEl.parentElement) {
        break;
      }
      keyEl = keyEl.parentElement;
    }

    const keyStr = keyEl.getAttribute('data-key');
    if (!keyStr) {
      return null;
    }

    return parseInt(keyStr, 10);
  }

  handlePianoKeyUp(event: PointerEvent): void {
    const key = this.activePoints[event.pointerId];
    if (!key) {
      return;
    }

    delete this.activePoints[event.pointerId];
    this.midi.stopNote(key);
  }

  private displayNoteOn_(key: MidiPitch): void {
    this.keyElement_(key)?.classList.add('playing');
  }

  private displayNoteOff_(key: MidiPitch): void {
    this.keyElement_(key)?.classList.remove('playing');
  }

  private keyElement_(key: MidiPitch): Element | null {
    if (!this.startPitch || !this.pianoKeys) {
      return null;
    }

    const endPitch = this.endPitch_();
    if ((key < this.startPitch) || (endPitch < key)) {
      return null;
    }

    // Element for key should be present. Find it.
    let whiteKeyIndex = 0;
    let isSharp = false;
    while (whiteKeyIndex < this.whiteKeys.length) {
      const whiteKey = this.whiteKeys[whiteKeyIndex];
      if (whiteKey.pitch.midiPitch === key) {
        break;
      } else if (whiteKey.precedesBlackKey?.midiPitch === key) {
        isSharp = true;
        break;
      }

      whiteKeyIndex++;
    }

    const whiteKeyEls = this.pianoKeys.nativeElement.children;
    if (whiteKeyEls.length <= whiteKeyIndex) {
      return null;  // Shouldn't happen, but guard to be safe.
    }

    const whiteKeyEl = whiteKeyEls[whiteKeyIndex];
    return isSharp ? whiteKeyEl.firstElementChild : whiteKeyEl;
  }

  private endPitch_(): MidiPitch {
    if (!this.startPitch) {
      throw Error('Missing startPitch');
    }
    return this.startPitch + MIDI_PITCHES_PER_OCTAVE * this.numOctaves;
  }
}
