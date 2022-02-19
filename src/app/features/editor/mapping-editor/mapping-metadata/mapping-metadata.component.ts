// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {simpleAccidentalStr} from 'src/app/infra/ui/spelled-pitch/spelled-pitch-util';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ArghoEditorModel, DisplayedMidiPitch} from '@arghotuning/argho-editor';
import {faEdit} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mapping-metadata',
  templateUrl: './mapping-metadata.component.html',
  styleUrls: ['./mapping-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingMetadataComponent {
  private readonly model: ArghoEditorModel;

  keySpan!: number;
  mappingRoot!: DisplayedMidiPitch;

  @ViewChild('mappingRootInput')
  mappingRootInput: ElementRef<HTMLInputElement> | undefined;

  // Font Awesome icons:
  faEdit = faEdit;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) {
    this.model = data.model;

    // Note: Subscriptions called by synchronously the first time.
    this.model.mappedKeys().subscribe(mappedKeys => {
      this.keySpan = mappedKeys.keySpan;
      this.mappingRoot = mappedKeys.get(0).inputPitch!;

      changeDetector.markForCheck();
    });
  }

  mappingRootPitchStrValue(): string {
    const pitch = this.mappingRoot;
    return pitch.letter + simpleAccidentalStr(pitch.accidental) + pitch.octaveNumber;
  }

  async handleMappingRootBlur(): Promise<void> {
    if (!this.mappingRootInput) {
      return;
    }

    const parseResult = this.model.inputParser().forMappedKeys()
        .parseRootMidiPitch(this.mappingRootInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      const update = parseResult.getValue();
      await this.model.editAdvanced().setMappingRootPitch(
          update.rootMidiPitch, update.displayPref);
    }

    this.mappingRootInput.nativeElement.value = this.mappingRootPitchStrValue();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
