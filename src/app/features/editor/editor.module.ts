// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {EditorComponent} from './editor.component';
import {ErrorDialogComponent} from './file-buttons/error-dialog.component';
import {FileButtonsComponent} from './file-buttons/file-buttons.component';
import {MappingEditorComponent} from './mapping-editor/mapping-editor.component';
import {MappingMetadataComponent} from './mapping-editor/mapping-metadata/mapping-metadata.component';
import {MappingTableComponent} from './mapping-editor/mapping-table/mapping-table.component';
import {ScaleEditorComponent} from './scale-editor/scale-editor.component';
import {ScaleRootComponent} from './scale-editor/scale-root/scale-root.component';
import {ScaleTableConfigComponent} from './scale-editor/scale-table/scale-table-config.component';
import {ScaleTableComponent} from './scale-editor/scale-table/scale-table.component';
import {TuningAnalysisComponent} from './tuning-analysis/tuning-analysis.component';
import {TuningMetadataComponent} from './tuning-metadata/tuning-metadata.component';
import {SynthControlsComponent} from './tuning-player/synth-controls.component';
import {TuningPlayerComponent} from './tuning-player/tuning-player.component';
import {TuningResizeDialogComponent} from './tuning-size/tuning-resize-dialog.component';
import {TuningSizeComponent} from './tuning-size/tuning-size.component';

@NgModule({
  declarations: [
    EditorComponent,
    ErrorDialogComponent,
    FileButtonsComponent,
    MappingEditorComponent,
    MappingMetadataComponent,
    MappingTableComponent,
    ScaleEditorComponent,
    ScaleRootComponent,
    ScaleTableComponent,
    ScaleTableConfigComponent,
    SynthControlsComponent,
    TuningAnalysisComponent,
    TuningMetadataComponent,
    TuningPlayerComponent,
    TuningResizeDialogComponent,
    TuningSizeComponent,
  ],
  imports: [
    CommonModule,
    UiInfraModule,
  ],
  entryComponents: [
    ErrorDialogComponent,
    TuningResizeDialogComponent,
  ],
  exports: [EditorComponent],
})
export class EditorModule { }
