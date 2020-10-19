import {Engine, MidiFreqMap} from 'src/app/infra/engine/engine';

import {Injectable} from '@angular/core';
import {
  ArghoEditorContext,
  ArghoEditorModel,
  defaultArghoEditorTranslations,
} from '@arghotuning/argho-editor';

/** Manages shared tuning editor data model. */
@Injectable({providedIn: 'root'})
export class TuningDataService {
  public readonly context: ArghoEditorContext;

  /** Tuning editor data model. */
  public readonly model: ArghoEditorModel;

  /** Engine for WebMIDI/WebAudio playback. */
  private readonly engine_: Engine

  private engineNeedsUpdate_ = false;

  constructor() {
    this.context = new ArghoEditorContext({
      translations: defaultArghoEditorTranslations(),
    });
    this.model = ArghoEditorModel.default12tet(this.context);

    this.engine_ = new Engine(this.model.getTuningSnapshot());

    // Update engine whenever tuning changes.
    const updateTuning = () => {
      this.engineNeedsUpdate_ = true;

      // Don't actually update until stack unwinds, to avoid unnecessary
      // re-calculation for multiple subscription callbacks about the same
      // change.
      setTimeout(() => {
        if (this.engineNeedsUpdate_) {
          this.engine_.updateTuning(this.model.getTuningSnapshot());
          this.engineNeedsUpdate_ = false;
        }
      }, 0);
    };

    this.model.scaleMetadata().subscribe(updateTuning);
    this.model.scaleRoot().subscribe(updateTuning);
    this.model.upperDegrees().subscribe(updateTuning);
    this.model.mappedKeys().subscribe(updateTuning);
  }

  frequencies(): MidiFreqMap {
    return this.engine_.frequencies();
  }
}
