// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {
  ArghoEditorModel,
  ScaleMetadataSnapshot,
  TuningEditMode,
} from '@arghotuning/argho-editor';
import {ArghoTuningLimits} from '@arghotuning/arghotun';

// TODO: Export & share this from argho-editor-js library.
const MIDI_PITCHES_PER_OCTAVE = 12;

// TODO: Enforce this from argho-editor-js library.
const BASIC_MODE_MAX_OCTAVES = 10;

@Component({
  selector: 'app-tuning-resize-dialog',
  templateUrl: './tuning-resize-dialog.component.html',
  styleUrls: ['./tuning-resize-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningResizeDialogComponent extends BaseComponent {
  private readonly model: ArghoEditorModel;

  minOctavesValue = ArghoTuningLimits.OCTAVES_SPANNED_MIN;
  maxOctavesValue = ArghoTuningLimits.OCTAVES_SPANNED_MAX;

  minDegreesValue = ArghoTuningLimits.SCALE_DEGREES_MIN;
  maxDegreesValue = ArghoTuningLimits.SCALE_DEGREES_MAX;

  minKeysValue = ArghoTuningLimits.KEY_SPAN_MIN;
  maxKeysValue = ArghoTuningLimits.KEY_SPAN_MAX;

  // Current state of tuning model:
  isBasic = true;
  canSwitchToBasic = true;
  scaleMetadata!: ScaleMetadataSnapshot;
  keySpan!: number;

  // Pending edit state:
  pendingMode = 'basic';
  pendingNumOctaves!: number;
  pendingNumDegrees!: number;
  pendingNumKeys!: number;
  isValid = true;

  @ViewChild('numOctavesInput')
  numOctavesInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('numDegreesInput')
  numDegreesInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('numKeysInput')
  numKeysInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<TuningResizeDialogComponent>,
  ) {
    super();
    this.model = data.model;

    // Note: Below calls are always called back synchronously.
    this.track(this.model.tuningMetadata().subscribe(tuningMetadata => {
      this.isBasic = (tuningMetadata.editMode === TuningEditMode.BASIC);
      this.canSwitchToBasic = this.model.canSwitchToBasicMode();
      if (!this.canSwitchToBasic) {
        this.handleModeChange('advanced');
      }
      changeDetector.markForCheck();
    }));

    this.track(this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.scaleMetadata = scaleMetadata;
      changeDetector.markForCheck();
    }));

    this.track(this.model.mappedKeys().subscribe(mappedKeys => {
      this.keySpan = mappedKeys.keySpan;
      changeDetector.markForCheck();
    }));

    this.pendingNumOctaves = this.scaleMetadata.octavesSpanned;
    this.pendingNumDegrees = this.scaleMetadata.numDegrees;
    this.pendingNumKeys = this.keySpan;
    this.handleModeChange(this.isBasic ? 'basic' : 'advanced');
  }

  handleModeChange(pendingMode: string): void {
    this.pendingMode = pendingMode;
    if (this.pendingMode === 'basic') {
      this.maybeEnforceBasicModeSize_();
      this.maxOctavesValue = BASIC_MODE_MAX_OCTAVES;
    } else {
      this.maxOctavesValue = ArghoTuningLimits.OCTAVES_SPANNED_MAX;
    }
  }

  private maybeEnforceBasicModeSize_(): void {
    if (this.pendingMode !== 'basic') {
      return;
    }

    const numDegs = MIDI_PITCHES_PER_OCTAVE * this.pendingNumOctaves;

    this.pendingNumDegrees = numDegs;
    if (this.numDegreesInput) {
      this.numDegreesInput.nativeElement.value = this.pendingNumDegrees.toString();
    }

    this.pendingNumKeys = numDegs;
    if (this.numKeysInput) {
      this.numKeysInput.nativeElement.value = this.pendingNumKeys.toString();
    }
  }

  handleInputChanges(): void {
    if (!this.numOctavesInput || !this.numDegreesInput || !this.numKeysInput) {
      return;
    }

    // Octaves:
    const octavesResult =
      this.model.inputParser().forScaleMetadata().parseOctavesSpanned(this.numOctavesInput.nativeElement.value);
    if (octavesResult.hasValidValue()) {
      if (this.pendingNumOctaves !== octavesResult.getValue()) {
        this.pendingNumOctaves = octavesResult.getValue();
        this.maybeEnforceBasicModeSize_();
      }
      this.numOctavesInput.nativeElement.value = this.pendingNumOctaves.toString();
    }

    // Degrees:
    const degreesResult =
      this.model.inputParser().forScaleMetadata().parseNumScaleDegrees(this.numDegreesInput.nativeElement.value);
    if (degreesResult.hasValidValue()) {
      this.pendingNumDegrees = degreesResult.getValue();
      this.numDegreesInput.nativeElement.value = this.pendingNumDegrees.toString();
    }

    // Keys:
    const keysResult =
      this.model.inputParser().forMappedKeys().parseKeySpan(this.numKeysInput.nativeElement.value);
    if (keysResult.hasValidValue()) {
      this.pendingNumKeys = keysResult.getValue();
      this.numKeysInput.nativeElement.value = this.pendingNumKeys.toString();
    }

    // Overall validation status:
    this.isValid = octavesResult.hasValidValue()
      && degreesResult.hasValidValue()
      && keysResult.hasValidValue();
  }

  async commit(): Promise<void> {
    if (this.pendingMode === 'basic') {
      await this.model.setEditMode(TuningEditMode.BASIC);
      await this.model.editBasic().resetNumBasicOctaves(this.pendingNumOctaves);
    } else {
      await this.model.setEditMode(TuningEditMode.ADVANCED);

      const resizeOp = this.model
        .resize()
        .toOctaves(this.pendingNumOctaves)
        .toDegrees(this.pendingNumDegrees)
        .toKeySpan(this.pendingNumKeys);
      // TODO: Add UI controls for new degree + key default initialization.
      await this.model.editAdvanced().resetTuningSize(resizeOp);
    }

    this.dialogRef.close();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
