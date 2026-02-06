import {NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {provideHttpClient} from '@angular/common/http';
import {ModeToggleService} from './core/modules/mode/mode-toggle.service';
import {MODE_STORAGE_SERVICE, ModeLocalStorageService} from './core/modules/mode/mode-storage.service';
import {provideAnimations} from '@angular/platform-browser/animations';

registerLocaleData(en);

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNzI18n(en_US),
    // provideHttpClient(withInterceptors([AuthHttpInterceptor])),
    provideHttpClient(),
    ModeToggleService,
    {
      provide: MODE_STORAGE_SERVICE,
      useClass: ModeLocalStorageService,
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
