// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TestBed} from '@angular/core/testing';

import {MidiService} from './midi.service';

describe('MidiService', () => {
  let service: MidiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
