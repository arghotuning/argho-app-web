// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import fscreen from 'fscreen';
import {MidiService} from 'src/app/infra/synth/midi.service';
import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorSettings,
  DisplayedMidiPitch,
  PitchLetter,
  SimpleAccidental,
} from '@arghotuning/argho-editor';
import {AccidentalDisplayPref, MidiPitch} from '@arghotuning/arghotun';
import {SizeProp} from '@fortawesome/fontawesome-svg-core';
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faDownLeftAndUpRightToCenter,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';

const BASE_WHITE_KEY_WIDTH_PX = 24;
const BASE_WHITE_KEY_HEIGHT_PX = 100;
const BASE_CONTROLS_WIDTH_PX = 32;

const WHITE_KEYS_PER_OCTAVE = 7;
const NUM_WHITE_KEYS_3OCT = 1 + 3 * WHITE_KEYS_PER_OCTAVE;
const NUM_WHITE_KEYS_2OCT = 1 + 2 * WHITE_KEYS_PER_OCTAVE;
const NUM_WHITE_KEYS_1OCT = 1 + 1 * WHITE_KEYS_PER_OCTAVE;

const MIDI_PITCH_MIN = 0;
const MIDI_PITCHES_PER_OCTAVE = 12;
const MIDI_PITCH_C3 = 48;
const MIDI_PITCH_C9 = 120;

const MAX_SCALE_RATIO = 2.5;
const MIN_AREA_RATIO_TO_PREFER_2OCT = 0.45;

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
export class PianoKeyboardComponent implements AfterViewInit, OnDestroy {
  settings!: ArghoEditorSettings;
  displayPref!: AccidentalDisplayPref;

  numOctaves = 0;
  startPitch: MidiPitch | undefined;

  whiteKeys: PianoWhiteKey[] = [];

  activePoints: {[pointerId: number]: MidiPitch} = {};

  supportsFullScreen = fscreen.fullscreenEnabled;
  isFullScreen = false;
  fullScreenHandler: (() => void) | undefined;

  controlIconSize: SizeProp = '1x';

  @ViewChild('pianoContainer')
  pianoContainer: ElementRef<HTMLElement> | undefined;

  @ViewChild('pianoKeys')
  pianoKeys: ElementRef<HTMLElement> | undefined;

  // Icons:
  faCircleArrowLeft = faCircleArrowLeft;
  faCircleArrowRight = faCircleArrowRight;
  faExpand = faExpand;
  faDownLeftAndUpRightToCenter = faDownLeftAndUpRightToCenter;

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

