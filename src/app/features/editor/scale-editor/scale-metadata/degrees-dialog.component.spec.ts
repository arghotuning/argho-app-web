import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DegreesDialogComponent} from './degrees-dialog.component';

describe('DegreesDialogComponent', () => {
  let component: DegreesDialogComponent;
  let fixture: ComponentFixture<DegreesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DegreesDialogComponent],
      imports: [UiInfraModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DegreesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
