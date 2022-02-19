// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {AccidentalDisplayPref} from '@arghotuning/arghotun';

import {TuningMetadataComponent} from './tuning-metadata.component';

describe('TuningMetadataComponent', () => {
  let component: TuningMetadataComponent;
  let fixture: ComponentFixture<TuningMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TuningMetadataComponent],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function panelTitle(): DebugElement {
    return fixture!.debugElement.query(By.css('mat-panel-title'));
  }

  function tuningNameInput(): DebugElement {
    return fixture!.debugElement.query(By.css('.tuning-name'));
  }

  function tuningDescInput(): DebugElement {
    return fixture!.debugElement.query(By.css('.tuning-desc'));
  }

  function flatsButton(): DebugElement {
    return fixture!.debugElement.query(By.css('mat-button-toggle[value="FLATS"]'));
  }

  function sharpsButton(): DebugElement {
    return fixture!.debugElement.query(By.css('mat-button-toggle[value="SHARPS"]'));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect name changes', async () => {
    // Initial name should be Untitled Tuning.
    expect(panelTitle().nativeElement.textContent).toContain('Untitled Tuning');
    expect(tuningNameInput().nativeElement.value).toEqual('Untitled Tuning');

    // If data model name is changed...
    const data: TuningDataService = TestBed.get(TuningDataService);
    await data.model.edit().setTuningName('Updated Tuning Name');
    fixture.detectChanges();

    // ...the UI should reflect that update.
    expect(panelTitle().nativeElement.textContent).toContain('Updated Tuning Name');
    expect(tuningNameInput().nativeElement.value).toEqual('Updated Tuning Name');
  });

  it('should update name on input change', () => {
    // Initial name should be Untitled Tuning.
    const data: TuningDataService = TestBed.get(TuningDataService);
    expect(data.model.getTuningSnapshot().getMetadata().getName()).toEqual('Untitled Tuning');

    // If input field is changed...
    const nameInput = tuningNameInput();
    (nameInput.nativeElement as HTMLInputElement).value = '  Updated Tuning  \t\n Name  ';
    nameInput.triggerEventHandler('change', {});

    // ...tuning data model should be updated (with whitespace collapsed).
    expect(data.model.getTuningSnapshot().getMetadata().getName()).toEqual('Updated Tuning Name');
  });

  it('should reflect description changes', async () => {
    // Initial description should be empty.
    expect(tuningDescInput().nativeElement.value).toEqual('');

    // If data model description is changed...
    const data: TuningDataService = TestBed.get(TuningDataService);
    await data.model.edit().setDescription('Updated description for tuning');
    fixture.detectChanges();

    // ...the UI should reflect that update.
    expect(tuningDescInput().nativeElement.value).toEqual('Updated description for tuning');
  });

  it('should update description on input change', () => {
    // Initial description should be empty.
    const data: TuningDataService = TestBed.get(TuningDataService);
    expect(data.model.getTuningSnapshot().getMetadata().getDescription()).toEqual('');

    // If input field is changed...
    const descInput = tuningDescInput();
    (descInput.nativeElement as HTMLTextAreaElement).value =
      '  Updated description for \t\n  tuning  ';
    descInput.triggerEventHandler('change', {});

    // ...tuning data model should be updated (with whitespace collapsed).
    expect(data.model.getTuningSnapshot().getMetadata().getDescription())
      .toEqual('Updated description for tuning');
  });

  it('should reflect accidental display pref changes', async () => {
    // Initial accidental display pref should be SHARPS.
    expect(flatsButton().classes['mat-button-toggle-checked']).toBeFalsy();
    expect(sharpsButton().classes['mat-button-toggle-checked']).toBeTruthy();

    // If data model accidental pref is changed...
    const data: TuningDataService = TestBed.get(TuningDataService);
    await data.model.edit().setDisplayAccidentalsAs(AccidentalDisplayPref.FLATS);
    fixture.detectChanges();

    // ...the UI should reflect that update.
    expect(flatsButton().classes['mat-button-toggle-checked']).toBeTruthy();
    expect(sharpsButton().classes['mat-button-toggle-checked']).toBeFalsy();
  });

  it('should update accidental display pref when toggled', () => {
    // Initial display pref should be SHARPS.
    const data: TuningDataService = TestBed.get(TuningDataService);
    expect(data.model.getTuningSnapshot().getMetadata().getDisplayAccidentalsAs())
      .toEqual(AccidentalDisplayPref.SHARPS);

    // If the flats button is pressed...
    flatsButton().query(By.css('.mat-button-toggle-button')).nativeElement.click();

    // ...tuning data model should be updated.
    expect(data.model.getTuningSnapshot().getMetadata().getDisplayAccidentalsAs())
      .toEqual(AccidentalDisplayPref.FLATS);
  });
});
