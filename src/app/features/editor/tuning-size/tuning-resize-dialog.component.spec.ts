// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TuningResizeDialogComponent} from './tuning-resize-dialog.component';

describe('TuningResizeDialogComponent', () => {
  let component: TuningResizeDialogComponent;
  let fixture: ComponentFixture<TuningResizeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TuningResizeDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningResizeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
