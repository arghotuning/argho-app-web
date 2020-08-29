import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {EditorComponent} from './editor.component';
import {FileButtonsComponent} from './file-buttons/file-buttons.component';
import {MappingEditorComponent} from './mapping-editor/mapping-editor.component';
import {ScaleEditorComponent} from './scale-editor/scale-editor.component';
import {TuningAnalysisComponent} from './tuning-analysis/tuning-analysis.component';
import {TuningMetadataComponent} from './tuning-metadata/tuning-metadata.component';
import { TuningPlayerComponent } from './tuning-player/tuning-player.component';

@NgModule({
  declarations: [
    EditorComponent,
    FileButtonsComponent,
    MappingEditorComponent,
    ScaleEditorComponent,
    TuningAnalysisComponent,
    TuningMetadataComponent,
    TuningPlayerComponent,
  ],
  imports: [
    CommonModule,
    UiInfraModule,
  ],
  exports: [EditorComponent],
})
export class EditorModule { }
