import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

/** Type of input data that must be passed when opening this dialog. */
export interface ErrorDialogData {
  title: string,
  msgs: string[],
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent {
  data: ErrorDialogData;

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.data = data as ErrorDialogData;
  }
}
