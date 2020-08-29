import {UiInfraModule} from 'src/app/infra/ui/ui.module';

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [OverviewComponent],
  imports: [
    CommonModule,
    UiInfraModule,
  ],
})
export class SimplePagesModule { }
