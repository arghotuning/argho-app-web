import {Injectable} from '@angular/core';
import {
  ArghoEditorContext,
  ArghoEditorModel,
  defaultArghoEditorTranslations,
} from '@arghotuning/argho-editor';
import {KeyToSoundMap} from '@arghotuning/arghotun';

/** Manages shared tuning editor data model. */
@Injectable({providedIn: 'root'})
export class TuningDataService {
  public readonly context: ArghoEditorContext;

  /** Tuning editor data model. */
  public readonly model: ArghoEditorModel;

  /** Output frequencies computed for WebMIDI/WebAudio playback. */
  private keyToSoundMap_: KeyToSoundMap;
  private keyToSoundMapNeedsUpdate_ = false;

  constructor() {
    this.context = new ArghoEditorContext({
      translations: defaultArghoEditorTranslations(),
    });
    this.model = ArghoEditorModel.default12tet(this.context);

    this.keyToSoundMap_ = KeyToSoundMap.calcFor(this.context, this.model.getTuningSnapshot());

    // Re-calculate output frequencies whenever tuning changes.
    const updateTuning = () => {
      this.keyToSoundMapNeedsUpdate_ = true;

      // Don't actually update until stack unwinds, to avoid unnecessary
      // re-calculation for multiple subscription callbacks about the same
      // change.
      setTimeout(() => {
        if (this.keyToSoundMapNeedsUpdate_) {
          this.keyToSoundMap_ = KeyToSoundMap.calcFor(this.context, this.model.getTuningSnapshot());
          this.keyToSoundMapNeedsUpdate_ = false;
        }
      }, 0);
    };

    this.model.scaleMetadata().subscribe(updateTuning);
    this.model.scaleRoot().subscribe(updateTuning);
    this.model.upperDegrees().subscribe(updateTuning);
    this.model.mappedKeys().subscribe(updateTuning);
  }

  keyToSoundMap(): KeyToSoundMap {
    return this.keyToSoundMap_;
  }
}
