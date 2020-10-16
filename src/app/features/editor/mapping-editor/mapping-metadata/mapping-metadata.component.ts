import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ArghoEditorModel, DisplayedMidiPitch} from '@arghotuning/argho-editor';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

import {KeySpanDialogComponent} from './key-span-dialog.component';

@Component({
  selector: 'app-mapping-metadata',
  templateUrl: './mapping-metadata.component.html',
  styleUrls: ['./mapping-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingMetadataComponent {
  private readonly model: ArghoEditorModel;

  keySpan!: number;
  mappingRoot!: DisplayedMidiPitch;

  // Font Awesome icons:
  faEdit = faEdit;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) {
    this.model = data.model;

    // Note: Subscriptions called by synchronously the first time.
    this.model.mappedKeys().subscribe(mappedKeys => {
      this.keySpan = mappedKeys.keySpan;
      this.mappingRoot = mappedKeys.get(0).inputPitch!;

      changeDetector.markForCheck();
    });
  }

  openKeySpanDialog(): void {
    this.dialog.open(KeySpanDialogComponent);
  }
}
