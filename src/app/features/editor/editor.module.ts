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
import {KeySpanDialogComponent} from './mapping-editor/mapping-metadata/key-span-dialog.component';
import {MappingMetadataComponent} from './mapping-editor/mapping-metadata/mapping-metadata.component';
import {MappingTableComponent} from './mapping-editor/mapping-table/mapping-table.component';
import {ScaleEditorComponent} from './scale-editor/scale-editor.component';
import {DegreesDialogComponent} from './scale-editor/scale-metadata/degrees-dialog.component';
import {OctavesDialogComponent} from './scale-editor/scale-metadata/octaves-dialog.component';
import {ScaleMetadataComponent} from './scale-editor/scale-metadata/scale-metadata.component';
import {ScaleRootComponent} from './scale-editor/scale-root/scale-root.component';
import {ScaleTableConfigComponent} from './scale-editor/scale-table/scale-table-config.component';
import {ScaleTableComponent} from './scale-editor/scale-table/scale-table.component';
import {TuningAnalysisComponent} from './tuning-analysis/tuning-analysis.component';
import {TuningMetadataComponent} from './tuning-metadata/tuning-metadata.component';
import {TuningPlayerComponent} from './tuning-player/tuning-player.component';
import {TuningResizeDialogComponent} from './tuning-size/tuning-resize-dialog.component';
import {TuningSizeComponent} from './tuning-size/tuning-size.component';

@NgModule({
  declarations: [
    DegreesDialogComponent,
    EditorComponent,
    ErrorDialogComponent,
    FileButtonsComponent,
    KeySpanDialogComponent,
    MappingEditorComponent,
    MappingMetadataComponent,
    MappingTableComponent,
    OctavesDialogComponent,
    ScaleEditorComponent,
    ScaleMetadataComponent,
    ScaleRootComponent,
    ScaleTableComponent,
    ScaleTableConfigComponent,
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
    DegreesDialogComponent,
    ErrorDialogComponent,
    KeySpanDialogComponent,
    OctavesDialogComponent,
  ],
  exports: [EditorComponent],
})
export class EditorModule { }
