# Guía: Configuración Centralizada de API - base4empresas Frontend

## 📋 Resumen de Cambios

Se ha implementado un servicio `ApiConfigService` centralizado para gestionar la configuración de la URL base de la API. Esto elimina la necesidad de importar `environment` en cada servicio y proporciona una única fuente de verdad para la configuración.

### Archivos Actualizados:

1. ✅ `src/app/services/api-config.service.ts` (CREADO)
2. ✅ `src/app/app.config.ts` (ACTUALIZADO)
3. ✅ `src/app/interceptors/api-error.interceptor.ts` (MEJORADO)
4. ✅ `src/app/services/products.service.ts` (REFACTORIZADO)
5. ✅ `src/app/services/sales.service.ts` (REFACTORIZADO)
6. ✅ `src/app/services/inventory.service.ts` (REFACTORIZADO)

---

## 🏗️ Arquitectura

### ApiConfigService (Centralizado)

**Ubicación:** `src/app/services/api-config.service.ts`

**Métodos principales:**

- `getBaseUrl()`: Retorna la URL base (ej: `http://0.0.0.0:8001` o `https://...`)
- `buildUrl(endpoint)`: Construye URLs completas (ej: `http://0.0.0.0:8001/products`)
- `isProduction()`: Verifica si estamos en producción

**Ventajas:**

- Una única fuente de verdad
- Cambios dinámicos de URL (sin recompilar)
- No requiere importar `environment` en cada servicio
- Facilita inyección de dependencias

---

## 📝 Patrones de Implementación

### Patrón 1: Servicio Simple (GET/POST)

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiConfigService } from "./api-config.service";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    // ✅ Inicializar URL desde el servicio centralizado
    this.apiUrl = this.apiConfig.buildUrl("/products");
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  createProduct(payload: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload);
  }
}
```

### Patrón 2: Servicio con Sub-recursos

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiConfigService } from "./api-config.service";

@Injectable({ providedIn: "root" })
export class OrdersService {
  private apiUrl: string;
  private itemsUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.apiUrl = this.apiConfig.buildUrl("/orders");
    this.itemsUrl = this.apiConfig.buildUrl("/order-items");
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderItems(orderId: string): Observable<OrderItem[]> {
    const params = new HttpParams().set("order_id", orderId);
    return this.http.get<OrderItem[]>(this.itemsUrl, { params });
  }
}
```

### Patrón 3: Servicio con Rutas Dinámicas

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiConfigService } from "./api-config.service";

@Injectable({ providedIn: "root" })
export class SearchService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  searchProducts(query: string): Observable<Product[]> {
    const url = this.apiConfig.buildUrl("/search/products");
    const params = new HttpParams().set("q", query);
    return this.http.get<Product[]>(url, { params });
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    const url = this.apiConfig.buildUrl("/search/suppliers");
    const params = new HttpParams().set("q", query);
    return this.http.get<Supplier[]>(url, { params });
  }
}
```

---

## 🔧 Refactorización de Servicios Existentes

### Servicios Pendientes de Refactorización

Los siguientes servicios aún importan `environment.apiUrl` directamente y deben ser refactorizados siguiendo los patrones anteriores:

```
- categories.service.ts
- costing-config.service.ts
- kardex.service.ts
- purchase.service.ts
- stock.service.ts
- suppliers.service.ts
- units.service.ts
- warehouse.service.ts
- search.service.ts
```

### Paso a Paso para Refactorizar

1. **Abrir el servicio** (ej: `src/app/services/warehouse.service.ts`)

2. **Remover la importación de environment:**

   ```typescript
   // ❌ ANTES
   import { environment } from "../../environments/environment";

   // ✅ DESPUÉS
   // Eliminar esta línea
   ```

3. **Agregar inyección de ApiConfigService:**

   ```typescript
   // ✅ ANTES
   constructor(private http: HttpClient) {}

   // ✅ DESPUÉS
   constructor(
     private http: HttpClient,
     private apiConfig: ApiConfigService
   ) {}
   ```

4. **Crear la propiedad de URL base:**

   ```typescript
   // ✅ DESPUÉS
   private apiUrl: string;

   constructor(
     private http: HttpClient,
     private apiConfig: ApiConfigService
   ) {
     this.apiUrl = this.apiConfig.buildUrl('/warehouses');
   }
   ```

5. **Reemplazar URLs hardcodeadas:**

   ```typescript
   // ❌ ANTES
   private apiUrl = `${environment.apiUrl}/warehouses`;

   // ✅ DESPUÉS
   private apiUrl: string;

   constructor(...) {
     this.apiUrl = this.apiConfig.buildUrl('/warehouses');
   }
   ```

---

## 🛡️ Mejoras al Interceptor de Errores

El `api-error.interceptor.ts` ha sido mejorado con:

### 1. Manejo Específico de HTTP 404

```typescript
if (status === 404) {
  message = typeof detail === "string" ? detail : null;
  if (!skipErrorToast) {
    notifications.error(message ? `Recurso no encontrado: ${message}` : "El recurso solicitado no existe.");
  }
  return throwError(() => err);
}
```

### 2. Mejora para HTTP 409 (Conflictos de Concurrencia/Stock)

```typescript
if (status === 409) {
  message = typeof detail === "string" ? detail : null;
  if (!skipErrorToast) {
    // Mostrar advertencia con contexto específico para conflictos
    notifications.warning(message ? `Conflicto: ${message}` : "El recurso ha sido modificado. Por favor, recarga los datos e intenta nuevamente.");
  }
  return throwError(() => err);
}
```

### 3. Header Opcional para Evitar Notificaciones

En componentes que manejan errores internamente:

```typescript
this.http.get<Product[]>(url, {
  headers: new HttpHeaders().set("X-Skip-Error-Toast", "true"),
});
```

### 4. Mensajes Más Descriptivos

- Todas las notificaciones son más claras y contextuales
- Se especifica la acción recomendada (ej: "recarga los datos")

---

## 🌍 Configuración de Entornos

### development (`src/environments/environment.development.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://0.0.0.0:8001",
};
```

### production (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: "https://kxephsiy7f.execute-api.us-east-2.amazonaws.com",
};
```

