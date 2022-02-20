// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TuningAnalysisComponent} from './tuning-analysis.component';

describe('TuningAnalysisComponent', () => {
  let component: TuningAnalysisComponent;
  let fixture: ComponentFixture<TuningAnalysisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TuningAnalysisComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
