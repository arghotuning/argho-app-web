import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {EditorComponent} from './editor.component';
import {FileButtonsComponent} from './file-buttons/file-buttons.component';
import {MappingEditorComponent} from './mapping-editor/mapping-editor.component';
import {ScaleEditorComponent} from './scale-editor/scale-editor.component';
import {DegreesDialogComponent} from './scale-editor/scale-metadata/degrees-dialog.component';
import {ScaleMetadataComponent} from './scale-editor/scale-metadata/scale-metadata.component';
import {ScaleRootComponent} from './scale-editor/scale-root/scale-root.component';
import {ScaleTableComponent} from './scale-editor/scale-table/scale-table.component';
import {TuningAnalysisComponent} from './tuning-analysis/tuning-analysis.component';
import {TuningMetadataComponent} from './tuning-metadata/tuning-metadata.component';
import {TuningPlayerComponent} from './tuning-player/tuning-player.component';

@NgModule({
  declarations: [
    DegreesDialogComponent,
    EditorComponent,
    FileButtonsComponent,
    MappingEditorComponent,
    ScaleEditorComponent,
    ScaleMetadataComponent,
    ScaleRootComponent,
    ScaleTableComponent,
    TuningAnalysisComponent,
    TuningMetadataComponent,
    TuningPlayerComponent,
  ],
  imports: [
    CommonModule,
    UiInfraModule,
  ],
  entryComponents: [
    DegreesDialogComponent,
  ],
  exports: [EditorComponent],
})
export class EditorModule { }
