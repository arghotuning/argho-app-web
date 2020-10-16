import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

import {KeySpanDialogComponent} from './key-span-dialog.component';
import {MappingMetadataComponent} from './mapping-metadata.component';

describe('MappingMetadataComponent', () => {
  let component: MappingMetadataComponent;
  let fixture: ComponentFixture<MappingMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KeySpanDialogComponent,
        MappingMetadataComponent,
      ],
      imports: [UiInfraModule],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [KeySpanDialogComponent],
      },
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
