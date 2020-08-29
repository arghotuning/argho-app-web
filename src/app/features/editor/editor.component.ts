import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {Component} from '@angular/core';
import {
  ArghoEditorModel,
  TuningMetadataSnapshot,
} from '@arghotuning/argho-editor';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  tuningMetadata!: TuningMetadataSnapshot;

  constructor(data: TuningDataService) {
    // Note: Subscription is always called synchronously.
    data.model.tuningMetadata().subscribe(metadata => {
      this.tuningMetadata = metadata;
    });
  }
}