    this.fullScreenHandler = () => { this.handleResize(); };
    fscreen.addEventListener('fullscreenchange', this.fullScreenHandler);
  }

  ngAfterViewInit(): void {
    this.handleResize();
  }

  ngOnDestroy(): void {
    if (this.fullScreenHandler) {
      fscreen.removeEventListener('fullscreenchange', this.fullScreenHandler);
    }
  }

  handleResize(): void {
    const oldNumOctaves = this.numOctaves;

    this.maybeResize_();
    if (this.numOctaves !== oldNumOctaves) {
      this.updatePianoKeys_();
    }

    this.changeDetector.markForCheck();
  }

  private maybeResize_(): void {
    if (!this.pianoContainer) {
      return;
    }

    const isTrulyFullScreen = this.isFullScreen
      && (fscreen.fullscreenElement === this.pianoContainer.nativeElement);
    const containerWidthPx = this.pianoContainer.nativeElement.clientWidth;

    let keyScaleFactor = 1.0;
    if (isTrulyFullScreen) {
      const containerHeightPx = this.pianoContainer.nativeElement.clientHeight;
      const containerArea = containerWidthPx * containerHeightPx;

      // Don't scale keys to be taller than screen height.
      const maxHeightScaleFactor =
        Math.min(containerHeightPx / BASE_WHITE_KEY_HEIGHT_PX, MAX_SCALE_RATIO);

      // Figure out max scale factor for 1, 2, and 3 octave widths.
      const baseWidth1OctPx = BASE_CONTROLS_WIDTH_PX
        + NUM_WHITE_KEYS_1OCT * BASE_WHITE_KEY_WIDTH_PX;
      const scaleFactor1Oct =
        Math.min(containerWidthPx / baseWidth1OctPx, maxHeightScaleFactor, MAX_SCALE_RATIO);
      const area1Oct = (scaleFactor1Oct * baseWidth1OctPx)
        * (scaleFactor1Oct * BASE_WHITE_KEY_HEIGHT_PX);

      const baseWidth2OctPx = BASE_CONTROLS_WIDTH_PX
        + NUM_WHITE_KEYS_2OCT * BASE_WHITE_KEY_WIDTH_PX;
      const scaleFactor2Oct =
        Math.min(containerWidthPx / baseWidth2OctPx, maxHeightScaleFactor, MAX_SCALE_RATIO);
      const area2Oct = (scaleFactor2Oct * baseWidth2OctPx)
        * (scaleFactor2Oct * BASE_WHITE_KEY_HEIGHT_PX);

      const baseWidth3OctPx = BASE_CONTROLS_WIDTH_PX
        + NUM_WHITE_KEYS_3OCT * BASE_WHITE_KEY_WIDTH_PX;
      const scaleFactor3Oct =
        Math.min(containerWidthPx / baseWidth3OctPx, maxHeightScaleFactor, MAX_SCALE_RATIO);
      const area3Oct = (scaleFactor3Oct * baseWidth3OctPx)
        * (scaleFactor3Oct * BASE_WHITE_KEY_HEIGHT_PX);

      // Chose scaling that fills max area of screen, but only choose 1 octave
      // if 2 octaves would be too small.
      const maxArea = Math.max(area3Oct, area2Oct, area1Oct);
      if (maxArea === area3Oct) {
        keyScaleFactor = scaleFactor3Oct;
      } else if ((maxArea === area2Oct)
          || (area2Oct / containerArea >= MIN_AREA_RATIO_TO_PREFER_2OCT)) {
        keyScaleFactor = scaleFactor2Oct;
      } else {
        keyScaleFactor = scaleFactor1Oct;
      }
    }

    // With scale factor chosen, fit as many octaves as possible.
    const controlsWidthPx = Math.floor(keyScaleFactor * BASE_CONTROLS_WIDTH_PX);
    const whiteKeyWidthPx = Math.floor(keyScaleFactor * BASE_WHITE_KEY_WIDTH_PX);
    const whiteKeyHeightPx = Math.floor(keyScaleFactor * BASE_WHITE_KEY_HEIGHT_PX);
    this.scaleKeys_(controlsWidthPx, whiteKeyWidthPx, whiteKeyHeightPx);
    this.scaleControls_(keyScaleFactor);

    const keyboardWidth = containerWidthPx - controlsWidthPx;
    const maxNumWhiteKeys = Math.floor(keyboardWidth / whiteKeyWidthPx);
    this.numOctaves = (maxNumWhiteKeys >= NUM_WHITE_KEYS_3OCT)
      ? 3
      : (maxNumWhiteKeys >= NUM_WHITE_KEYS_2OCT) ? 2 : 1;
  }

  private scaleKeys_(
    controlsWidthPx: number,
    whiteKeyWidthPx: number,
    whiteKeyHeightPx: number,
  ): void {
    if (!this.pianoContainer) {
      return;
    }

    const style = this.pianoContainer.nativeElement.style;
    style.setProperty('--piano-controls-width', controlsWidthPx + 'px');
    style.setProperty('--white-key-width', whiteKeyWidthPx + 'px');
    style.setProperty('--white-key-height', whiteKeyHeightPx + 'px');
  }

  private scaleControls_(keyScaleFactor: number): void {
    this.controlIconSize = (keyScaleFactor >= 1.5) ? '2x' : '1x';
  }

  private updatePianoKeys_(): void {
    this.whiteKeys = [];
    if (this.numOctaves === 0) {
      return;
    }

    if (this.startPitch === undefined) {
      this.startPitch = MIDI_PITCH_C3;
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
    if (key === undefined) {
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
    if (this.startPitch === undefined || !this.pianoKeys) {
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
    if (this.startPitch === undefined) {
      throw Error('Missing startPitch');
    }
    return this.startPitch + MIDI_PITCHES_PER_OCTAVE * this.numOctaves;
  }

  canShiftOctaveDown(): boolean {
    if (this.startPitch === undefined) {
      return false;
    }

    return (MIDI_PITCH_MIN <= this.startPitch - MIDI_PITCHES_PER_OCTAVE);
  }

  canShiftOctaveUp(): boolean {
    if (this.startPitch === undefined) {
      return false;
    }

    return (this.startPitch + MIDI_PITCHES_PER_OCTAVE <= this.maxStartPitch_());
  }

  shiftByOctaves(numOctaves: number): void {
    if (this.startPitch === undefined) {
      return;
    }

    this.startPitch += numOctaves * MIDI_PITCHES_PER_OCTAVE;
    this.updatePianoKeys_();
  }

  toggleFullScreen(): void {
    if (!this.pianoContainer) {
      return;
    }

    if (this.isFullScreen) {
      fscreen.exitFullscreen();
      this.pianoContainer.nativeElement.classList.remove('fullscreen');
    } else {
      fscreen.requestFullscreen(this.pianoContainer.nativeElement);
      this.pianoContainer.nativeElement.classList.add('fullscreen');
    }

    this.isFullScreen = !this.isFullScreen;
  }
}
