// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PianoKeyboardComponent} from './piano-keyboard.component';

describe('PianoKeyboardComponent', () => {
  let component: PianoKeyboardComponent;
  let fixture: ComponentFixture<PianoKeyboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PianoKeyboardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PianoKeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
