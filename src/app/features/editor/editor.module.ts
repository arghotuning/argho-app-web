import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {EditorComponent} from './editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    UiInfraModule,
  ],
  exports: [EditorComponent],
})
export class EditorModule { }
