import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleTableConfigComponent} from './scale-table-config.component';

describe('ScaleTableConfigComponent', () => {
  let component: ScaleTableConfigComponent;
  let fixture: ComponentFixture<ScaleTableConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiInfraModule],
      declarations: [ScaleTableConfigComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleTableConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
