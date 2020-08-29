import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleEditorComponent} from './scale-editor.component';

describe('ScaleEditorComponent', () => {
  let component: ScaleEditorComponent;
  let fixture: ComponentFixture<ScaleEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleEditorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
