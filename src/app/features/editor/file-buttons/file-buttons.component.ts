// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArghoEditorContext, ArghoEditorModel} from '@arghotuning/argho-editor';
import {Tuning, TuningJsonSerializer} from '@arghotuning/arghotun';
import {
  faCompass,
  faFile,
  faSave,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

import {ErrorDialogComponent, ErrorDialogData} from './error-dialog.component';

const NON_ALPHANUMERIC = /[^a-z0-9]/gi;

function getDefaultDownloadFileName(tuning: Tuning): string {
  // Convert name into a file safe string: strip non-alphanumeric characters.
  let safeName = tuning.getMetadata().getName().replace(NON_ALPHANUMERIC, '');
  if (safeName.length === 0) {
    safeName = 'untitled';
  }
  return safeName + '.arghotun';
}

@Component({
  selector: 'app-file-buttons',
  templateUrl: './file-buttons.component.html',
  styleUrls: ['./file-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileButtonsComponent {
  private readonly context: ArghoEditorContext;
  private readonly model: ArghoEditorModel;

  hasUnsavedChanges = false;

  // Font Awesome icons:
  faFile = faFile;
  faUpload = faUpload;
  faSave = faSave;
  faCompass = faCompass;

  @ViewChild('fileInput')
  fileInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('saveButton', {read: ElementRef})
  saveButton: ElementRef<HTMLAnchorElement> | undefined;

  constructor(
    data: TuningDataService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.context = data.context;
    this.model = data.model;

    // Listen for any unsaved changes.
    const subscriber = () => this.handleModelChange_();
    this.model.tuningMetadata().subscribe(subscriber);
    this.model.scaleMetadata().subscribe(subscriber);
    this.model.scaleRoot().subscribe(subscriber);
    this.model.upperDegrees().subscribe(subscriber);
    this.model.mappedKeys().subscribe(subscriber);

    // (Must re-initialize this to ignore the first-time synchronous callbacks).
    this.hasUnsavedChanges = false;
  }

  private handleModelChange_(): void {
    this.hasUnsavedChanges = true;
    this.changeDetector.markForCheck();
  }

  private clearUnsavedChanges_(): void {
    // Run this async to make sure any pending changes don't interfere.
    setTimeout(() => {
      this.hasUnsavedChanges = false;
      this.changeDetector.detectChanges();
    }, 10);
  }

  async resetTuning(): Promise<void> {
    // TODO: Track pending changes and confirm before losing them.
    // Also catch navigation away from page.
    await this.model.resetToDefault12tet();
    this.clearUnsavedChanges_();
  }

  async openFile(): Promise<void> {
    if (!this.fileInput) {
      return;
    }

    const fileList = this.fileInput.nativeElement.files;
    if (!fileList || !fileList[0]) {
      return;
    }

    const file = fileList[0];

    const reader = new FileReader();
    reader.addEventListener('load', async loadEvent => {
      if (loadEvent.target?.result) {
        await this.parseAndLoadTuning_(String(loadEvent.target?.result));
      }

      // Always clear file value when done, so future changes update.
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    });

    reader.addEventListener('error', errorEvent => {
      const dialogData: ErrorDialogData = {
        title: 'Error opening file',
        msgs: [reader.error?.message || ''],
      };
      this.dialog.open(ErrorDialogComponent, {data: dialogData});

      // Always clear file value when done, so future changes update.
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    });

    reader.readAsText(file);
  }

  private async parseAndLoadTuning_(inputJsonString: string): Promise<void> {
    try {
      const parseResult = await this.model.loadTuningFromJsonString(inputJsonString);

      if (parseResult.warnings.length >= 1) {
        const dialogData: ErrorDialogData = {
          title: 'File parse warnings',
          msgs: parseResult.warnings,
        };
        this.dialog.open(ErrorDialogComponent, {data: dialogData});
      }

      this.clearUnsavedChanges_();
    } catch (e) {
      const dialogData: ErrorDialogData = {
        title: 'File parse error',
        msgs: [(e as Error).message],
      };
      this.dialog.open(ErrorDialogComponent, {data: dialogData});
    }
  }

  saveTuning(): void {
    if (!this.saveButton) {
      return;
    }

    const tuningSnapshot = this.model.getTuningSnapshot();

    // TODO: Add factory for JSON serializer to editor model.
    const serializer = new TuningJsonSerializer(this.context);
    const jsonString = serializer.serializeToString(tuningSnapshot);

    const blob = new Blob([jsonString], {type: 'application/json'});
    const jsonBlobUrl = window.URL.createObjectURL(blob);

    this.saveButton.nativeElement.href = jsonBlobUrl;
    this.saveButton.nativeElement.target = '_blank';
    this.saveButton.nativeElement.download = getDefaultDownloadFileName(tuningSnapshot);

    this.clearUnsavedChanges_();
  }

  @HostListener('window:beforeunload')
  handleBeforeUnload(): boolean {
    return !this.hasUnsavedChanges;
  }
}
