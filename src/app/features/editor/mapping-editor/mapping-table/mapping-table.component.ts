import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {ArghoEditorModel, MappedKeys} from '@arghotuning/argho-editor';

@Component({
  selector: 'app-mapping-table',
  templateUrl: './mapping-table.component.html',
  styleUrls: ['./mapping-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingTableComponent {
  private readonly model: ArghoEditorModel;

  mappedKeys!: MappedKeys;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
  ) {
    this.model = data.model;

    // Note: Subscriptions are called back synchronously the first time.
    this.model.mappedKeys().subscribe(mappedKeys => {
      this.mappedKeys = mappedKeys;
      this.updateTableData_();
      changeDetector.markForCheck();
    });
  }

  private updateTableData_() {
    // TODO.
  }
}
