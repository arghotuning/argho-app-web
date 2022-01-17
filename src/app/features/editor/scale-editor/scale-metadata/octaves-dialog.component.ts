// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ArghoEditorModel} from '@arghotuning/argho-editor';
import {ArghoTuningLimits} from '@arghotuning/arghotun';

@Component({
  selector: 'app-octaves-dialog',
  templateUrl: './octaves-dialog.component.html',
  styleUrls: ['./octaves-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OctavesDialogComponent {
  private readonly model: ArghoEditorModel;

  oldNumOctaves!: number;
  newNumOctaves!: number;

  minValue = ArghoTuningLimits.OCTAVES_SPANNED_MIN;
  maxValue = ArghoTuningLimits.OCTAVES_SPANNED_MAX;

  isValid = true;

  @ViewChild('numOctavesInput')
  numOctavesInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<OctavesDialogComponent>,
  ) {
    this.model = data.model;

    // Note: Always called back synchronously.
    this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.oldNumOctaves = scaleMetadata.octavesSpanned;
      this.newNumOctaves = scaleMetadata.octavesSpanned;
      changeDetector.markForCheck();
    });
  }

  handleValueChange(value: string): void {
    // Validate user input.
    const parseResult =
      this.model.inputParser().forScaleMetadata().parseOctavesSpanned(value);
    this.isValid = parseResult.hasValidValue();

    if (parseResult.hasValidValue()) {
      this.newNumOctaves = parseResult.getValue();
      if (this.numOctavesInput) {
        this.numOctavesInput.nativeElement.value = this.newNumOctaves.toString();
      }
    }
  }

  commit(): void {
    this.model.setOctavesSpanned(this.newNumOctaves);
    this.dialogRef.close();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