---

## 📦 Cómo Compilar Correctamente

### Desarrollo

```bash
ng serve
# Usa environment.development.ts
# URL base: http://0.0.0.0:8001
```

### Producción

```bash
ng build --configuration production
# Usa environment.ts
# URL base: https://kxephsiy7f.execute-api.us-east-2.amazonaws.com
```

---

## ✅ Checklist de Refactorización Completa

- [x] ApiConfigService creado y probado
- [x] app.config.ts actualizado para incluir ApiConfigService
- [x] Interceptor de errores mejorado (404, 409, etc.)
- [x] ProductsService refactorizado
- [x] SalesService refactorizado
- [x] InventoryService refactorizado
- [ ] CategoriesService refactorizar
- [ ] CostingConfigService refactorizar
- [ ] KardexService refactorizar
- [ ] PurchaseService refactorizar
- [ ] StockService refactorizar
- [ ] SuppliersService refactorizar
- [ ] UnitsService refactorizar
- [ ] WarehouseService refactorizar
- [ ] SearchService refactorizar

---

## 🎯 Beneficios de Esta Arquitectura

| Aspecto                          | Antes                                      | Después                           |
| -------------------------------- | ------------------------------------------ | --------------------------------- |
| **Punto único de configuración** | ❌ Múltiples imports de environment        | ✅ Un servicio centralizado       |
| **Duplicación de URLs**          | ❌ Cada servicio define su URL             | ✅ Una sola definición            |
| **Cambios dinámicos**            | ❌ Requiere recompilar                     | ✅ Posible en tiempo de ejecución |
| **Testabilidad**                 | ❌ Dependencia de environment              | ✅ Inyección de dependencias      |
| **Mantenibilidad**               | ❌ Buscar/reemplazar en múltiples archivos | ✅ Cambiar en un solo lugar       |

---

## 🧪 Testing

### Mock de ApiConfigService en Tests

```typescript
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ProductsService } from "./products.service";
import { ApiConfigService } from "./api-config.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let apiConfig: jasmine.SpyObj<ApiConfigService>;

  beforeEach(() => {
    const apiConfigSpy = jasmine.createSpyObj("ApiConfigService", ["buildUrl", "getBaseUrl", "isProduction"]);
    apiConfigSpy.buildUrl.and.returnValue("http://localhost:8001/products");

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService, { provide: ApiConfigService, useValue: apiConfigSpy }],
    });

    service = TestBed.inject(ProductsService);
    apiConfig = TestBed.inject(ApiConfigService) as jasmine.SpyObj<ApiConfigService>;
  });

  it("should use buildUrl from ApiConfigService", () => {
    expect(apiConfig.buildUrl).toHaveBeenCalledWith("/products");
  });
});
```

---

## 📚 Referencias

- **Angular HTTP Client:** https://angular.io/guide/http
- **Angular Dependency Injection:** https://angular.io/guide/dependency-injection
- **Environment Configuration:** https://angular.io/guide/build
- **HTTP Interceptors:** https://angular.io/guide/http#intercepting-requests-and-responses

---

## 📞 Soporte

Si necesitas:

- Refactorizar un servicio específico
- Agregar más métodos a ApiConfigService
- Cambiar la estrategia de configuración

Revisa los patrones anteriores o crea un nuevo issue documentando el caso de uso.
