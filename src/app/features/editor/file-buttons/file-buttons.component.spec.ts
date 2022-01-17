// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

import {ErrorDialogComponent} from './error-dialog.component';
import {FileButtonsComponent} from './file-buttons.component';

describe('FileButtonsComponent', () => {
  let component: FileButtonsComponent;
  let fixture: ComponentFixture<FileButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileButtonsComponent],
      imports: [UiInfraModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ErrorDialogComponent],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
