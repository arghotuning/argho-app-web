// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleTableComponent} from './scale-table.component';

describe('ScaleTableComponent', () => {
  let component: ScaleTableComponent;
  let fixture: ComponentFixture<ScaleTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleTableComponent],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
