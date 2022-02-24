// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FileButtonsComponent} from './file-buttons.component';

describe('FileButtonsComponent', () => {
  let component: FileButtonsComponent;
  let fixture: ComponentFixture<FileButtonsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FileButtonsComponent],
      imports: [UiInfraModule],
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
