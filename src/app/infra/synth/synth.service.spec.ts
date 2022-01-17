// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TestBed} from '@angular/core/testing';

import {SynthService} from './synth.service';

describe('SynthService', () => {
  let service: SynthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SynthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
