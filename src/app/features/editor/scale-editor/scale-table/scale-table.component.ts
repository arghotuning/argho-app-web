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
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  ArghoEditorModel,
  DisplayedIndex,
  DisplayedMidiPitch,
  MeasureFromPreset,
  ScaleRoot,
  UpperDegrees,
} from '@arghotuning/argho-editor';
import {
  ArghoTuningLimits,
  FreqHz,
  TunedInterval,
  TunedIntervalSpecType,
} from '@arghotuning/arghotun';
import {faAngleDown} from '@fortawesome/free-solid-svg-icons';

function toRatioString(tunedInterval: TunedInterval): string {
  const num = tunedInterval.getRatioNumerator();
  const den = tunedInterval.getRatioDenominator();

  const numStr = Number.isInteger(num) ? num.toString() : toFixedClean(num, 4);
  return `${numStr}\xa0/\xa0${den}`;  // '\xa0' is &nbsp; non-breaking space.
}

function toCentsString(tunedInterval: TunedInterval): string {
  return toFixedClean(tunedInterval.getCents(), 4);
}

function toFreqString(freqHz: FreqHz): string {
  return toFixedClean(freqHz, 4);
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

function popupLabelForCol(col: ScaleTableCol): string {
  switch (col) {
    case ScaleTableCol.MEASURE_FROM: return 'Meas. From';
    case ScaleTableCol.RATIO: return 'Ratio';
    case ScaleTableCol.CENTS: return 'Cents';
    case ScaleTableCol.FREQ: return 'Freq (Hz)';
    default: return '';
  }
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

const POPUP_MIN_WIDTH_PX = 80;
const POPUP_OFFSET_PX = 2;

const SNACKBAR_DURATION_MS = 2000;

@Component({
  selector: 'app-scale-table',
  templateUrl: './scale-table.component.html',
  styleUrls: ['./scale-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleTableComponent {
  ScaleTableCol = ScaleTableCol;

  // Font Awesome icons:
  faAngleDown = faAngleDown;

  private readonly model: ArghoEditorModel;

  scaleRoot!: ScaleRoot;
  upperDegrees!: UpperDegrees;

  displayedColumns: ScaleTableCol[] = [];
  dataSource: TuningTableRow[] = [];

  showPopupEditor = false;
  popupLabel = '';
  private popupEditorCol_: ScaleTableCol | null = null;
  private popupEditorScaleDegreeIndex_: number | null = null;

  @ViewChild('scaleTable', {read: ElementRef})
  table: ElementRef<HTMLTableElement> | undefined;

  @ViewChild('popupEditor', {read: ElementRef})
  popupEditor: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupField', {read: ElementRef})
  popupField: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupInput')
  popupInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    uiService: ScaleTableService,
    changeDetector: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar,
  ) {
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
      freqHz: toFreqString(this.scaleRoot.rootFreqHz),
    });

    // Upper degrees.
    for (const upperDeg of this.upperDegrees.getAll()) {
      this.dataSource.push({
        editable: true,
        firstMappedPitch: upperDeg.firstMappedPitch,
        deg: upperDeg.deg,
        measureFrom: upperDeg.measureFrom,
        ratio: toRatioString(upperDeg.tunedInterval),
        cents: toCentsString(upperDeg.tunedInterval),
        freqHz: toFreqString(upperDeg.freqHz),
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

  private async hidePopupEditor_(action: PopupEditorAction) {
    if (!this.showPopupEditor) {
      return;
    }
    this.showPopupEditor = false;
    if (action === PopupEditorAction.DISCARD) {
      return;
    }

    // Try to update the edited field.
    const valueStr = this.popupInput!.nativeElement.value;
    if (valueStr.trim() === this.getPopupFieldValue_().trim()) {
      return;  // Unchanged.
    }

    const degIndex = this.popupEditorScaleDegreeIndex_!;
    const inputParser = this.model.inputParser().forUpperDegree(degIndex);
    let correctionWarning = '';
    switch (this.popupEditorCol_) {
      case ScaleTableCol.MEASURE_FROM:
        const measureFromResult = inputParser.parseMeasureFrom(valueStr);
        if (measureFromResult.hasValidValue()) {
          await this.model.setUpperDegreeMeasureFrom(
              degIndex, measureFromResult.getValue().index);
        }
        if (measureFromResult.hasCorrectionWarning()) {
          correctionWarning = measureFromResult.getCorrectionWarning();
        }
        break;

      case ScaleTableCol.RATIO:
        const ratioResult = inputParser.parseRatio(valueStr);
        if (ratioResult.hasValidValue()) {
          const ratio = ratioResult.getValue();
          await this.model.setUpperDegreeRatio(
              degIndex, ratio.getRatioNumerator(), ratio.getRatioDenominator());
        }
        if (ratioResult.hasCorrectionWarning()) {
          correctionWarning = ratioResult.getCorrectionWarning();
        }
        break;

      case ScaleTableCol.CENTS:
        const centsResult = inputParser.parseCents(valueStr);
        if (centsResult.hasValidValue()) {
          const cents = centsResult.getValue();
          await this.model.setUpperDegreeCents(degIndex, cents.getCents());
        }
        if (centsResult.hasCorrectionWarning()) {
          correctionWarning = centsResult.getCorrectionWarning();
        }
        break;

      case ScaleTableCol.FREQ:
        const freqResult = inputParser.parseFreqHz(valueStr);
        if (freqResult.hasValidValue()) {
          const freqInterval = freqResult.getValue();
          if (freqInterval.getSpecType() === TunedIntervalSpecType.CENTS) {
            await this.model.setUpperDegreeCents(degIndex, freqInterval.getCents());
          } else {
            await this.model.setUpperDegreeRatio(
              degIndex, freqInterval.getRatioNumerator(), freqInterval.getRatioDenominator());
          }
        }
        if (freqResult.hasCorrectionWarning()) {
          correctionWarning = freqResult.getCorrectionWarning();
        }
        break;
    }

    if (correctionWarning) {
      this.snackBar.open(correctionWarning, undefined, {
        duration: SNACKBAR_DURATION_MS,
        panelClass: 'warning-snackbar',
      });
    }
  }

  private showPopupEditor_(cellEl: Element) {
    this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
    if (!this.popupEditor || !this.popupField || !this.popupInput) {
      return;
    }

    const rowEl = cellEl.parentElement as Element;
    this.popupEditorScaleDegreeIndex_ =
        parseInt(rowEl.getAttribute('data-deg-idx') as string);
    this.popupEditorCol_ = colForCell(cellEl);

    // Customize value, appearance, and input behavior.
    this.popupLabel = popupLabelForCol(this.popupEditorCol_);
    this.setPopupInputTypeAndRange_();
    this.popupInput.nativeElement.value = this.getPopupFieldValue_();
    this.setPopupPosition_(rowEl, cellEl);

    // Show popup editor & select field value.
    this.showPopupEditor = true;
    setTimeout(() => {
      this.popupInput?.nativeElement.select();
    }, 0);
  }

  private getPopupFieldValue_(): string {
    const upperDeg = this.upperDegrees.get(this.popupEditorScaleDegreeIndex_!);

    switch (this.popupEditorCol_) {
      case ScaleTableCol.MEASURE_FROM:
        return upperDeg.measureFrom.displayNumber.toString();

      case ScaleTableCol.RATIO:
        return toRatioString(upperDeg.tunedInterval);

      case ScaleTableCol.CENTS:
        return toCentsString(upperDeg.tunedInterval);

      case ScaleTableCol.FREQ:
        return toFreqString(upperDeg.freqHz);

      default:
        return '';
    }
  }

  private setPopupInputTypeAndRange_() {
    let minValue: number | null = null;
    let maxValue: number | null = null;

    switch (this.popupEditorCol_) {
      case ScaleTableCol.MEASURE_FROM:
        minValue = 1;  // Display number of root.
        maxValue = this.upperDegrees.numUpperDegrees + 1;  // Display number of top degree.
        break;

      case ScaleTableCol.CENTS:
        minValue = ArghoTuningLimits.CENTS_MIN;
        maxValue = ArghoTuningLimits.CENTS_MAX;
        break;

      case ScaleTableCol.FREQ:
        minValue = ArghoTuningLimits.FREQ_HZ_MIN;
        maxValue = ArghoTuningLimits.FREQ_HZ_MAX;
        break;
    }

    const inputEl = this.popupInput!.nativeElement;
    if (minValue === null) {
      inputEl.type = 'text';
      inputEl.min = '';
      inputEl.max = '';
    } else {
      inputEl.type = 'number';
      inputEl.min = minValue!.toString();
      inputEl.max = maxValue!.toString();
    }
  }

  private setPopupPosition_(rowEl: Element, cellEl: Element) {
    const popupEl = this.popupEditor!.nativeElement;

    // Set size.
    const cellRect = cellEl.getBoundingClientRect();
    const widthPx = Math.max(POPUP_MIN_WIDTH_PX, 1.2 * cellRect.width);
    this.popupField!.nativeElement.style.width = widthPx + 'px';

    // Set position (prefer top-left alignment with cell, if it fits within table bounds).
    const wrapperEl = this.popupEditor!.nativeElement.parentElement as Element;
    const wrapperRect = wrapperEl.getBoundingClientRect();

    const tableRect = this.table!.nativeElement.getBoundingClientRect();

    const fitsLeftAligned = cellRect.left + widthPx < tableRect.right;
    if (fitsLeftAligned) {
      popupEl.style.left = (cellRect.left - (wrapperRect.left - wrapperEl.scrollLeft) - POPUP_OFFSET_PX) + 'px';
      popupEl.style.right = 'initial';
    } else {
      popupEl.style.left = 'initial';
      popupEl.style.right = ((wrapperRect.right - wrapperEl.scrollLeft) - cellRect.right + POPUP_OFFSET_PX) + 'px';
    }

    const popupHeight = Math.max(popupEl.getBoundingClientRect().height, 1.2 * cellRect.height);

    const fitsTopAligned = cellRect.top + popupHeight < tableRect.bottom;
    if (fitsTopAligned) {
      popupEl.style.top = (cellRect.top - wrapperRect.top - POPUP_OFFSET_PX) + 'px';
      popupEl.style.bottom = 'initial';
    } else {
      popupEl.style.top = 'initial';
      popupEl.style.bottom = (wrapperRect.bottom - cellRect.bottom + POPUP_OFFSET_PX) + 'px';
    }
  }

  handlePopupInputBlur() {
    this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
  }

  @HostListener('body:click', ['$event'])
  handleBodyClick(e: MouseEvent) {
    if (!this.popupEditor) {
      return;
    }

    if (!this.popupEditor.nativeElement.contains(e.target as Node)) {
      this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (!this.popupEditor) {
      return;
    }

    if (e.key === 'Enter') {
      this.hidePopupEditor_(PopupEditorAction.TRY_COMMIT);
    } else if (e.key === 'Escape') {
      this.hidePopupEditor_(PopupEditorAction.DISCARD);
    }
  }

  async setMeasureFromScaleRoot(): Promise<void> {
    await this.model.setMeasureFromPreset(MeasureFromPreset.SCALE_ROOT);
  }

  async setMeasureFromDegBelow(): Promise<void> {
    await this.model.setMeasureFromPreset(MeasureFromPreset.DEGREE_BELOW);
  }
}
