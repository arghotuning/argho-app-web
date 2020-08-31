import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ArghoEditorModel,
  ArghoEditorSettings,
  DisplayedMidiPitch,
  ScaleRoot,
} from '@arghotuning/argho-editor';
import {AccidentalDisplayPref, ArghoTuningLimits} from '@arghotuning/arghotun';

const MIDI_PITCH_A4 = 69;

@Component({
  selector: 'app-scale-root',
  templateUrl: './scale-root.component.html',
  styleUrls: ['./scale-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleRootComponent {
  private readonly model: ArghoEditorModel;

  scaleRoot!: ScaleRoot;
  globalTunePitch!: DisplayedMidiPitch;

  @ViewChild('globalTuneInput')
  globalTuneInput: ElementRef<HTMLInputElement> | undefined;

  minGlobalTune = ArghoTuningLimits.GLOBAL_TUNE_A4_HZ_MIN;
  maxGlobalTune = ArghoTuningLimits.GLOBAL_TUNE_A4_HZ_MAX;

  constructor(data: TuningDataService, changeDetector: ChangeDetectorRef) {
    this.model = data.model;

    // TODO: Add globalTunePitch to ArghoEditorModel directly.
    let settings: ArghoEditorSettings;
    this.model.settings().subscribe(s => settings = s);

    // Note: Always called back synchronously.
    this.model.scaleRoot().subscribe(scaleRoot => {
      this.scaleRoot = scaleRoot;

      // Note: AccidentalDisplayPref doesn't matter here, since A is natural...
      this.globalTunePitch = new DisplayedMidiPitch(
        MIDI_PITCH_A4, AccidentalDisplayPref.SHARPS, settings);

      changeDetector.markForCheck();
    });
  }

  async handleGlobalTuneBlur(): Promise<void> {
    if (!this.globalTuneInput) {
      return;
    }

    const parseResult = this.model.inputParser().forScaleRoot()
      .parseGlobalTuneA4Hz(this.globalTuneInput.nativeElement.value);
    if (parseResult.hasValidValue()) {
      await this.model.setGlobalTuneA4Hz(parseResult.getValue());
    }

    this.globalTuneInput.nativeElement.value = this.scaleRoot.globalTuneA4Hz.toFixed(2);
  }
}
