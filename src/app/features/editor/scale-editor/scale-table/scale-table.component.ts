import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {toFixedClean} from 'src/app/infra/ui/numeric/numeric-util';
import {
  ScaleTableColGroup,
  ScaleTableUiConfig,
} from 'src/app/infra/ui/scale-table/scale-table-ui-config';
import {ScaleTableService} from 'src/app/infra/ui/scale-table/scale-table.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ArghoEditorModel,
  DisplayedIndex,
  DisplayedMidiPitch,
  ScaleRoot,
  UpperDegrees,
} from '@arghotuning/argho-editor';
import {TunedInterval} from '@arghotuning/arghotun';

function toRatioString(tunedInterval: TunedInterval): string {
  const num = tunedInterval.getRatioNumerator();
  const den = tunedInterval.getRatioDenominator();

  const numStr = Number.isInteger(num) ? num.toString() : toFixedClean(num, 4);
  return `${numStr} / ${den}`;
}

export enum ScaleTableCol {
  INPUT_KEY = 'inKey',
  DEG = 'deg',
  MEASURE_FROM = 'from',
  RATIO = 'ratio',
  CENTS = 'cents',
  FREQ = 'freq',
  // TODO: Add support for 12TET comparison.
}

export interface TuningTableRow {
  firstMappedPitch?: DisplayedMidiPitch | null,
  deg: DisplayedIndex;
  measureFrom?: DisplayedIndex,
  ratio?: string;
  cents?: string;
  freqHz: string;
}

@Component({
  selector: 'app-scale-table',
  templateUrl: './scale-table.component.html',
  styleUrls: ['./scale-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleTableComponent {
  ScaleTableCol = ScaleTableCol;

  private readonly model: ArghoEditorModel;

  scaleRoot!: ScaleRoot;
  upperDegrees!: UpperDegrees;

  displayedColumns: ScaleTableCol[] = [];
  dataSource: TuningTableRow[] = [];

  constructor(data: TuningDataService, uiService: ScaleTableService, changeDetector: ChangeDetectorRef) {
    this.model = data.model;

    // Note: All these subscriptions are called back synchronously the first time.

    uiService.config().subscribe(uiConfig => {
      this.updateDisplayedCols_(uiConfig);
      changeDetector.markForCheck();
    });

    this.model.scaleRoot().subscribe(scaleRoot => {
      this.scaleRoot = scaleRoot;
      this.updateTableData_();
      changeDetector.markForCheck();
    });

    this.model.upperDegrees().subscribe(upperDegrees => {
      this.upperDegrees = upperDegrees;
      this.updateTableData_();
      changeDetector.markForCheck();
    });
  }

  private updateDisplayedCols_(uiConfig: ScaleTableUiConfig) {
    const cols: ScaleTableCol[] = [];
    if (uiConfig.colGroups.contains(ScaleTableColGroup.INPUT_KEY)) {
      cols.push(ScaleTableCol.INPUT_KEY);
    }
    cols.push(ScaleTableCol.DEG);
    cols.push(ScaleTableCol.MEASURE_FROM);
    if (uiConfig.colGroups.contains(ScaleTableColGroup.RATIO)) {
      cols.push(ScaleTableCol.RATIO);
    }
    if (uiConfig.colGroups.contains(ScaleTableColGroup.CENTS)) {
      cols.push(ScaleTableCol.CENTS);
    }
    if (uiConfig.colGroups.contains(ScaleTableColGroup.FREQ)) {
      cols.push(ScaleTableCol.FREQ);
    }
    this.displayedColumns = cols;
  }

  private updateTableData_(): void {
    if (!this.scaleRoot || !this.upperDegrees) {
      return;
    }

    this.dataSource = [];

    // Root.
    this.dataSource.push({
      firstMappedPitch: this.scaleRoot.firstMappedPitch,
      deg: new DisplayedIndex(0),
      freqHz: toFixedClean(this.scaleRoot.rootFreqHz, 4),
    });

    // Upper degrees.
    for (const upperDeg of this.upperDegrees.getAll()) {
      this.dataSource.push({
        firstMappedPitch: upperDeg.firstMappedPitch,
        deg: upperDeg.deg,
        measureFrom: upperDeg.measureFrom,
        ratio: toRatioString(upperDeg.tunedInterval),
        cents: toFixedClean(upperDeg.tunedInterval.getCents(), 4),
        freqHz: toFixedClean(upperDeg.freqHz, 4),
      });
    }
  }
}
