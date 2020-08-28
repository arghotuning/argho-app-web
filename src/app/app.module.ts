import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavModule} from './features/nav/nav.module';
import {UiInfraModule} from './infra/ui/ui.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    NavModule,
    UiInfraModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
