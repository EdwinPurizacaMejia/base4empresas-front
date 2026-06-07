import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Registrar locale peruano para formateo de monedas
registerLocaleData(localeEsPe, 'es-PE');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
