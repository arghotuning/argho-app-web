import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TuningMetadataComponent} from './tuning-metadata.component';

describe('TuningMetadataComponent', () => {
  let component: TuningMetadataComponent;
  let fixture: ComponentFixture<TuningMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TuningMetadataComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TuningMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
