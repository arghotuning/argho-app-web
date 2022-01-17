// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleRootComponent} from './scale-root.component';

describe('ScaleRootComponent', () => {
  let component: ScaleRootComponent;
  let fixture: ComponentFixture<ScaleRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleRootComponent],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
