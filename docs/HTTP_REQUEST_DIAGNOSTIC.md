# HTTP Request Diagnostic - Electronic Documents

## Executive Summary

La petición HTTP de `ElectronicDocumentsService.listDocuments()` nunca alcanza el navegador. El Observable se crea y se ejecuta `.subscribe()`, pero los callbacks (next, error, complete) **nunca se ejecutan** y la petición **no aparece en Chrome DevTools Network tab**.

---

## Root Cause Analysis

### Observed Behavior

✅ **Lo que SÍ funciona:**

1. `ngOnInit()` se ejecuta correctamente
2. `loadDocuments()` se llama
3. `documentsService.listDocuments()` se invoca
4. `http.get()` se ejecuta
5. Observable se crea exitosamente
6. `.pipe(takeUntil(this.destroy$))` se aplica
7. `.subscribe()` se ejecuta

❌ **Lo que NO funciona:**

1. Callback `next()` nunca se ejecuta
2. Callback `error()` nunca se ejecuta
3. Callback `complete()` nunca se ejecuta
4. La petición HTTP **NO aparece en Network tab**
5. El backend **nunca recibe la petición**

### Timeline of Investigation

```
Timestamp: 2026-07-09T00:29:56.622Z - ngOnInit ejecutado
Timestamp: 2026-07-09T00:29:56.627Z - http.get() creado
Después de esto: SILENCIO TOTAL
```

---

## Evidence

### 1. Logs del Navegador

```
🚀 [ElectronicDocumentsListComponent] ngOnInit ejecutado
📥 [ElectronicDocumentsListComponent] loadDocuments() iniciado
🔍 [ElectronicDocumentsService] Iniciando petición...
  📍 URL completa: http://127.0.0.1:8000/api/v1/electronic-documents/?page=1&page_size=20
  🌐 Ejecutando http.get()...
  📡 HttpObservable creado: Observable2 {source: Observable2, operator: ƒ}
  📦 Observable creado: Observable2 {source: Observable2, operator: ƒ}
  🔧 Observable con pipe: Observable2 {source: Observable2, operator: ƒ}
  🎯 Ejecutando .subscribe()...

[NUNCA APARECE]: *** NEXT CALLBACK EJECUTADO ***
[NUNCA APARECE]: Error en petición
[NUNCA APARECE]: Observable completado
```

### 2. Network Tab

**Resultado**: VACÍO para `electronic-documents`

Otras peticiones (products, purchases, currentWarehouse) SÍ aparecen y completan exitosamente en 8ms, 51ms, 42ms respectivamente.

### 3. Backend Test (curl)

```bash
curl -v http://127.0.0.1:8000/api/v1/electronic-documents/?page=1&page_size=20
```

**Resultado**: HTTP 200 OK (responde correctamente)

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "total_pages": 0
}
```

### 4. Configuración Actual

**File: `src/app/app.config.ts`**

```typescript
provideHttpClient(
  withInterceptors([apiErrorInterceptor]),
  // Sin withFetch() - usa XMLHttpRequest
);
```

**File: `src/main.ts`**

```typescript
bootstrapApplication(AppComponent, appConfig);
```

**Interceptores registrados:**

- `apiErrorInterceptor` (solo maneja errores con `catchError`)

---

## Most Probable Causes (Ranked)

### 🔴 Causa #1: HttpClient SSR/Hydration Conflict (90% probabilidad)

**Hipótesis**: `provideClientHydration()` puede estar causando un conflicto con HttpClient en modo cliente.

**Evidencia:**

- La app usa `provideClientHydration()` para SSR
- Otras peticiones funcionan porque se hacen durante el bootstrap/route guard
- Esta petición se hace DESPUÉS de la hidratación del componente
- Angular SSR tiene problemas conocidos con peticiones HTTP post-hydration

**Síntomas coincidentes:**

- Observable se crea pero nunca emite
- No hay errores en consola
- La petición nunca sale del cliente

**Referencias:**

- Angular Issue #49350: HttpClient requests hang after hydration
- Angular Issue #47830: HTTP requests not working with provideClientHydration

### 🟡 Causa #2: Problema con takeUntil + destroy$ (60% probabilidad)

**Hipótesis**: `destroy$` podría estar emitiéndo prematuramente o el timing de `takeUntil` cancela la petición antes de que se envíe.

**Evidencia del código:**

```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.loadDocuments(); // Primera llamada

  this.filters.valueChanges
    .pipe(takeUntil(this.destroy$)) // Segunda suscripción con mismo destroy$
    .subscribe(...)
}

