# Código Final - Configuración API Base4Empresas

Este documento muestra el código final propuesto para la configuración centralizada de API.

---

## 1. ApiConfigService (Nuevo)

**Archivo:** `src/app/services/api-config.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

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
  providedIn: "root",
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
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
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
```

---

## 2. app.config.ts (Actualizado)

**Archivo:** `src/app/app.config.ts`

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";
import { apiErrorInterceptor } from "./interceptors/api-error.interceptor";
import { ApiConfigService } from "./services/api-config.service";

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
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideAnimations(), // Requerido por Angular Material
    ApiConfigService, // Servicio centralizado para configuración de API
  ],
};
```

---

## 3. Interceptor de Errores Mejorado

**Archivo:** `src/app/interceptors/api-error.interceptor.ts`

```typescript
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { NotificationService } from "../services/notification.service";

type FastApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

/**
 * Formatea errores de validación de FastAPI (HTTP 422)
 * Extrae los campos y mensajes de validación
 */
function formatFastApi422(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;

  const lines = (detail as FastApiValidationError[])
    .map((e) => {
      const loc = Array.isArray(e.loc) ? e.loc : [];
      const field = loc.length ? String(loc[loc.length - 1]) : "field";
      const msg = e.msg ? String(e.msg) : "Valor inválido";
      return `${field}: ${msg}`;
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : null;
}

/**
 * Extrae el detalle del error de una respuesta FastAPI
 * FastAPI típicamente responde con: { detail: ... }
 */
function extractFastApiDetail(errBody: any): unknown {
  if (errBody && typeof errBody === "object" && "detail" in errBody) {
    return (errBody as any).detail;
  }
  return null;
}

/**
 * Interceptor global de errores HTTP
 *
 * Maneja errores HTTP con mensajes amigables para el usuario:
 * - 0 (CORS/conexión): Error de conexión
 * - 400: Solicitud inválida (errores de validación)
 * - 401: No autorizado
 * - 403: Acceso denegado
 * - 404: Recurso no encontrado
 * - 409: Conflicto (ej. stock modificado, concurrencia)
 * - 422: Error de validación FastAPI
 * - 500+: Error interno del servidor
 *
 * Integración con NotificationService para mostrar mensajes al usuario.
 */
export function apiErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        notifications.error("Error inesperado en la aplicación");
        return throwError(() => err);
      }

      // Opción: si el header X-Skip-Error-Toast es true, no mostrar notificación
      // (útil cuando el componente ya maneja el error)
      const skipErrorToast = req.headers.has("X-Skip-Error-Toast") ? req.headers.get("X-Skip-Error-Toast") === "true" : false;

      const status = err.status;
      const detail = extractFastApiDetail(err.error);
      let message: string | null = null;

      // === Error de conexión / CORS / backend caído ===
      if (status === 0) {
        if (!skipErrorToast) {
          notifications.error("No se pudo conectar con el servidor. " + "Por favor, verifica que el backend está activo y accesible.");
        }
        return throwError(() => err);
      }

      // === 400: Solicitud inválida ===
      if (status === 400) {
        message = typeof detail === "string" ? detail : null;
        if (!skipErrorToast) {
          notifications.error(message ? `Solicitud inválida: ${message}` : "La solicitud contiene datos inválidos");
        }
        return throwError(() => err);
      }

      // === 401: No autorizado ===
      if (status === 401) {
        if (!skipErrorToast) {
          notifications.warning("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        return throwError(() => err);
      }

      // === 403: Acceso denegado ===
      if (status === 403) {
        if (!skipErrorToast) {
          notifications.warning("No tienes permiso para realizar esta acción.");
        }
        return throwError(() => err);
      }

      // === 404: Recurso no encontrado ===
      if (status === 404) {
        message = typeof detail === "string" ? detail : null;
        if (!skipErrorToast) {
          notifications.error(message ? `Recurso no encontrado: ${message}` : "El recurso solicitado no existe.");
        }
        return throwError(() => err);
      }

      // === 409: Conflicto (stock modificado, concurrencia, etc.) ===
      if (status === 409) {
        message = typeof detail === "string" ? detail : null;
        if (!skipErrorToast) {
          // Mostrar advertencia con contexto específico para conflictos
          notifications.warning(message ? `Conflicto: ${message}` : "El recurso ha sido modificado. Por favor, recarga los datos e intenta nuevamente.");
        }
        return throwError(() => err);
      }

      // === 422: Error de validación (FastAPI) ===
      if (status === 422) {
        message = formatFastApi422(detail) ?? (typeof detail === "string" ? detail : null);
        if (!skipErrorToast) {
          notifications.error(message ?? "Por favor, verifica los datos ingresados.");
        }
        return throwError(() => err);
      }

      // === 5xx: Error interno del servidor ===
      if (status >= 500) {
        if (!skipErrorToast) {
          notifications.error("Error interno del servidor. Por favor, intenta nuevamente más tarde.");
        }
        return throwError(() => err);
      }

      // === Fallback genérico ===
      message = typeof detail === "string" ? detail : null;
      if (!skipErrorToast) {
        notifications.error(message ?? `Error HTTP ${status}`);
      }
      return throwError(() => err);
    }),
  );
}
```

---

## 4. ProductsService (Refactorizado)

**Archivo:** `src/app/services/products.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { Product, ProductCreate } from "../models/product.model";
import { ApiConfigService } from "./api-config.service";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    // Obtener URL base del servicio centralizado
    this.apiUrl = this.apiConfig.buildUrl("/products");
  }

  /**
   * Backend: GET /products?search=&is_active=
   * (mantenemos compat con el parámetro legacy q, pero preferimos search)
   */
  getProducts(options?: {
    search?: string;
    isActive?: boolean;
    q?: string; // legacy
  }): Observable<Product[]> {
    let params = new HttpParams();

    const search = options?.search ?? options?.q;
    if (search) params = params.set("search", search);

    if (typeof options?.isActive === "boolean") {
      params = params.set("is_active", String(options.isActive));
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Product>(url);
  }

  createProduct(payload: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload);
  }

  updateProduct(id: string, payload: Partial<ProductCreate>): Observable<Product> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.put<Product>(url, payload);
  }

  deleteProduct(id: string): Observable<void> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.delete<void>(url);
  }
}
```

---

## 5. SalesService (Refactorizado)

**Archivo:** `src/app/services/sales.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";

