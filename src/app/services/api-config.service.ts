import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * ApiConfigService
 * 
 * Servicio centralizado para gestionar la configuración de la API.
 * Proporciona la URL base para todas las peticiones HTTP.
 * 
 * Beneficios:
 * - Una única fuente de verdad para la URL base
 * - Facilita cambios de configuración dinámicos
 * - Permite inyectar la URL en todos los servicios
 * - Evita duplicación de URLs en múltiples archivos
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  /**
   * URL base de la API según el entorno.
   * En desarrollo: http://0.0.0.0:8001
   * En producción: https://kxephsiy7f.execute-api.us-east-2.amazonaws.com
   */
  private readonly baseUrl: string = environment.apiUrl;

  constructor() {
    console.debug(`[ApiConfigService] Iniciado con URL base: ${this.baseUrl}`);
  }

  /**
   * Obtiene la URL base de la API.
   * @returns URL base sin trailing slash
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Construye una URL completa para un endpoint.
   * @param endpoint - Ruta relativa (ej: '/products', '/sales/123')
   * @returns URL completa para el endpoint
   * 
   * @example
   * // Resulta en: http://0.0.0.0:8001/products
   * buildUrl('/products')
   * 
   * // Resulta en: http://0.0.0.0:8001/sales/123
   * buildUrl('/sales/123')
   */
  buildUrl(endpoint: string): string {
    // Asegurar que endpoint comienza con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  /**
   * Verifica si estamos en modo producción.
   * @returns true si es producción, false si es desarrollo
   */
  isProduction(): boolean {
    return environment.production;
  }
}
