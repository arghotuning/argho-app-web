// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {Set} from 'immutable';
import * as immutableMatchers from 'jasmine-immutable-matchers';
import {Subscription} from 'rxjs';

import {TestBed} from '@angular/core/testing';

import {ScaleTableColGroup, ScaleTableUiConfig} from './scale-table-ui-config';
import {ScaleTableService} from './scale-table.service';

/** Holds on to rxjs subscriptions for cleanup. */
class SubscriptionManager {
  private readonly subs: Subscription[] = [];

  add(sub: Subscription) {
    this.subs.push(sub);
  }

  cleanup(): void {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}

let subs: SubscriptionManager;

beforeEach(() => {
  subs = new SubscriptionManager();
});

afterEach(() => {
  subs.cleanup();
});

describe('ScaleTableService', () => {
  let service: ScaleTableService;

  beforeEach(() => {
    jasmine.addMatchers(immutableMatchers);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ScaleTableService);
    expect(service).toBeTruthy();
  });

  it('should default to all columns', () => {
    let gotConfig: ScaleTableUiConfig | null = null;
    subs.add(service.config().subscribe(config => gotConfig = config));

    expect(gotConfig).not.toBeNull();
    expect(gotConfig!.colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.INPUT_KEY,
        ScaleTableColGroup.RATIO,
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
        ScaleTableColGroup.COMPARE_12TET,
      ]),
    );
  });

  it('should hide columns and update observers', () => {
    let gotConfigs: ScaleTableUiConfig[] = [];
    subs.add(service.config().subscribe(config => gotConfigs.push(config)));

    // Should initially be called with defaults (all).
    expect(gotConfigs.length).toEqual(1);

    // Now remove a column group.
    service.hideColGroup(ScaleTableColGroup.RATIO);

    // Expect observer to receive update with removed col.
    expect(gotConfigs.length).toEqual(2);
    expect(gotConfigs[1].colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.INPUT_KEY,
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
        ScaleTableColGroup.COMPARE_12TET,
      ]),
    );

    // Now remove another column group.
    service.hideColGroup(ScaleTableColGroup.INPUT_KEY);

    // Expect observer to receive update with removed col.
    expect(gotConfigs.length).toEqual(3);
    expect(gotConfigs[2].colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
        ScaleTableColGroup.COMPARE_12TET,
      ]),
    );
  });

  it('should show columns and update observers', () => {
    // Hide several column groups to start.
    service.hideColGroup(ScaleTableColGroup.INPUT_KEY);
    service.hideColGroup(ScaleTableColGroup.RATIO);
    service.hideColGroup(ScaleTableColGroup.COMPARE_12TET);

    let gotConfigs: ScaleTableUiConfig[] = [];
    subs.add(service.config().subscribe(config => gotConfigs.push(config)));

    // Should initially be called with the above columns hidden.
    expect(gotConfigs.length).toEqual(1);
    expect(gotConfigs[0].colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
      ]),
    );

    // Now add a column back.
    service.showColGroup(ScaleTableColGroup.COMPARE_12TET);

    // Expect observer to receive update with added col.
    expect(gotConfigs.length).toEqual(2);
    expect(gotConfigs[1].colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
        ScaleTableColGroup.COMPARE_12TET,
      ]),
    );

    // Add another.
    service.showColGroup(ScaleTableColGroup.RATIO);

    expect(gotConfigs.length).toEqual(3);
    expect(gotConfigs[2].colGroups).toEqualImmutable(
      Set([
        ScaleTableColGroup.RATIO,
        ScaleTableColGroup.CENTS,
        ScaleTableColGroup.FREQ,
        ScaleTableColGroup.COMPARE_12TET,
      ]),
    );
  });
});
