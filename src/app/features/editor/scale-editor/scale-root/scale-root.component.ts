// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {toFixedClean} from 'src/app/infra/ui/numeric/numeric-util';
import {simpleAccidentalStr} from 'src/app/infra/ui/spelled-pitch/spelled-pitch-util';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorModel,
  ArghoEditorSettings,
  DisplayedMidiPitch,
  ScaleRoot,
  TuningMetadataSnapshot,
} from '@arghotuning/argho-editor';
import {
  ArghoTuningLimits,
  RootScaleDegreeSpecType,
} from '@arghotuning/arghotun';

const MIDI_PITCH_A4 = 69;

@Component({
  selector: 'app-scale-root',
  templateUrl: './scale-root.component.html',
  styleUrls: ['./scale-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleRootComponent {
  RootScaleDegreeSpecType = RootScaleDegreeSpecType;

  private readonly model: ArghoEditorModel;

  scaleRoot!: ScaleRoot;
  globalTunePitch!: DisplayedMidiPitch;

  tuningMetadata!: TuningMetadataSnapshot;

  @ViewChild('globalTuneInput')
  globalTuneInput: ElementRef<HTMLInputElement> | undefined;

  minGlobalTune = ArghoTuningLimits.GLOBAL_TUNE_A4_HZ_MIN;
  maxGlobalTune = ArghoTuningLimits.GLOBAL_TUNE_A4_HZ_MAX;

  @ViewChild('exactFreqInput')
  exactFreqInput: ElementRef<HTMLInputElement> | undefined;

  minFreqHz = ArghoTuningLimits.FREQ_HZ_MIN;
  maxFreqHz = ArghoTuningLimits.FREQ_HZ_MAX;

  @ViewChild('nearestPitchInput')
  nearestPitchInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('centsOffsetInput')
  centsOffsetInput: ElementRef<HTMLInputElement> | undefined;

  minCentsOffset = ArghoTuningLimits.CENTS_FROM_NEAREST_12TET_MIN;
  maxCentsOffset = ArghoTuningLimits.CENTS_FROM_NEAREST_12TET_MAX;

  constructor(data: TuningDataService, changeDetector: ChangeDetectorRef) {
    this.model = data.model;

    // TODO: Add globalTunePitch to ArghoEditorModel directly.
    let settings: ArghoEditorSettings;
    this.model.settings().subscribe(s => settings = s);

    this.model.tuningMetadata().subscribe(tm => this.tuningMetadata = tm);

    // Note: Always called back synchronously.
    this.model.scaleRoot().subscribe(scaleRoot => {
      this.scaleRoot = scaleRoot;

      this.globalTunePitch = new DisplayedMidiPitch(
        MIDI_PITCH_A4, this.tuningMetadata.accidentalDisplayPref, settings);

      changeDetector.markForCheck();
    });
  }

  globalTuneStrValue(): string {
    return toFixedClean(this.scaleRoot.globalTuneA4Hz, 2);
  }

  async handleGlobalTuneBlur(): Promise<void> {
    if (!this.globalTuneInput) {
      return;
    }

    const parseResult = this.model.inputParser().forScaleRoot()
      .parseGlobalTuneA4Hz(this.globalTuneInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      await this.model.setGlobalTuneA4Hz(parseResult.getValue());
    }

    this.globalTuneInput.nativeElement.value = this.globalTuneStrValue();
  }

  async handleSpecTypeChanged(specType: RootScaleDegreeSpecType): Promise<void> {
    switch (specType) {
      case RootScaleDegreeSpecType.EXACT_FREQ:
        return this.model.setScaleRootExactFreqHz(this.scaleRoot.rootFreqHz);

      case RootScaleDegreeSpecType.RELATIVE_TO_12TET_MIDI_PITCH:
        const pitch = this.scaleRoot.nearestMidiPitch;
        return this.model.setScaleRoot12tetRelative(
          pitch.midiPitch, this.scaleRoot.centsFrom12tet,
          this.tuningMetadata.accidentalDisplayPref);
    }
  }

  exactFreqStrValue(): string {
    return toFixedClean(this.scaleRoot.rootFreqHz, 4);
  }

  async handleExactFreqBlur(): Promise<void> {
    if (!this.exactFreqInput) {
      return;
    }

    const parseResult = this.model.inputParser().forScaleRoot()
      .parseExactFreqHz(this.exactFreqInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      await this.model.setScaleRootExactFreqHz(parseResult.getValue());
    }

    this.exactFreqInput.nativeElement.value = this.exactFreqStrValue();
  }

  nearestPitchStrValue(): string {
    const pitch = this.scaleRoot.nearestMidiPitch;
    return pitch.letter + simpleAccidentalStr(pitch.accidental) + pitch.octaveNumber;
  }

  async handleNearestPitchBlur(): Promise<void> {
    if (!this.nearestPitchInput) {
      return;
    }

    const parseResult = this.model.inputParser().forScaleRoot()
      .parseNearestMidiPitch(this.nearestPitchInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      const update = parseResult.getValue();
      await this.model.setScaleRoot12tetRelative(
        update.nearestMidiPitch, update.centsFrom12tet, update.displayPref);
    }

    this.nearestPitchInput.nativeElement.value = this.nearestPitchStrValue();
  }

  centsOffsetStrValue(): string {
    return toFixedClean(this.scaleRoot.centsFrom12tet, 4);
  }

  async handleCentsOffsetBlur(): Promise<void> {
    if (!this.centsOffsetInput) {
      return;
    }

    const parseResult = this.model.inputParser().forScaleRoot()
      .parseCentsFrom12tet(this.centsOffsetInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      const update = parseResult.getValue();
      await this.model.setScaleRoot12tetRelative(
        update.nearestMidiPitch, update.centsFrom12tet, update.displayPref);
    }

    this.centsOffsetInput.nativeElement.value = this.centsOffsetStrValue();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
