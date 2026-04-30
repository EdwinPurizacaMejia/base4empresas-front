import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

/**
 * Configuración principal de la aplicación
 * 
 * Incluye:
 * - Router con rutas definidas
 * - HTTP Client para peticiones
 * - Animaciones (requerido por Material)
 * - Hidratación del cliente (SSR)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations() // Requerido por Angular Material
  ]
};
