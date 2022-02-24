// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TestBed} from '@angular/core/testing';

import {TuningDataService} from './tuning-data.service';

describe('TuningDataService', () => {
  let service: TuningDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuningDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fire on changes that occur after anyTuningChange()', async () => {
    // Subscribe to changes.
    let changeCount = 0;
    service.anyTuningChange().subscribe(() => {
      changeCount++;
    });

    expect(changeCount).toBe(0);

    // We're still in the same JS event loop iteration; make a change to tuning.
    await service.model.resetToDefault12tet();

    // No change should be broadcast yet, since anyTuningChange() uses
    // debounceTime(0).
    expect(changeCount).toBe(0);

    // But in the next JS event loop, we should get 1 change.
    await new Promise<void>(resolve => {
      setTimeout(() => {
        expect(changeCount).toBe(1);
        resolve();
      }, 0);
    });
  });
});
