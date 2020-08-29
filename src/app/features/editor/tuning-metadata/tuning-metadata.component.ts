import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorModel,
  TuningMetadataSnapshot,
} from '@arghotuning/argho-editor';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tuning-metadata',
  templateUrl: './tuning-metadata.component.html',
  styleUrls: ['./tuning-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningMetadataComponent {
  tuningMetadata!: TuningMetadataSnapshot;
  isOpen = false;

  @ViewChild('tuningNameInput')
  tuningNameInput: ElementRef<HTMLInputElement> | undefined;

  // Font Awesome icons:
  faEdit = faEdit;

  private readonly model: ArghoEditorModel;

  constructor(data: TuningDataService) {
    this.model = data.model;

    // Note: Always called back synchronously.
    this.model.tuningMetadata().subscribe(metadata => {
      this.tuningMetadata = metadata;
    });
  }

  handleOpened(): void {
    this.isOpen = true;

    // Note: Requires non-zero timeout for focus to work properly.
    setTimeout(() => {
      if (this.tuningNameInput) {
        // Select current tuning name text so it can be replaced.
        this.tuningNameInput.nativeElement.select();
      }
    }, 100);
  }

  handleClosed(): void {
    this.isOpen = false;
  }

  getAndMaybeCorrectName_(): string {
    if (!this.tuningNameInput) {
      return '';
    }

    const rawValue = this.tuningNameInput.nativeElement.value;

    // Note: Name parsing is always successful, and there are no warnings shown
    // for value correction.
    const parseResult =
        this.model.inputParser().forTuningMetadata().parseName(rawValue);
    const correctedValue = parseResult.getValue();
    if (rawValue !== correctedValue) {
      this.tuningNameInput.nativeElement.value = correctedValue;
    }

    return correctedValue;
  }

  handleNameChange(): void {
    this.model.setTuningName(this.getAndMaybeCorrectName_());
  }
}
