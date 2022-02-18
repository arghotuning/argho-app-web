// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  ArghoEditorModel,
  ScaleMetadataSnapshot,
  TuningEditMode,
} from '@arghotuning/argho-editor';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

import {TuningResizeDialogComponent} from './tuning-resize-dialog.component';

@Component({
  selector: 'app-tuning-size',
  templateUrl: './tuning-size.component.html',
  styleUrls: ['./tuning-size.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningSizeComponent {
  private readonly model: ArghoEditorModel;

  isBasic = true;
  scaleMetadata!: ScaleMetadataSnapshot;
  keySpan!: number;

  // Font Awesome icons:
  faEdit = faEdit;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) {
    this.model = data.model;

    // Note: Below calls are always called back synchronously.
    this.model.tuningMetadata().subscribe(tuningMetadata => {
      this.isBasic = (tuningMetadata.editMode === TuningEditMode.BASIC);
      changeDetector.markForCheck();
    });

    this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.scaleMetadata = scaleMetadata;
      changeDetector.markForCheck();
    });

    this.model.mappedKeys().subscribe(mappedKeys => {
      this.keySpan = mappedKeys.keySpan;
      changeDetector.markForCheck();
    });
  }

  openResizeDialog(): void {
    this.dialog.open(TuningResizeDialogComponent);
  }
}
