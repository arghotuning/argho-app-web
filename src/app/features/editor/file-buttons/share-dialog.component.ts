// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {Clipboard} from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {faClipboard, faWarning} from '@fortawesome/free-solid-svg-icons';

// TODO: Centralize snackbar stuff.
const SNACKBAR_DURATION_MS = 2000;

// https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
const MAX_SAFE_URL_LENGTH = 2047;

/** Type of input data that must be passed when opening this dialog. */
export interface ShareDialogData {
  url: string,
}

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareDialogComponent {
  data: ShareDialogData;

  @ViewChild('tuningUrlArea')
  tuningUrlArea: ElementRef<HTMLTextAreaElement> | undefined;

  faClipboard = faClipboard;
  faWarning = faWarning;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly clipboard: Clipboard,
    private readonly snackbar: MatSnackBar,
  ) {
    this.data = data as ShareDialogData;
  }

  copyToClipboard(): void {
    const ok = this.clipboard.copy(this.data.url);
    if (ok) {
      this.snackbar.open('Copied to clipboard', undefined, {
        duration: SNACKBAR_DURATION_MS,
        panelClass: 'success-snackbar',
      });
    } else {
      this.snackbar.open('Unable to copy to clipboard', undefined, {
        duration: SNACKBAR_DURATION_MS,
        panelClass: 'warning-snackbar',
      });
    }
  }

  veryLongUrl(): boolean {
    return (this.data.url.length > MAX_SAFE_URL_LENGTH);
  }

  handleFocus(): void {
    // Note: Requires non-zero timeout for focus to work properly.
    setTimeout(() => {
      if (this.tuningUrlArea) {
        // Select full URL text.
        this.tuningUrlArea.nativeElement.select();
      }
    }, 100);
  }
}
