import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArghoEditorContext, ArghoEditorModel} from '@arghotuning/argho-editor';
import {Tuning, TuningJsonSerializer} from '@arghotuning/arghotun';
import {
  faCompass,
  faFile,
  faSave,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

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
  ) {
    this.context = data.context;
    this.model = data.model;
  }

  resetTuning() {
    // TODO: Track pending changes and confirm before losing them.
    // Also catch navigation away from page.
    this.model.resetToDefault12tet();
  }

  openFile() {
    if (!this.fileInput) {
      return;
    }

    const fileList = this.fileInput.nativeElement.files;
    if (!fileList || !fileList[0]) {
      return;
    }

    const file = fileList[0];

    const reader = new FileReader();
    reader.addEventListener('load', loadEvent => {
      if (loadEvent.target?.result) {
        this.parseAndLoadTuning_(String(loadEvent.target?.result));
      }

      // Always clear file value when done, so future changes update.
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    });

    reader.addEventListener('error', errorEvent => {
      // TODO: Show error to user.

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
        // TODO: Show warnings here.
      }
    } catch (e) {
      // TODO: Show (e as Error).message to user in dialog.
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
  }
}
