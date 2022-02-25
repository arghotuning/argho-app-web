// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {MidiService} from 'src/app/infra/synth/midi.service';
import {StoppableNote, SynthService} from 'src/app/infra/synth/synth.service';
import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';
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
  ScaleMetadataSnapshot,
  ScaleRoot,
  SimpleAccidental,
  UpperDegrees,
} from '@arghotuning/argho-editor';
import {
  ArghoTuningLimits,
  Cents,
  FreqHz,
  MidiPitch,
  TunedInterval,
  TunedIntervalSpecType,
} from '@arghotuning/arghotun';
import {faAngleDown, faPlayCircle} from '@fortawesome/free-solid-svg-icons';

function toRatioString(tunedInterval: TunedInterval): string {
  const num = tunedInterval.getRatioNumerator();
  const den = tunedInterval.getRatioDenominator();

  const numStr = Number.isInteger(num) ? num.toString() : toFixedClean(num, 4);
  return `${numStr}\xa0/\xa0${den}`;  // '\xa0' is &nbsp; non-breaking space.
}

function toCentsString(cents: Cents): string {
  return toFixedClean(cents, 4);
}

function toFreqString(freqHz: FreqHz): string {
  return toFixedClean(freqHz, 4);
}

// NOTE: These must match up with .mat-column-* suffixes in CSS.
enum ScaleTableCol {
  INPUT_KEY = 'inKey',
  DEG = 'deg',
  MEASURE_FROM = 'from',
  RATIO = 'ratio',
  CENTS = 'cents',
  FREQ = 'freq',
  REF_12TET_PITCH = '12tetPitch',
  CENTS_FROM_12TET = '12tetCents',
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
  firstMappedPitch?: DisplayedMidiPitch | null;
  blackKey: boolean;
  deg: DisplayedIndex;
  measureFrom?: DisplayedIndex;
  ratio?: string;
  cents?: string;
  freqHz: string;
  ref12tetPitch: DisplayedMidiPitch;
  centsFrom12tet: string;
  activelyPlaying: boolean;
}

/** Type of action to take when popup editor is dismissed. */
const enum PopupEditorAction {DISCARD, TRY_COMMIT}

const POPUP_MIN_WIDTH_PX = 80;
const POPUP_OFFSET_PX = 2;

const SNACKBAR_DURATION_MS = 2000;
const MIN_NOTE_DURATION_MS = 150;

interface PlayingNote {
  note: StoppableNote;
  startTimeMs: number;
}

const enum MidiStatus {NOTE_ON, NOTE_OFF};

