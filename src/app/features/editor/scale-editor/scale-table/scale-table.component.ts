import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {toFixedClean} from 'src/app/infra/ui/numeric/numeric-util';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ArghoEditorModel,
  DisplayedIndex,
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

export interface TuningTableRow {
  deg: DisplayedIndex;
  cents?: string;
  ratio?: string;
  freqHz: string;
}

@Component({
  selector: 'app-scale-table',
  templateUrl: './scale-table.component.html',
  styleUrls: ['./scale-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleTableComponent {
  private readonly model: ArghoEditorModel;

  scaleRoot: ScaleRoot | undefined;
  upperDegrees: UpperDegrees | undefined;

  displayedColumns: string[] = ['deg', 'ratio', 'cents', 'freq'];
  dataSource: TuningTableRow[] = [];

  constructor(data: TuningDataService, changeDetector: ChangeDetectorRef) {
    this.model = data.model;

    // Note: Always called back synchronously.
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

  private updateTableData_(): void {
    if (!this.scaleRoot || !this.upperDegrees) {
      return;
    }

    this.dataSource = [];

    // Root.
    this.dataSource.push({
      deg: new DisplayedIndex(0),
      freqHz: toFixedClean(this.scaleRoot.rootFreqHz, 4),
    });

    // Upper degrees.
    for (const upperDeg of this.upperDegrees.getAll()) {
      this.dataSource.push({
        deg: upperDeg.deg,
        cents: toFixedClean(upperDeg.tunedInterval.getCents(), 4),
        ratio: toRatioString(upperDeg.tunedInterval),
        freqHz: toFixedClean(upperDeg.freqHz, 4),
      });
    }
  }
}
