import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {OverviewComponent} from './features/simple-pages/overview/overview.component';
import {SimplePagesModule} from './features/simple-pages/simple-pages.module';

const routes: Routes = [
  {
    path: '',
    component: OverviewComponent,
  },
  {
    path: '**',
    redirectTo: '/',
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    SimplePagesModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
