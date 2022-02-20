// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WebMidiInputComponent} from './web-midi-input.component';

describe('WebMidiInputComponent', () => {
  let component: WebMidiInputComponent;
  let fixture: ComponentFixture<WebMidiInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebMidiInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebMidiInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
