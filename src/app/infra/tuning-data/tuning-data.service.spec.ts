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
});
