// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {OscWaveform, SynthService} from 'src/app/infra/synth/synth.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {faVolumeHigh, faVolumeOff} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-synth-controls',
  templateUrl: './synth-controls.component.html',
  styleUrls: ['./synth-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SynthControlsComponent extends BaseComponent {
  // Icons:
  faVolumeOff = faVolumeOff;
  faVolumeHigh = faVolumeHigh;

  volume!: number;
  waveform!: OscWaveform;

  constructor(
    private readonly synth: SynthService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    super();

    this.track(this.synth.volume().subscribe(volume => {
      this.volume = volume;
      this.changeDetector.markForCheck();
    }));

    this.track(this.synth.waveform().subscribe(waveform => {
      this.waveform = waveform;
      this.changeDetector.markForCheck();
    }));
  }

  handleWaveformChange(waveform: OscWaveform): void {
    this.synth.setOscWaveform(waveform);
  }

  handleVolumeChange(normalizedVolume: number): void {
    this.synth.setVolume(normalizedVolume);
  }
}