@Component({
  selector: 'app-scale-table',
  templateUrl: './scale-table.component.html',
  styleUrls: ['./scale-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleTableComponent extends BaseComponent {
  readonly ARROW_CANVAS_WIDTH_PX = 24;

  ScaleTableCol = ScaleTableCol;

  // Font Awesome icons:
  faAngleDown = faAngleDown;
  faPlayCircle = faPlayCircle;

  private readonly model: ArghoEditorModel;

  scaleMetadata!: ScaleMetadataSnapshot;
  scaleRoot!: ScaleRoot;
  upperDegrees!: UpperDegrees;

  displayedColumns: ScaleTableCol[] = [];
  dataSource: TuningTableRow[] = [];

  private readonly clickedNotes_: {[degIndex: number]: PlayingNote | null} = {};
  private degsPlayingFromMidiInput_: {[degIndex: number]: number[]} = {};

  showPopupEditor = false;
  popupLabel = '';
  private popupEditorCol_: ScaleTableCol | null = null;
  private popupEditorScaleDegreeIndex_: number | null = null;

  @ViewChild('scaleTable', {read: ElementRef})
  table: ElementRef<HTMLTableElement> | undefined;

  @ViewChild('measureFromArrow', {read: ElementRef})
  measureFromArrow: ElementRef<HTMLCanvasElement> | undefined;

  @ViewChild('popupEditor', {read: ElementRef})
  popupEditor: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupField', {read: ElementRef})
  popupField: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupInput')
  popupInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    private readonly data: TuningDataService,
    uiService: ScaleTableService,
    midi: MidiService,
    private readonly synth: SynthService,
    changeDetector: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    this.model = data.model;

    // Note: All these subscriptions are called back synchronously the first time.

    this.track(uiService.config().subscribe(uiConfig => {
      this.updateDisplayedCols_(uiConfig);
      changeDetector.markForCheck();
    }));

    this.track(this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.scaleMetadata = scaleMetadata;
      // NOTE: No direct update required.
    }));

    this.track(this.model.scaleRoot().subscribe(scaleRoot => {
      this.scaleRoot = scaleRoot;
      this.updateTableData_();
      changeDetector.markForCheck();
    }));

    this.track(this.model.upperDegrees().subscribe(upperDegrees => {
      this.upperDegrees = upperDegrees;
      this.updateTableData_();
      changeDetector.markForCheck();
    }));

    this.model.mappedKeys().subscribe(_ => {
      this.degsPlayingFromMidiInput_ = {};  // Reset.
      this.updateTableData_();
      changeDetector.markForCheck();
    });

    this.track(midi.noteOns().subscribe(pitch => {
      this.handleMidiInput_(pitch, MidiStatus.NOTE_ON);
      this.updateTableData_();
      changeDetector.markForCheck();
    }));

    this.track(midi.noteOffs().subscribe(pitch => {
      this.handleMidiInput_(pitch, MidiStatus.NOTE_OFF);
      this.updateTableData_();
      changeDetector.markForCheck();
    }));
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
    if (uiConfig.colGroups.contains(ScaleTableColGroup.COMPARE_12TET)) {
      cols.push(ScaleTableCol.REF_12TET_PITCH);
      cols.push(ScaleTableCol.CENTS_FROM_12TET);
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
      blackKey: this.scaleRoot.firstMappedPitch.accidental !== SimpleAccidental.NATURAL,
      deg: new DisplayedIndex(0),
      freqHz: toFreqString(this.scaleRoot.rootFreqHz),
      ref12tetPitch: this.scaleRoot.nearestMidiPitch,
      centsFrom12tet: toCentsString(this.scaleRoot.centsFrom12tet),
      activelyPlaying: !!this.degsPlayingFromMidiInput_[0],
    });

    // Upper degrees.
    for (const upperDeg of this.upperDegrees.getAll()) {
      this.dataSource.push({
        editable: true,
        firstMappedPitch: upperDeg.firstMappedPitch,
        blackKey: (upperDeg.firstMappedPitch?.accidental || '') !== SimpleAccidental.NATURAL,
        deg: upperDeg.deg,
        measureFrom: upperDeg.measureFrom,
        ratio: toRatioString(upperDeg.tunedInterval),
        cents: toCentsString(upperDeg.tunedInterval.getCents()),
        freqHz: toFreqString(upperDeg.freqHz),
        ref12tetPitch: upperDeg.refMidiPitch,
        centsFrom12tet: toCentsString(upperDeg.centsFrom12tet),
        activelyPlaying: !!this.degsPlayingFromMidiInput_[upperDeg.deg.index],
      });
    }
  }

  handleRowHoverStart(e: MouseEvent) {
    // If all scale degrees are measured from the root, no arrows.
    if (this.scaleMetadata.measureFromPreset === MeasureFromPreset.SCALE_ROOT) {
      return;
    }

    let rowEl = e.currentTarget as HTMLTableRowElement;
    const degIdx = parseInt(rowEl.getAttribute('data-deg-idx') as string);
    if (degIdx === 0) {
      return;
    }

    const measureFromIdx = this.upperDegrees.get(degIdx).measureFrom.index;
    const measureFromRowEl = this.rowElFromIndex_(measureFromIdx);
    if (!measureFromRowEl) {
      return;
    }

    this.showMeasureFromArrow_(rowEl, measureFromRowEl);
  }

  private rowElFromIndex_(idx: number): HTMLTableRowElement | null {
    if (!this.table) {
      return null;
    }

    const bodyEl = this.table.nativeElement.getElementsByTagName('TBODY')[0];
    return bodyEl.children[idx] as HTMLTableRowElement;
  }

  private showMeasureFromArrow_(
    rowEl: HTMLTableRowElement,
    measureFromRowEl: HTMLTableRowElement,
  ): void {
    if (!this.measureFromArrow) {
      return;
    }

    const rowRect = rowEl.getBoundingClientRect();
    const measureFromRowRect = measureFromRowEl.getBoundingClientRect();

    // Position canvas absolutely relative to wrapper parent element.
    const wrapperEl = this.measureFromArrow!.nativeElement.parentElement as Element;
    const wrapperRect = wrapperEl.getBoundingClientRect();

    // Stretch from top of top row to bottom of bottom row.
    const isDownArrow = (measureFromRowRect.y < rowRect.y);
    const topRowRect = isDownArrow ? measureFromRowRect : rowRect;
    const bottomRowRect = isDownArrow ? rowRect : measureFromRowRect;

    const canvasEl = this.measureFromArrow.nativeElement;
    canvasEl.style.top = (topRowRect.y - wrapperRect.y) + 'px';
    canvasEl.height = bottomRowRect.y + bottomRowRect.height - topRowRect.y;

    // Draw arrow.
    const g = canvasEl.getContext('2d');
    if (!g) {
      return;
    }

    g.translate(0.5, 0.5);  // Draw on grid for crisper lines.

    const arrowLeftX = Math.floor(canvasEl.width / 4) + 2;
    const arrowTopY = Math.floor(topRowRect.height / 2);
    const arrowBottomY = Math.floor(canvasEl.height - bottomRowRect.height / 2);

    const fromY = isDownArrow ? arrowTopY : arrowBottomY;
    const fromX = canvasEl.width - Math.floor(canvasEl.width / 4);

    const toY = isDownArrow ? arrowBottomY : arrowTopY;
    const toX = canvasEl.width - 2;

    g.clearRect(0, 0, canvasEl.width, canvasEl.height);

    g.strokeStyle = '#000';
    g.fillStyle = '#000';
    g.lineWidth = 1;
    g.lineJoin = 'round';

    // Lines from the measured from row to the hovered row.
    g.beginPath();
    g.moveTo(fromX, fromY);
    g.lineTo(arrowLeftX, fromY);
    g.lineTo(arrowLeftX, toY);
    g.lineTo(toX, toY);
    g.stroke();

    // Circle endcap next to the measured from row.
    g.beginPath();
    g.arc(fromX, fromY, 3, 0, 2 * Math.PI);
    g.closePath();
    g.fill();

    // Arrow endcap pointing to the hovered row.
    g.beginPath();
    g.moveTo(toX - 6, toY - 6);
    g.lineTo(toX - 6, toY + 6);
    g.lineTo(toX, toY);
    g.closePath();
    g.fill();

    // Show it.
    canvasEl.classList.add('showing');
  }

  handleRowHoverEnd(_: MouseEvent) {
    this.measureFromArrow?.nativeElement.classList.remove('showing');
  }

  handleTableClick(e: MouseEvent) {
    let cellEl = e.target as Element;
    if (cellEl.classList.contains('play-button')) {
      return;
    }

    // Find the containing table cell.
    while (cellEl.tagName !== 'TD' && cellEl !== e.currentTarget) {
      cellEl = cellEl.parentElement as Element;
      if (cellEl.classList.contains('play-button')) {
        return;
      }
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
          await this.model.edit().setUpperDegreeMeasureFrom(
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
          await this.model.edit().setUpperDegreeRatio(
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
          await this.model.edit().setUpperDegreeCents(degIndex, cents.getCents());
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
            await this.model.edit().setUpperDegreeCents(degIndex, freqInterval.getCents());
          } else {
            await this.model.edit().setUpperDegreeRatio(
              degIndex, freqInterval.getRatioNumerator(), freqInterval.getRatioDenominator());
          }
        }
        if (freqResult.hasCorrectionWarning()) {
          correctionWarning = freqResult.getCorrectionWarning();
        }
        break;

      case ScaleTableCol.CENTS_FROM_12TET:
        const refMidiPitch = this.upperDegrees.get(degIndex).refMidiPitch;
        const centsFrom12tetResult =
            inputParser.parseCentsFrom12tet(refMidiPitch.midiPitch, valueStr);
        if (centsFrom12tetResult.hasValidValue()) {
          await this.model.edit().setUpperDegreeCents(
              degIndex, centsFrom12tetResult.getValue().getCents());
        }
        if (centsFrom12tetResult.hasCorrectionWarning()) {
          correctionWarning = centsFrom12tetResult.getCorrectionWarning();
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

  private showPopupEditor_(cellEl: Element): void {
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
    this.setPopupPosition_(cellEl);

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
        return toCentsString(upperDeg.tunedInterval.getCents());

      case ScaleTableCol.FREQ:
        return toFreqString(upperDeg.freqHz);

      case ScaleTableCol.CENTS_FROM_12TET:
        return toCentsString(upperDeg.centsFrom12tet);

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
      case ScaleTableCol.CENTS_FROM_12TET:
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

  private setPopupPosition_(cellEl: Element) {
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
    await this.model.edit().setMeasureFromPreset(MeasureFromPreset.SCALE_ROOT);
  }

  async setMeasureFromDegBelow(): Promise<void> {
    await this.model.edit().setMeasureFromPreset(MeasureFromPreset.DEGREE_BELOW);
  }

  playDegree(degIndex: number): void {
    this.stopDegree(degIndex);

    const freqHz = (degIndex === 0) ?
        this.scaleRoot.rootFreqHz : this.upperDegrees.get(degIndex).freqHz;
    this.clickedNotes_[degIndex] = {
      note: this.synth.playNoteOn(freqHz),
      startTimeMs: Date.now(),
    };
  }

  stopDegree(degIndex: number): void {
    const playingNote = this.clickedNotes_[degIndex];
    this.clickedNotes_[degIndex] = null;

    if (playingNote) {
      const minEndTimeMs = playingNote.startTimeMs + MIN_NOTE_DURATION_MS;
      const nowMs = Date.now();
      const remainingMs = Math.max(0, minEndTimeMs - nowMs);

      if (remainingMs > 0) {
        // Stop after note reaches minimum duration.
        setTimeout(() => playingNote.note.stop(), remainingMs);
      } else {
        playingNote.note.stop();  // Stop immediately.
      }
    }
  }

  private handleMidiInput_(pitch: MidiPitch, status: MidiStatus): void {
    const keyToSoundMap = this.data.keyToSoundMap();
    if (!keyToSoundMap.isMapped(pitch)) {
      return;
    }

    const deg = keyToSoundMap.mappedSoundFor(pitch).scaleDegreeIndex;
    const activePitches = this.degsPlayingFromMidiInput_[deg] || [];
    const pos = activePitches.indexOf(pitch);

    if ((status === MidiStatus.NOTE_ON) && (pos === -1)) {
      // Note on that wasn't actively playing.
      activePitches.push(pitch);
      this.degsPlayingFromMidiInput_[deg] = activePitches;
    } else if ((status === MidiStatus.NOTE_OFF) && (pos >= 0)) {
      // Note off that was actively playing.
      activePitches.splice(pos, 1);
      if (activePitches.length === 0) {
        delete this.degsPlayingFromMidiInput_[deg];
      }
    }
  }
}
