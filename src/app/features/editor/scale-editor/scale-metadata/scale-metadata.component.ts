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
} from '@arghotuning/argho-editor';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

import {DegreesDialogComponent} from './degrees-dialog.component';
import {OctavesDialogComponent} from './octaves-dialog.component';

@Component({
  selector: 'app-scale-metadata',
  templateUrl: './scale-metadata.component.html',
  styleUrls: ['./scale-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleMetadataComponent {
  private readonly model: ArghoEditorModel;

  scaleMetadata!: ScaleMetadataSnapshot;

  // Font Awesome icons:
  faEdit = faEdit;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) {
    this.model = data.model;

    // Note: Always called back synchronously.
    this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.scaleMetadata = scaleMetadata;
      changeDetector.markForCheck();
    });
  }

  openDegreesDialog(): void {
    this.dialog.open(DegreesDialogComponent);
  }

  openOctavesDialog(): void {
    this.dialog.open(OctavesDialogComponent);
  }
}
