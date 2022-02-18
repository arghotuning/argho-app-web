// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TuningSizeComponent} from './tuning-size.component';

describe('TuningSizeComponent', () => {
  let component: TuningSizeComponent;
  let fixture: ComponentFixture<TuningSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TuningSizeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
