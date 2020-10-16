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

  constructor() {
    this.context = new ArghoEditorContext({
      translations: defaultArghoEditorTranslations(),
    });
    this.model = ArghoEditorModel.default12tet(this.context);
  }
}
