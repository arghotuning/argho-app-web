// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {
  MidiService,
  OpenedMidiInput,
  WebMidiAccessState,
  WebMidiInputPort,
} from 'src/app/infra/synth/midi.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {DisplayedIndex} from '@arghotuning/argho-editor';

@Component({
  selector: 'app-web-midi-input',
  templateUrl: './web-midi-input.component.html',
  styleUrls: ['./web-midi-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebMidiInputComponent extends BaseComponent {
  WebMidiAccessState = WebMidiAccessState;

  accessState!: WebMidiAccessState;
  allInputPorts: WebMidiInputPort[] = [];
  activeInput: OpenedMidiInput | null = null;
  channel = 'omni';

  constructor(
    private readonly midiService: MidiService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    super();

    this.track(this.midiService.accessState().subscribe(accessState => {
      this.accessState = accessState;
      if (this.accessState === WebMidiAccessState.GRANTED) {
        this.initInputs_();
      }
      this.changeDetector.markForCheck();
    }));
  }

  enableMidiInput(): void {
    this.midiService.requestAccess().finally(() => this.changeDetector.markForCheck());
  }

  private initInputs_(): void {
    this.track(this.midiService.allAvailableInputs().subscribe(inputPorts => {
      this.allInputPorts = inputPorts.inputs;
      this.changeDetector.markForCheck();
    }));

    this.track(this.midiService.activeInput().subscribe(activeInput => {
      if (activeInput) {
        if (activeInput.channel === 'omni') {
          this.channel = 'omni';
        } else {
          this.channel = activeInput.channel.displayNumber.toString();
        }
      }

      this.activeInput = activeInput;
      this.changeDetector.markForCheck();
    }));
  }

  handleMidiInputChange(id: string): void {
    this.midiService.openInput(id);
  }

  handleChannelChange(chanStr: string): void {
    let ch: 'omni' | DisplayedIndex = 'omni';
    if (chanStr !== 'omni') {
      ch = new DisplayedIndex(parseInt(chanStr, 10) - 1);
    }
    this.midiService.setMidiChannel(ch);
  }
}
