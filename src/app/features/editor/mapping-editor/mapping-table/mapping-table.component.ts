import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ArghoEditorModel,
  DisplayedIndex,
  DisplayedMidiPitch,
  MappedKeys,
} from '@arghotuning/argho-editor';

export interface MappingTableRow {
  editable: boolean;
  key: DisplayedIndex,
  pitch?: DisplayedMidiPitch | null,
  mappedDeg: DisplayedIndex | null,
}

// NOTE: These must match up with .mat-column-* suffixes in CSS.
enum MappingTableCol {
  NUM = 'num',
  KEY = 'key',
  DEG = 'deg',
}

@Component({
  selector: 'app-mapping-table',
  templateUrl: './mapping-table.component.html',
  styleUrls: ['./mapping-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingTableComponent {
  MappingTableCol = MappingTableCol;

  private readonly model: ArghoEditorModel;

  mappedKeys!: MappedKeys;

  columns: MappingTableCol[] = [
    MappingTableCol.NUM,
    MappingTableCol.KEY,
    MappingTableCol.DEG,
  ];

  dataSource: MappingTableRow[] = [];

  showPopupEditor = false;
  private popupEditorKeyIndex_: number | null = null;

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
    this.dataSource = this.mappedKeys.getAll().map(mappedKey => {
      return {
        editable: mappedKey.key.index !== 0,
        key: mappedKey.key,
        pitch: mappedKey.inputPitch,
        mappedDeg: mappedKey.mappedDegree,
      };
    });
  }

  handleTableClick(e: MouseEvent) {
    // TODO...
  }
}
