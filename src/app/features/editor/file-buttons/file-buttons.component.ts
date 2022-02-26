// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';
import {
  ErrorDialogComponent,
  ErrorDialogData,
} from 'src/app/infra/ui/error-dialog/error-dialog.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ArghoEditorContext, ArghoEditorModel} from '@arghotuning/argho-editor';
import {Tuning, TuningJsonSerializer} from '@arghotuning/arghotun';
import {
  faCompass,
  faFile,
  faSave,
  faShare,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

import {ShareDialogComponent, ShareDialogData} from './share-dialog.component';

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
export class FileButtonsComponent extends BaseComponent {
  private readonly context: ArghoEditorContext;
  private readonly model: ArghoEditorModel;

  private readonly loadTimeMillis: number;
  hasUnsavedChanges = false;

  // Font Awesome icons:
  faFile = faFile;
  faUpload = faUpload;
  faSave = faSave;
  faShare = faShare;
  faCompass = faCompass;

  @ViewChild('fileInput')
  fileInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('saveButton', {read: ElementRef})
  saveButton: ElementRef<HTMLAnchorElement> | undefined;

  constructor(
    data: TuningDataService,
    private readonly dialog: MatDialog,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    super();
    this.context = data.context;
    this.model = data.model;
    this.loadTimeMillis = Date.now();

    // Listen for any unsaved changes.
    this.track(data.anyTuningChange().subscribe(() => this.handleTuningChange_()));

    // (Must re-initialize this to ignore the first-time synchronous callbacks).
    this.hasUnsavedChanges = false;
  }

  private handleTuningChange_(): void {
    // Ignore changes that happen within 2 seconds of load (so that tuning
    // loaded via t= URL param data isn't immediately marked as having unsaved
    // changes).
    if (Date.now() < this.loadTimeMillis + 2000) {
      return;
    }

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
    // TODO: Confirm before reset if there are any pending changes.
    // TODO: Start a new history entry so that back button can undo.
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

  shareTuning(): void {
    const dialogData: ShareDialogData = {
      url: window.location.href,
    };
    this.dialog.open(ShareDialogComponent, {data: dialogData});
  }

  @HostListener('window:beforeunload')
  handleBeforeUnload(): boolean {
    return !this.hasUnsavedChanges;
  }
}
