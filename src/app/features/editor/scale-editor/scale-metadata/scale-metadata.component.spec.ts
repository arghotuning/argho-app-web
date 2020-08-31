import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

import {DegreesDialogComponent} from './degrees-dialog.component';
import {OctavesDialogComponent} from './octaves-dialog.component';
import {ScaleMetadataComponent} from './scale-metadata.component';

describe('ScaleMetadataComponent', () => {
  let component: ScaleMetadataComponent;
  let fixture: ComponentFixture<ScaleMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DegreesDialogComponent,
        OctavesDialogComponent,
        ScaleMetadataComponent,
      ],
      imports: [UiInfraModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          DegreesDialogComponent,
          OctavesDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
