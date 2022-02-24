// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TuningResizeDialogComponent} from './tuning-resize-dialog.component';
import {TuningSizeComponent} from './tuning-size.component';

describe('TuningSizeComponent', () => {
  let component: TuningSizeComponent;
  let fixture: ComponentFixture<TuningSizeComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        TuningSizeComponent,
        TuningResizeDialogComponent,
      ],
      imports: [UiInfraModule],
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
