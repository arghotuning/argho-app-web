import {BehaviorSubject, Observable} from 'rxjs';

import {Injectable} from '@angular/core';

import {ScaleTableColGroup, ScaleTableUiConfig} from './scale-table-ui-config';

/** Manages UI configuration data for scale table. */
@Injectable({providedIn: 'root'})
export class ScaleTableService {
  private readonly config_: BehaviorSubject<ScaleTableUiConfig>;

  constructor() {
    this.config_ = new BehaviorSubject<ScaleTableUiConfig>(
      ScaleTableUiConfig.withAllColumns(),
    );
  }

  /**
   * Returns observable stream of updates published whenever the
   * configuration is changed.
   *
   * Always immediately yields the current value upon subscription.
   */
  config(): Observable<ScaleTableUiConfig> {
    return this.config_;
  }

  // TODO: Add support for initializing to defaults based on viewport.

  /** Adds given column group to config; updates observers. */
  showColGroup(colGroup: ScaleTableColGroup) {
    const oldGroups = this.config_.value.colGroups;
    const newGroups = oldGroups.add(colGroup);
    this.config_.next(new ScaleTableUiConfig(newGroups));
  }

  /** Removes given column group from config; updates observers. */
  hideColGroup(colGroup: ScaleTableColGroup) {
    const oldGroups = this.config_.value.colGroups;
    const newGroups = oldGroups.remove(colGroup);
    this.config_.next(new ScaleTableUiConfig(newGroups));
  }
}
