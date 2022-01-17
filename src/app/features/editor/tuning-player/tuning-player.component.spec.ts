// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TuningPlayerComponent} from './tuning-player.component';

describe('TuningPlayerComponent', () => {
  let component: TuningPlayerComponent;
  let fixture: ComponentFixture<TuningPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TuningPlayerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
