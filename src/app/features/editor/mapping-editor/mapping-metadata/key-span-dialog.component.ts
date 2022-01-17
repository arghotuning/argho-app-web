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
  selector: 'app-key-span-dialog',
  templateUrl: './key-span-dialog.component.html',
  styleUrls: ['./key-span-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeySpanDialogComponent {
  private readonly model: ArghoEditorModel;

  oldKeySpan!: number;
  newKeySpan!: number;

  minValue = ArghoTuningLimits.KEY_SPAN_MIN;
  maxValue = ArghoTuningLimits.KEY_SPAN_MAX;

  isValid = true;

  @ViewChild('keySpanInput')
  keySpanInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<KeySpanDialogComponent>,
  ) {
    this.model = data.model;

    // Note: Called back synchronously the first time.
    this.model.mappedKeys().subscribe(mappedKeys => {
      this.oldKeySpan = mappedKeys.keySpan;
      this.newKeySpan = mappedKeys.keySpan;
      changeDetector.markForCheck();
    });
  }

  handleValueChange(value: string): void {
    // Validate user input.
    const parseResult =
        this.model.inputParser().forMappedKeys().parseKeySpan(value);
    this.isValid = parseResult.hasValidValue();

    if (this.isValid) {
      this.newKeySpan = parseResult.getValue();
      if (this.keySpanInput) {
        this.keySpanInput.nativeElement.value = this.newKeySpan.toString();
      }
    }
  }

  commit(): void {
    this.model.setMappingKeySpan(this.newKeySpan);
    this.dialogRef.close();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
