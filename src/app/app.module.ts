// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {EditorModule} from './features/editor/editor.module';
import {NavModule} from './features/nav/nav.module';
import {SimplePagesModule} from './features/simple-pages/simple-pages.module';
import {UiInfraModule} from './infra/ui/ui.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    EditorModule,
    NavModule,
    SimplePagesModule,
    UiInfraModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
