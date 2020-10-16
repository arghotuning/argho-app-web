import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {EditorComponent} from './features/editor/editor.component';
import {EditorModule} from './features/editor/editor.module';
import {OverviewComponent} from './features/simple-pages/overview/overview.component';
import {SimplePagesModule} from './features/simple-pages/simple-pages.module';

const routes: Routes = [
  {
    path: 'editor',
    component: EditorComponent,
  },
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
    EditorModule,
    RouterModule.forRoot(routes),
    SimplePagesModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
