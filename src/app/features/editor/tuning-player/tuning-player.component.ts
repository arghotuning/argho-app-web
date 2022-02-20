// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';

import {PianoKeyboardComponent} from './piano-keyboard.component';

@Component({
  selector: 'app-tuning-player',
  templateUrl: './tuning-player.component.html',
  styleUrls: ['./tuning-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningPlayerComponent {
  @ViewChild('piano')
  piano: PianoKeyboardComponent | undefined;

  handleTabChange(): void {
    this.piano?.handleResize();
  }
}