import { SaleCreate, SaleCreateResponse, SaleDetail, SaleListItem, SaleResponse, SaleCostsSummary } from "../models/sale.model";
import { ApiConfigService } from "./api-config.service";

@Injectable({
  providedIn: "root",
})
export class SalesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    // Obtener URL base del servicio centralizado
    this.apiUrl = this.apiConfig.buildUrl("/sales");
  }

  /**
   * POST /sales devuelve un dict { id, number, total } (no el SaleResponse completo).
   */
  createSale(payload: SaleCreate): Observable<SaleCreateResponse> {
    return this.http.post<SaleCreateResponse>(this.apiUrl, payload);
  }

  getSales(): Observable<SaleListItem[]> {
    return this.http.get<SaleResponse[]>(this.apiUrl).pipe(map((rows) => rows.map((s) => this.enrichSaleCosts(s))));
  }

  getSaleById(id: string): Observable<SaleDetail> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SaleResponse>(url).pipe(map((s) => this.enrichSaleCosts(s)));
  }

  private enrichSaleCosts<T extends SaleResponse>(sale: T): T & SaleCostsSummary {
    const items = sale.items || [];
    const cost_total = items.reduce((acc, it) => acc + (Number(it.total_cost) || 0), 0);
    const gross_profit = (Number(sale.total) || 0) - cost_total;
    const gross_margin_pct = (Number(sale.total) || 0) > 0 ? (gross_profit / (Number(sale.total) || 1)) * 100 : 0;

    return {
      ...(sale as any),
      cost_total,
      gross_profit,
      gross_margin_pct,
    };
  }
}
```

---

## 6. InventoryService (Refactorizado)

**Archivo:** `src/app/services/inventory.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { InventoryValuationResponse } from "../models/inventory.model";
import { ApiConfigService } from "./api-config.service";

@Injectable({
  providedIn: "root",
})
export class InventoryService {
  private valuationUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    // Obtener URL base del servicio centralizado
    this.valuationUrl = this.apiConfig.buildUrl("/inventory/valuation");
  }

  /**
   * GET /inventory/valuation?warehouse_id=...&product_id=...&at=...
   */
  getValuationAt(warehouseId: string, productId: string, atIso: string): Observable<InventoryValuationResponse> {
    const params = new HttpParams().set("warehouse_id", warehouseId).set("product_id", productId).set("at", atIso);

    return this.http.get<InventoryValuationResponse>(this.valuationUrl, { params });
  }
}
```

---

## 7. Configuración de Entornos

### Development

**Archivo:** `src/environments/environment.development.ts`

```typescript
// Development environment
export const environment = {
  production: false,
  apiUrl: "http://0.0.0.0:8001",
};
```

### Production

**Archivo:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: "https://kxephsiy7f.execute-api.us-east-2.amazonaws.com",
};
```

---

## Resumen de Cambios

| Aspecto                      | Antes        | Después                 |
| ---------------------------- | ------------ | ----------------------- |
| Importaciones de environment | 5+ servicios | 0 servicios             |
| URLs hardcodeadas            | Múltiples    | Centralizadas           |
| Punto de configuración       | Disperso     | Un servicio             |
| Cambios de URL               | Recompilar   | Dinámico                |
| Manejo de 409                | Genérico     | Específico              |
| Header skip errors           | No           | Sí (X-Skip-Error-Toast) |

---

## Próximos Pasos

1. **Refactorizar servicios restantes** usando los patrones anteriores
2. **Ejecutar tests** para validar compatibilidad
3. **Probar en desarrollo y producción** para verificar configuración
4. **Revisar code** para asegurar calidad
