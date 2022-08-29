// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ComingSoonComponent} from './features/simple-pages/coming-soon/coming-soon.component';
import {SimplePagesModule} from './features/simple-pages/simple-pages.module';

const routes: Routes = [
  {
    path: '',
    component: ComingSoonComponent,
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
  exports: [RouterModule],
})
export class AppRoutingModule {}
