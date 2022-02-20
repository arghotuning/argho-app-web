// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ToolbarComponent} from './toolbar.component';

const MENU_BUTTON = By.css('button');
const TOOLBAR_TITLE = By.css('.toolbar-title');

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display app title', () => {
    const titleEl = fixture.debugElement.query(TOOLBAR_TITLE).nativeElement as Element;
    expect(titleEl.textContent).toContain('Argho Tuning');
  });

  it('should emit menuClicked event when menu button is clicked', () => {
    let eventCount = 0;
    component.menuClick.subscribe(() => { eventCount++; });

    const button = fixture.debugElement.query(MENU_BUTTON);
    button.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(eventCount).toEqual(1);
  });
});