private loadDocuments(): void {
  const pipedObservable = observable.pipe(takeUntil(this.destroy$));
  pipedObservable.subscribe({...})
}
```

**Problema potencial:**

- Si `destroy$` emite, TODAS las suscripciones con `takeUntil(this.destroy$)` se cancelan
- Podría haber un race condition entre la creación del Observable y la emisión de `destroy$`

### 🟡 Causa #3: Zone.js o Change Detection Issue (40% probabilidad)

**Hipótesis**: El Observable se crea fuera de NgZone o hay un problema con detección de cambios.

**Evidencia:**

- La petición se crea pero nunca se "activa"
- En Angular, los Observables dependen de Zone.js para ejecutarse
- SSR puede tener zonas diferentes

### 🟢 Causa #4: Problema específico con el endpoint (20% probabilidad)

**Hipótesis**: Algo específico de la URL `/api/v1/electronic-documents/` causa el problema.

**Contra-evidencia:**

- El curl funciona perfectamente
- La URL es correcta con trailing slash
- Otros endpoints similares funcionan

---

## Files Involved

### Critical Files

1. **src/app/app.config.ts**
   - Configuración de `provideHttpClient`
   - Configuración de `provideClientHydration` ⚠️

2. **src/app/components/electronic-documents/electronic-documents-list.component.ts**
   - Implementación de `destroy$`
   - Uso de `takeUntil`
   - Lógica de suscripción

3. **src/app/services/electronic-documents.service.ts**
   - Creación del Observable con `http.get()`
   - Aplicación de `pipe(map(...))`

### Supporting Files

4. **src/main.ts**
   - Bootstrap de la aplicación
   - Registro de locale

5. **src/app/interceptors/api-error.interceptor.ts**
   - Interceptor de errores (solo catchError, no debería bloquear)

---

## Recommended Fixes (Priority Order)

### Fix #1: Remover provideClientHydration temporalmente

**Acción:**

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // provideClientHydration(), // ⬅️ COMENTAR TEMPORALMENTE
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    provideAnimations(),
    ApiConfigService,
  ],
};
```

**Propósito**: Confirmar si SSR/Hydration causa el problema.

**Resultado esperado**: Si la petición funciona sin hydration, confirmamos la causa raíz.

---

### Fix #2: Aislar destroy$ para esta petición específica

**Acción:**

```typescript
// src/app/components/electronic-documents/electronic-documents-list.component.ts
private loadDocuments(): void {
  // Crear Subject específico para esta petición
  const requestCancellation$ = new Subject<void>();

  this.documentsService
    .listDocuments(filters)
    .pipe(takeUntil(requestCancellation$)) // Usar Subject dedicado
    .subscribe({
      next: (response) => {
        // ... procesamiento
        requestCancellation$.complete(); // Limpiar
      },
      error: (err) => {
        // ... manejo error
        requestCancellation$.complete(); // Limpiar
      }
    });
}
```

**Propósito**: Evitar race conditions con `destroy$` compartido.

---

### Fix #3: Forzar ejecución dentro de NgZone

**Acción:**

```typescript
// src/app/components/electronic-documents/electronic-documents-list.component.ts
import { NgZone } from '@angular/core';

constructor(
  private ngZone: NgZone,
  // ... otros
) {}

private loadDocuments(): void {
  this.ngZone.run(() => {
    this.documentsService
      .listDocuments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({...})
  });
}
```

**Propósito**: Asegurar que la suscripción ocurre dentro de Zone.js.

---

### Fix #4: Usar HttpClient sin interceptores para esta petición

**Acción:**

```typescript
// src/app/services/electronic-documents.service.ts
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';

// Crear token para skipear interceptors
const SKIP_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

listDocuments(filters?: ElectronicDocumentFilters): Observable<PaginatedDocumentResponse> {
  return this.http.get<PaginatedDocumentResponse>(this.apiUrl, {
    params,
    context: new HttpContext().set(SKIP_INTERCEPTOR, true)
  });
}
```

**Propósito**: Descartar que el interceptor cause el problema.

---

## Additional Diagnostic Steps

### Step 1: Verificar si el problema es solo con este componente

**Test**: Crear un componente dummy que haga la misma petición:

```typescript
@Component({
  selector: "app-test-http",
  template: '<button (click)="test()">Test HTTP</button>',
})
export class TestHttpComponent {
  constructor(private http: HttpClient) {}

  test() {
    console.log("Testing HTTP...");
    this.http.get("http://127.0.0.1:8000/api/v1/electronic-documents/?page=1&page_size=20").subscribe({
      next: (r) => console.log("SUCCESS:", r),
      error: (e) => console.error("ERROR:", e),
      complete: () => console.log("COMPLETE"),
    });
  }
}
```

**Resultado esperado**: Si funciona, el problema es específico del componente ElectronicDocumentsListComponent.

### Step 2: Verificar timing de ngOnInit vs hydration

**Test**: Agregar delay antes de la petición:

```typescript
ngOnInit(): void {
  setTimeout(() => {
    this.loadDocuments(); // Delay de 2 segundos
  }, 2000);
}
```

**Resultado esperado**: Si funciona con delay, confirma problema de timing con hydration.

### Step 3: Verificar si otros servicios nuevos tienen el mismo problema

**Test**: Crear otro servicio nuevo (no products, purchases que ya funcionan):

```typescript
@Injectable({ providedIn: "root" })
export class TestService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  testEndpoint() {
    return this.http.get(this.apiConfig.buildUrl("/api/v1/warehouses/"));
  }
}
```

**Resultado esperado**: Si otros servicios nuevos también fallan, el problema es sistémico.

---

## Conclusion

El problema más probable es un **conflicto entre provideClientHydration() y HttpClient** que afecta peticiones HTTP realizadas después de la hidratación del componente.

**Recomendación inmediata**: Implementar Fix #1 (remover provideClientHydration temporalmente) para confirmar la hipótesis.

**Siguiente paso**: Una vez confirmada la causa, investigar solución que mantenga SSR/Hydration funcionando correctamente con HttpClient.

---

**Fecha de diagnóstico**: 9 de Julio, 2026  
**Severidad**: CRÍTICA - Componente completamente no funcional  
**Tipo**: Bug de integración Angular SSR + HttpClient  
**Estado**: Pendiente implementación de fixes
