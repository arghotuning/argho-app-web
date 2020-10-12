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
  ElementRef,
  HostListener,
  ViewChild,
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
  return `${numStr}\xa0/\xa0${den}`;  // '\xa0' is &nbsp; non-breaking space.
}

// NOTE: These must match up with .mat-column-* suffixes in CSS.
export enum ScaleTableCol {
  INPUT_KEY = 'inKey',
  DEG = 'deg',
  MEASURE_FROM = 'from',
  RATIO = 'ratio',
  CENTS = 'cents',
  FREQ = 'freq',
  // TODO: Add support for 12TET comparison.
}

function colForCell(cellEl: Element): ScaleTableCol {
  for (const col of Object.values(ScaleTableCol)) {
    if (cellEl.classList.contains('mat-column-' + col)) {
      return col;
    }
  }
  throw Error('Scale Table: unexpected column!');
}

export interface TuningTableRow {
  editable: boolean;
  firstMappedPitch?: DisplayedMidiPitch | null,
  deg: DisplayedIndex;
  measureFrom?: DisplayedIndex,
  ratio?: string;
  cents?: string;
  freqHz: string;
}

/** Type of action to take when popup editor is dismissed. */
const enum PopupEditorAction {DISCARD, TRY_COMMIT}

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

  showPopupEditor = false;

  @ViewChild('scaleFieldEditor', {read: ElementRef})
  scaleFieldEditor: ElementRef<Element> | undefined;

  @ViewChild('popupInput')
  popupInput: ElementRef<HTMLInputElement> | undefined;

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
      editable: false,
      firstMappedPitch: this.scaleRoot.firstMappedPitch,
      deg: new DisplayedIndex(0),
      freqHz: toFixedClean(this.scaleRoot.rootFreqHz, 4),
    });

    // Upper degrees.
    for (const upperDeg of this.upperDegrees.getAll()) {
      this.dataSource.push({
        editable: true,
        firstMappedPitch: upperDeg.firstMappedPitch,
        deg: upperDeg.deg,
        measureFrom: upperDeg.measureFrom,
        ratio: toRatioString(upperDeg.tunedInterval),
        cents: toFixedClean(upperDeg.tunedInterval.getCents(), 4),
        freqHz: toFixedClean(upperDeg.freqHz, 4),
      });
    }
  }

  handleTableClick(e: MouseEvent) {
    let cellEl = e.target as Element;

    // Find the containing table cell.
    while (cellEl.tagName !== 'TD' && cellEl !== e.currentTarget) {
      cellEl = cellEl.parentElement as Element;
    }
    if (cellEl.tagName !== 'TD' || !cellEl.classList.contains('editable')) {
      return;
    }

    this.showPopupEditor_(cellEl);
    e.stopPropagation();
  }

  private hidePopupEditor_(action: PopupEditorAction) {
    if (!this.showPopupEditor) {
      return;
    }

    // TODO: Implement.

    this.showPopupEditor = false;
  }

  private showPopupEditor_(cellEl: Element) {
    this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);

    const rowEl = cellEl.parentElement as Element;
    const degIdx = parseInt(rowEl.getAttribute('data-deg-idx') as string);

    const col = colForCell(cellEl);

    // TODO: Implement.

    this.showPopupEditor = true;
    setTimeout(() => {
      this.popupInput?.nativeElement.select();
    }, 0);
  }

  @HostListener('body:click', ['$event'])
  handleBodyClick(e: MouseEvent) {
    if (!this.scaleFieldEditor) {
      return;
    }

    if (!this.scaleFieldEditor.nativeElement.contains(e.target as Node)) {
      this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
    } else if (e.key === 'Escape') {
      this.hidePopupEditor_(PopupEditorAction.DISCARD);
    }
  }
}
