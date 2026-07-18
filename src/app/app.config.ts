import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { apiErrorInterceptor } from './interceptors/api-error.interceptor';
import { ApiConfigService } from './services/api-config.service';

/**
 * Configuración principal de la aplicación
 * 
 * Incluye:
 * - Router con rutas definidas
 * - HTTP Client para peticiones
 * - Animaciones (requerido por Material)
 * - Hidratación del cliente (SSR)
 * - ApiConfigService para gestionar configuración centralizada de URL base
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    //provideClientHydration(),
    provideHttpClient(),
    provideAnimations(), // Requerido por Angular Material
    ApiConfigService // Servicio centralizado para configuración de API
  ]
};
