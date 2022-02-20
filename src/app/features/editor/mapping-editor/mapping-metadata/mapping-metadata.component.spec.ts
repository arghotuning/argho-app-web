// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MappingMetadataComponent} from './mapping-metadata.component';

describe('MappingMetadataComponent', () => {
  let component: MappingMetadataComponent;
  let fixture: ComponentFixture<MappingMetadataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MappingMetadataComponent,
      ],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
