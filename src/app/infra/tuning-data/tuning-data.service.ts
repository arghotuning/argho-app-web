// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {debounceTime, mapTo, merge, Observable, skip} from 'rxjs';

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

    // NOTE: This service is a singleton, so no need to track and unsubscribe.
    this.anyTuningChange().subscribe(() => this.updateKeyToSoundMap_());
  }

  /** Returns stream that notifies whenever tuning is changed in any way. */
  anyTuningChange(): Observable<void> {
    // TODO: Consider providing this support from argho-editor-js library.
    const merged = merge(
      this.model.tuningMetadata(),
      this.model.scaleMetadata(),
      this.model.scaleRoot(),
      this.model.upperDegrees(),
      this.model.mappedKeys(),
    );

    // Consolidate any updates that occur within the same event loop. Skip the
    // first event, since all of the above emit a value immediately upon
    // subscription.
    return merged.pipe(debounceTime(0), skip(1), mapTo<void>(undefined));
  }

  private updateKeyToSoundMap_(): void {
    this.keyToSoundMap_ = KeyToSoundMap.calcFor(this.context, this.model.getTuningSnapshot());
  }

  keyToSoundMap(): KeyToSoundMap {
    return this.keyToSoundMap_;
  }
}
