// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorModel,
  TuningMetadataSnapshot,
} from '@arghotuning/argho-editor';
import {AccidentalDisplayPref} from '@arghotuning/arghotun';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tuning-metadata',
  templateUrl: './tuning-metadata.component.html',
  styleUrls: ['./tuning-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningMetadataComponent extends BaseComponent {
  tuningMetadata!: TuningMetadataSnapshot;
  isOpen = false;

  @ViewChild('tuningNameInput')
  tuningNameInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild('tuningDescInput')
  tuningDescInput: ElementRef<HTMLTextAreaElement> | undefined;

  // Font Awesome icons:
  faEdit = faEdit;

  private readonly model: ArghoEditorModel;

  constructor(data: TuningDataService, changeDetector: ChangeDetectorRef) {
    super();
    this.model = data.model;

    // Note: Always called back synchronously.
    this.track(this.model.tuningMetadata().subscribe(metadata => {
      this.tuningMetadata = metadata;
      changeDetector.markForCheck();
    }));
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

  private getAndMaybeCorrectName_(): string {
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
    this.model.edit().setTuningName(this.getAndMaybeCorrectName_());
  }

  private getAndMaybeCorrectDesc_(): string {
    if (!this.tuningDescInput) {
      return '';
    }

    const rawValue = this.tuningDescInput.nativeElement.value;

    // Note: Description parsing is always successful, and there are no warnings
    // shown for value correction.
    const parseResult =
        this.model.inputParser().forTuningMetadata().parseDescription(rawValue);
    const correctedValue = parseResult.getValue();
    if (rawValue !== correctedValue) {
      this.tuningDescInput.nativeElement.value = correctedValue;
    }

    return correctedValue;
  }

  handleDescChange(): void {
    this.model.edit().setDescription(this.getAndMaybeCorrectDesc_());
  }

  handleAccidentalChange(value: string): void {
    this.model.edit().setDisplayAccidentalsAs(
      value === 'SHARPS' ?
        AccidentalDisplayPref.SHARPS :
        AccidentalDisplayPref.FLATS);
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
