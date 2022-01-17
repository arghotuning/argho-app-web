// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DisplayedMidiPitch} from '@arghotuning/argho-editor';

@Component({
  selector: 'app-spelled-pitch',
  templateUrl: './spelled-pitch.component.html',
  styleUrls: ['./spelled-pitch.component.scss'],
})
export class SpelledPitchComponent {
  @Input()
  pitch: DisplayedMidiPitch | undefined;
}
