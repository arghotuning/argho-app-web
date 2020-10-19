import {
  MidiService,
  OpenedMidiInput,
  WebMidiAccessState,
  WebMidiInputPort,
} from 'src/app/infra/synth/midi.service';
import {OscWaveform, SynthService} from 'src/app/infra/synth/synth.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {DisplayedIndex} from '@arghotuning/argho-editor';

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
  channel = 'omni';
  waveform!: OscWaveform;

  constructor(
    private readonly midiService: MidiService,
    private readonly synth: SynthService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.midiService.accessState().subscribe(accessState => {
      this.accessState = accessState;
      if (this.accessState === WebMidiAccessState.GRANTED) {
        this.initInputs_();
      }
      this.changeDetector.markForCheck();
    });

    this.synth.waveform().subscribe(waveform => {
      this.waveform = waveform;
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
      if (activeInput) {
        if (activeInput.channel === 'omni') {
          this.channel = 'omni';
        } else {
          this.channel = activeInput.channel.displayNumber.toString();
        }
      }

      this.activeInput = activeInput;
      this.changeDetector.markForCheck();
    });
  }

  handleMidiInputChange(id: string): void {
    this.midiService.openInput(id);
  }

  handleChannelChange(chanStr: string): void {
    let ch: 'omni' | DisplayedIndex = 'omni';
    if (chanStr !== 'omni') {
      ch = new DisplayedIndex(parseInt(chanStr) - 1);
    }
    this.midiService.setMidiChannel(ch);
  }

  handleWaveformChange(waveform: OscWaveform): void {
    this.synth.setOscWaveform(waveform);
  }
}
