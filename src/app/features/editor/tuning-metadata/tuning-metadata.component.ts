import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {TuningMetadataSnapshot} from '@arghotuning/argho-editor';
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

  constructor(data: TuningDataService) {
    // Note: Always called back synchronously.
    data.model.tuningMetadata().subscribe(metadata => {
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
}
