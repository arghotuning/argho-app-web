import {Set} from 'immutable';

/** Optional column groups that can be shown/hidden. */
export enum ScaleTableColGroup {
  INPUT_KEY,
  RATIO,
  CENTS,
  FREQ,
  COMPARE_12TET,
}

/** Immutable snapshot of scale table UI configuration. */
export class ScaleTableUiConfig {
  static withAllColumns(): ScaleTableUiConfig {
    const allColGroups = Set([
      ScaleTableColGroup.INPUT_KEY,
      ScaleTableColGroup.RATIO,
      ScaleTableColGroup.CENTS,
      ScaleTableColGroup.FREQ,
      ScaleTableColGroup.COMPARE_12TET,
    ]);
    return new ScaleTableUiConfig(allColGroups);
  }

  /** @param colGroups Currently enabled (shown) column groups. */
  constructor(public readonly colGroups: Set<ScaleTableColGroup>) {}
};
