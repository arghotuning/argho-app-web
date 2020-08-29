import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FileButtonsComponent} from './file-buttons.component';

describe('FileButtonsComponent', () => {
  let component: FileButtonsComponent;
  let fixture: ComponentFixture<FileButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileButtonsComponent],
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
