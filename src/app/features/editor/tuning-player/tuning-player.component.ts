import {
  MidiService,
  OpenedMidiInput,
  WebMidiAccessState,
  WebMidiInputPort,
} from 'src/app/infra/synth/midi.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';

@Component({
  selector: 'app-tuning-player',
  templateUrl: './tuning-player.component.html',
  styleUrls: ['./tuning-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningPlayerComponent {
  WebMidiAccessState = WebMidiAccessState;

  accessState!: WebMidiAccessState;
  allInputPorts: WebMidiInputPort[] = [];
  activeInput: OpenedMidiInput | null = null;

  constructor(
    private readonly midiService: MidiService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.midiService.accessState().subscribe(accessState => {
      this.accessState = accessState;
      if (this.accessState === WebMidiAccessState.GRANTED) {
        this.initInputs_();
      }
      this.changeDetector.markForCheck();
    });
  }

  enableMidiInput(): void {
    this.midiService.requestAccess().finally(() => this.changeDetector.markForCheck());
  }

  private initInputs_(): void {
    this.midiService.allAvailableInputs().subscribe(inputPorts => {
      this.allInputPorts = inputPorts.inputs;
      this.changeDetector.markForCheck();
    });

    this.midiService.activeInput().subscribe(activeInput => {
      this.activeInput = activeInput;
      this.changeDetector.markForCheck();
    });
  }

  handleMidiInputChange(id: string): void {
    this.midiService.openInput(id);
  }
}
