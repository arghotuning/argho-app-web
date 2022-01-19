// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AboutComponent} from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
