import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

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

/** Type of action to take when popup editor is dismissed. */
const enum PopupEditorAction {DISCARD, TRY_COMMIT}

const POPUP_MIN_WIDTH_PX = 80;
const POPUP_OFFSET_PX = 2;

const SNACKBAR_DURATION_MS = 2000;

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

  @ViewChild('mappingTable', {read: ElementRef})
  table: ElementRef<HTMLTableElement> | undefined;

  @ViewChild('popupEditor', {read: ElementRef})
  popupEditor: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupField', {read: ElementRef})
  popupField: ElementRef<HTMLElement> | undefined;

  @ViewChild('popupInput')
  popupInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar,
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

    // Try to update the scale degree field.
    const valueStr = this.popupInput!.nativeElement.value;
    if (valueStr.trim() === this.getPopupFieldValue_().trim()) {
      return;  // Unchanged.
    }

    const keyIndex = this.popupEditorKeyIndex_!;
    const inputParser = this.model.inputParser().forMappedKeys();

    const parseResult = inputParser.parseScaleDegree(valueStr);
    if (parseResult.hasValidValue()) {
      const degOrNull = parseResult.getValue().degreeOrNull;
      await this.model.setMappedScaleDegree(
          keyIndex, degOrNull ? degOrNull!.index : null);
    }

    if (parseResult.hasCorrectionWarning()) {
      this.snackBar.open(parseResult.getCorrectionWarning(), undefined, {
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
    this.popupEditorKeyIndex_ =
        parseInt(rowEl.getAttribute('data-key-idx') as string);
    this.popupInput.nativeElement.value = this.getPopupFieldValue_();
    this.setPopupPosition_(rowEl, cellEl);

    // Show popup editor & select field value.
    this.showPopupEditor = true;
    setTimeout(() => {
      this.popupInput?.nativeElement.select();
    }, 0);
  }

  private getPopupFieldValue_(): string {
    const mappedKey = this.mappedKeys.get(this.popupEditorKeyIndex_!);
    return mappedKey.mappedDegree?.displayNumber.toString() || '-';
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
}