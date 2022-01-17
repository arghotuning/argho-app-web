// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {
  ArghoEditorSettings,
  DisplayedMidiPitch,
} from '@arghotuning/argho-editor';
import {AccidentalDisplayPref} from '@arghotuning/arghotun';

import {SpelledPitchComponent} from './spelled-pitch.component';

describe('SpelledPitchComponent', () => {
  let component: SpelledPitchComponent;
  let fixture: ComponentFixture<SpelledPitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpelledPitchComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpelledPitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render flat pitch', () => {
    const settings = new ArghoEditorSettings(true, true, 4);
    component.pitch = new DisplayedMidiPitch(61, AccidentalDisplayPref.FLATS, settings);
    fixture.detectChanges();

    const el = fixture.debugElement.nativeElement as Element;
    expect(el.textContent).toEqual('D♭4');
  });

  it('should render sharp pitch', () => {
    const settings = new ArghoEditorSettings(true, true, 4);
    component.pitch = new DisplayedMidiPitch(73, AccidentalDisplayPref.SHARPS, settings);
    fixture.detectChanges();

    const el = fixture.debugElement.nativeElement as Element;
    expect(el.textContent).toEqual('C♯5');
  });

  it('should render natural pitch', () => {
    const settings = new ArghoEditorSettings(true, true, 4);
    component.pitch = new DisplayedMidiPitch(0, AccidentalDisplayPref.SHARPS, settings);
    fixture.detectChanges();

    const el = fixture.debugElement.nativeElement as Element;
    expect(el.textContent).toEqual('C-1');
  });
});
