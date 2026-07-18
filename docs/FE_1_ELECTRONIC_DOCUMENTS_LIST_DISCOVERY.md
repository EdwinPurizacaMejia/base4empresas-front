# TASK-FE-1.1 — Electronic Documents List UI Discovery

**Fecha:** 2026-07-07  
**Objetivo:** Analizar el frontend actual para implementar la pantalla de listado de documentos electrónicos  
**Estado:** ✅ Descubrimiento completado

---

## 📋 Resumen Ejecutivo

El frontend está bien estructurado con un patrón consistente de servicios, componentes y rutas. Se identificó una arquitectura modular basada en Angular standalone components con Material Design, servicios HTTP centralizados y un sistema de menú jerárquico. **No existe implementación actual de documentos electrónicos**, por lo que será una funcionalidad completamente nueva.

---

## 🔍 Hallazgos Principales

### 1. ¿Dónde debería vivir la pantalla de listado?

**Recomendación: `/ventas/documentos-electronicos`**

**Justificación:**

- Los documentos electrónicos (facturas, boletas) están relacionados con el módulo de Ventas
- El menú actual organiza funcionalidades por dominio comercial
- Existen precedentes en `/ventas/pedidos` y `/ventas/pagos`
- Las rutas siguen el patrón: `/{dominio}/{funcionalidad}`

**Rutas sugeridas:**

```typescript
{
  path: 'ventas',
  children: [
    // ... rutas existentes (pedidos, pagos)
    {
      path: 'documentos-electronicos',
      component: ElectronicDocumentsListComponent,
      data: { title: 'Documentos Electrónicos' }
    },
    {
      path: 'documentos-electronicos/:id',
      component: ElectronicDocumentDetailComponent,
      data: { title: 'Detalle de Documento' }
    }
  ]
}
```

**Ubicación física de archivos:**

```
src/app/components/electronic-documents/
├── electronic-documents-list.component.ts
├── electronic-documents-list.component.html
├── electronic-documents-list.component.scss
└── electronic-document-detail.component.ts  (futuro)
```

---

### 2. ¿Existe un API client reutilizable?

**✅ SÍ - Patrón establecido y consistente**

**Servicio centralizado:**

- `ApiConfigService` (`src/app/services/api-config.service.ts`)
- Proporciona URL base: `environment.apiUrl`
- Método helper: `buildUrl(endpoint: string): string`

**Patrón de implementación (basado en OrdersService):**

```typescript
@Injectable({
  providedIn: "root",
})
export class ElectronicDocumentsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.apiUrl = this.apiConfig.buildUrl("/electronic-documents");
  }

  // GET /electronic-documents - Lista con paginación
  listDocuments(filters?: ElectronicDocumentFilters): Observable<ElectronicDocument[]> {
    let params = new HttpParams();

    if (filters?.document_type) {
      params = params.set("document_type", filters.document_type);
    }

    if (filters?.status) {
      params = params.set("status", filters.status);
    }

    return this.http.get<PaginatedResponse<ElectronicDocument>>(this.apiUrl, { params }).pipe(map((response) => response.items || []));
  }

  // GET /electronic-documents/{id} - Detalle
  getDocument(id: string): Observable<ElectronicDocument> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<ElectronicDocument>(url);
  }

  // POST /electronic-documents - Crear (emitir)
  createDocument(payload: ElectronicDocumentCreate): Observable<ElectronicDocument> {
    return this.http.post<ElectronicDocument>(this.apiUrl, payload);
  }

  // Métodos específicos según backend API
  // PATCH /electronic-documents/{id}/cancel
  // POST /electronic-documents/{id}/send-email
  // etc.
}
```

**Patrón de respuesta paginada del backend:**

```typescript
interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
```

**Ubicación del servicio:**

```
src/app/services/electronic-documents.service.ts
src/app/services/electronic-documents.service.spec.ts  (tests)
```

---

### 3. ¿Existe layout o navegación para documentos electrónicos?

**❌ NO - Requiere agregar al menú**

**Menú actual:** Definido en `src/app/models/menu.model.ts` (`MAIN_MENU` array)

**Integración requerida:**

```typescript
// En MAIN_MENU array, dentro del objeto 'Ventas'
{
  label: 'Ventas',
  icon: '💰',
  tooltip: 'Gestión de pedidos, pagos y transacciones',
  children: [
    {
      label: 'Pedidos',
      icon: '📋',
      route: '/ventas/pedidos',
      tooltip: 'Órdenes de venta (FASE 2)',
    },
    {
      label: 'Pagos',
      icon: '💳',
      route: '/ventas/pagos',
      tooltip: 'Gestión y validación de pagos (FASE 3)',
    },
    // ⬇️ NUEVA ENTRADA
    {
      label: 'Documentos Electrónicos',
      icon: '📄',
      route: '/ventas/documentos-electronicos',
      tooltip: 'Facturas, boletas y comprobantes electrónicos',
    },
  ],
}
```

**Características del menú:**

- Sistema jerárquico de 2 niveles (main-menu + sub-menu)
- Componente: `MainMenuComponent` (`src/app/layout/main-menu.component.ts`)
- Navegación con `routerLink` y `routerLinkActive`
- Soporte para iconos (emoji o Material Icons)
- Responsive design

---

### 4. ¿Qué componentes existentes pueden reutilizarse?

**✅ Componentes reutilizables identificados:**

#### a) **LoadingSpinnerComponent**

```typescript
// src/app/components/shared/loading-spinner.component.ts
<app-loading-spinner
  *ngIf="loading"
  message="Cargando documentos electrónicos..."
  [diameter]="50"
  [strokeWidth]="4">
</app-loading-spinner>
```

#### b) **NotificationService**

```typescript
// src/app/services/notification.service.ts
constructor(private notificationService: NotificationService) {}

// Mensajes de éxito, error, advertencia
this.notificationService.success('Documento emitido exitosamente');
this.notificationService.error('Error al emitir documento');
this.notificationService.warning('Documento ya fue anulado');
```

#### c) **Material Design Components**

Patrón usado en `orders-list.component.ts`:

- `MatTableModule` - Tabla de datos
- `MatPaginatorModule` - Paginación
- `MatSortModule` - Ordenamiento
- `MatFormFieldModule` + `MatInputModule` + `MatSelectModule` - Filtros
- `MatButtonModule` + `MatIconModule` - Acciones
- `MatCardModule` - Contenedores
- `MatChipsModule` - Estados visuales
- `MatTooltipModule` - Tooltips

#### d) **AppCurrencyPipe**

```typescript
// src/app/shared/pipes/app-currency.pipe.ts
{{ document.total_amount | appCurrency: document.currency }}
// Salida: S/ 1,250.00
```

#### e) **Patrón de Empty State**

```html
<!-- Usado en orders-list.component.html -->
<div class="empty-state" *ngIf="documents.length === 0">
  <mat-icon>inbox</mat-icon>
  <p>No hay documentos electrónicos</p>
  <button mat-stroked-button (click)="createDocument()">Emitir Primer Documento</button>
</div>
```

#### f) **Patrón de filtros con FormGroup**

```typescript
// Reactive Forms para filtros
this.filters = this.fb.group({
  document_type: [""],
  status: [""],
  date_from: [""],
  date_to: [""],
});

this.filters.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadDocuments());
```

---

### 5. ¿Qué archivos habría que crear/modificar?

#### **Archivos a CREAR:**

```
src/app/models/electronic-document.model.ts
src/app/services/electronic-documents.service.ts
src/app/services/electronic-documents.service.spec.ts
src/app/components/electronic-documents/electronic-documents-list.component.ts
src/app/components/electronic-documents/electronic-documents-list.component.html
src/app/components/electronic-documents/electronic-documents-list.component.scss
```

#### **Archivos a MODIFICAR:**

1. **`src/app/app.routes.ts`**
   - Agregar rutas `/ventas/documentos-electronicos`

2. **`src/app/models/menu.model.ts`**
   - Agregar entrada en menú Ventas

**Total:**

- ✅ 6 archivos nuevos
- ✅ 2 archivos modificados

---

### 6. ¿Qué datos necesita mostrar la tabla?

**Basado en el dominio de documentos electrónicos típicos:**

#### **Campos principales (displayedColumns):**

```typescript
displayedColumns = [
  "document_number", // ORD-001-00000123
  "document_type", // Factura, Boleta, Nota de Crédito
  "customer", // Nombre del cliente
  "issue_date", // Fecha de emisión
  "status", // ISSUED, SENT, ACCEPTED, REJECTED, CANCELLED
  "total_amount", // S/ 1,250.00
  "sunat_response", // CDR recibido / Estado SUNAT
  "actions", // Ver, Descargar XML, PDF, Enviar, Anular
];
```

#### **Modelo de datos sugerido:**

```typescript
export interface ElectronicDocument {
  id: string;
  document_number: string; // Serie + Correlativo: B001-00000123
  document_type: DocumentType; // 'INVOICE' | 'BOLETA' | 'CREDIT_NOTE' | 'DEBIT_NOTE'
  order_id?: string; // Relación con orden (opcional)
  customer_id: string;
  customer_name?: string;
  customer_document_number: string; // RUC o DNI del cliente

  issue_date: string; // ISO 8601
  due_date?: string | null; // Para facturas con crédito

  currency: string; // 'PEN' | 'USD'
  subtotal: number;
  tax_amount: number; // IGV 18%
  total_amount: number;

  status: DocumentStatus; // 'DRAFT' | 'ISSUED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

  // Información de SUNAT
  sunat_response_code?: string | null;
  sunat_response_description?: string | null;
  sunat_cdr_received?: boolean;

  // Archivos
  xml_url?: string | null;
  pdf_url?: string | null;
  cdr_url?: string | null; // Constancia de Recepción (CDR)

  items: DocumentItem[];

  created_at?: string;
  updated_at?: string;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
}

export interface DocumentItem {
  id: string;
  product_id: string;
  product_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount?: number | null;
  subtotal: number;
  tax_amount: number;
  total: number;
}

export type DocumentType = "INVOICE" | "BOLETA" | "CREDIT_NOTE" | "DEBIT_NOTE";

export type DocumentStatus =
  | "DRAFT" // Borrador (aún no emitido)
  | "ISSUED" // Emitido a SUNAT
  | "SENT" // Enviado al cliente (email)
  | "ACCEPTED" // Aceptado por SUNAT
  | "REJECTED" // Rechazado por SUNAT
  | "CANCELLED"; // Anulado

export interface ElectronicDocumentFilters {
  document_type?: DocumentType;
  status?: DocumentStatus;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}
```

#### **Helpers para estados:**

```typescript
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    INVOICE: "Factura",
    BOLETA: "Boleta",
    CREDIT_NOTE: "Nota de Crédito",
    DEBIT_NOTE: "Nota de Débito",
  };
  return labels[type] || type;
}

export function getDocumentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    DRAFT: "Borrador",
    ISSUED: "Emitido",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    CANCELLED: "Anulado",
  };
  return labels[status] || status;
}

export function getDocumentStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    DRAFT: "accent",
    ISSUED: "primary",
    SENT: "primary",
    ACCEPTED: "primary",
    REJECTED: "warn",
    CANCELLED: "accent",
  };
  return colors[status] || "primary";
}
```

---

### 7. ¿Qué filtros iniciales implementar?

**Filtros recomendados (basados en patrones existentes):**

#### **Filtros principales:**

```typescript
this.filters = this.fb.group({
  document_type: [""], // Tipo: Factura, Boleta, NC, ND
  status: [""], // Estado: Emitido, Aceptado, Rechazado, etc.
  customer_id: [""], // Cliente específico
  date_from: [""], // Rango de fechas - desde
  date_to: [""], // Rango de fechas - hasta
});
```

#### **Implementación en HTML:**

```html
<mat-card class="filters-card">
  <form [formGroup]="filters" class="filters-form">
    <!-- Tipo de Documento -->
    <mat-form-field appearance="outline">
      <mat-label>Tipo de Documento</mat-label>
      <mat-select formControlName="document_type">
        <mat-option value="">Todos</mat-option>
        <mat-option value="INVOICE">Factura</mat-option>
        <mat-option value="BOLETA">Boleta</mat-option>
        <mat-option value="CREDIT_NOTE">Nota de Crédito</mat-option>
        <mat-option value="DEBIT_NOTE">Nota de Débito</mat-option>
      </mat-select>
    </mat-form-field>

    <!-- Estado -->
    <mat-form-field appearance="outline">
      <mat-label>Estado</mat-label>
      <mat-select formControlName="status">
        <mat-option value="">Todos</mat-option>
        <mat-option value="DRAFT">Borrador</mat-option>
        <mat-option value="ISSUED">Emitido</mat-option>
        <mat-option value="SENT">Enviado</mat-option>
        <mat-option value="ACCEPTED">Aceptado</mat-option>
        <mat-option value="REJECTED">Rechazado</mat-option>
        <mat-option value="CANCELLED">Anulado</mat-option>
      </mat-select>
    </mat-form-field>

    <!-- Rango de Fechas -->
    <mat-form-field appearance="outline">
      <mat-label>Desde</mat-label>
      <input matInput type="date" formControlName="date_from" />
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Hasta</mat-label>
      <input matInput type="date" formControlName="date_to" />
    </mat-form-field>

    <!-- Botones -->
    <button mat-stroked-button type="button" (click)="clearFilters()">
      <mat-icon>clear</mat-icon>
      Limpiar
    </button>

    <button mat-stroked-button type="button" (click)="onRefresh()">
      <mat-icon>refresh</mat-icon>
      Actualizar
    </button>
  </form>
</mat-card>
```

#### **Filtros avanzados (futuro):**

- Búsqueda por número de documento
- Filtro por cliente (dropdown con autocomplete)
- Filtro por orden de venta relacionada
- Filtro por monto (rango)
- Estado de CDR de SUNAT

---

## 🔐 Manejo de Autenticación y Autorización

**Estado actual:** El proyecto tiene configurado:

- ✅ `ApiConfigService` centralizado
- ✅ Interceptor de errores (`api-error.interceptor.ts`)
- ✅ Manejo de errores 401 (No autorizado) y 403 (Acceso denegado)
- ⚠️ No se observó interceptor de autenticación con tokens JWT

**Recomendación:**

Si el backend requiere autenticación:

```typescript
// auth.interceptor.ts (a crear si no existe)
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem("access_token");

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
}
```

---

## 📊 Estados de Loading/Error/Empty

**✅ Patrón consistente identificado:**

### Loading State:

```typescript
loading = false;

loadDocuments(): void {
  this.loading = true;

  this.documentsService.listDocuments(filters)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (documents) => {
        this.documents = documents || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.notificationService.error('Error al cargar documentos');
        this.loading = false;
      }
    });
}
```

### Empty State:

```html
<div class="empty-state" *ngIf="!loading && documents.length === 0">
  <mat-icon>inbox</mat-icon>
  <p>No hay documentos electrónicos</p>
  <button mat-stroked-button (click)="createDocument()">Emitir Primer Documento</button>
</div>
```

### Error State:

```typescript
// Manejado automáticamente por:
// 1. api-error.interceptor.ts (interceptor global)
// 2. NotificationService (toasts de error)
// No requiere UI adicional en componente
```

---

## 🎯 Conclusiones y Recomendaciones

### ✅ Fortalezas del Frontend Actual:

1. **Arquitectura modular y escalable** - Standalone components de Angular
2. **Patrones consistentes** - Servicios, componentes de lista, filtros
3. **Manejo robusto de errores** - Interceptor global con mensajes amigables
4. **UI profesional** - Material Design bien implementado
5. **Separación de responsabilidades** - Modelos, servicios, componentes
6. **Reutilización de código** - Componentes shared (LoadingSpinner, etc.)

### 📝 Tareas para Implementar Documentos Electrónicos:

#### **Fase 1: Setup Base (1-2 horas)**

- [ ] Crear modelo `electronic-document.model.ts` con tipos e interfaces
- [ ] Crear servicio `electronic-documents.service.ts` con métodos HTTP
- [ ] Agregar rutas en `app.routes.ts`
- [ ] Agregar entrada de menú en `menu.model.ts`

#### **Fase 2: UI Listado (2-3 horas)**

- [ ] Crear componente `electronic-documents-list.component.ts`
- [ ] Implementar tabla con Material Table
- [ ] Implementar filtros (tipo, estado, fecha)
- [ ] Implementar estados loading/error/empty
- [ ] Agregar acciones: Ver, Descargar XML/PDF, Enviar, Anular

#### **Fase 3: Integración Backend (1-2 horas)**

- [ ] Conectar servicio con endpoints reales
- [ ] Probar flujo de carga y filtrado
- [ ] Validar manejo de errores
- [ ] Verificar paginación si aplica

#### **Fase 4: Testing y Refinamiento (1 hora)**

- [ ] Pruebas de UI responsiva
- [ ] Validar integración con otros módulos (órdenes)
- [ ] Ajustar estilos según guía de diseño
- [ ] Documentar componente

### 🚀 Archivos a Crear (Resumen):

```
📁 src/app/
├── 📁 models/
│   └── electronic-document.model.ts       ✨ NUEVO
├── 📁 services/
│   ├── electronic-documents.service.ts    ✨ NUEVO
│   └── electronic-documents.service.spec.ts ✨ NUEVO
└── 📁 components/
    └── 📁 electronic-documents/           ✨ NUEVO
        ├── electronic-documents-list.component.ts
        ├── electronic-documents-list.component.html
        └── electronic-documents-list.component.scss
```

### ✏️ Archivos a Modificar (Resumen):

```
📝 src/app/app.routes.ts           → Agregar rutas
📝 src/app/models/menu.model.ts    → Agregar menú
```

### 🎨 Patrones de Código a Seguir:

**Referencia principal:** `orders-list.component.ts` y `orders.service.ts`

- Usar `MatTableModule` para tablas
- Usar `MatChipsModule` para estados
- Usar `ReactiveFormsModule` para filtros
- Usar `takeUntil(destroy$)` para subscripciones
- Usar `AppCurrencyPipe` para montos
- Implementar `OnDestroy` para limpieza

---

## 📚 Referencias Útiles

**Componentes de referencia:**

- `src/app/components/orders/orders-list.component.ts` - Patrón de lista con filtros
- `src/app/components/orders/order-detail.component.ts` - Patrón de detalle
- `src/app/services/orders.service.ts` - Patrón de servicio HTTP
- `src/app/models/order.model.ts` - Patrón de modelo de datos

**Servicios reutilizables:**

- `ApiConfigService` - URLs del backend
- `NotificationService` - Mensajes al usuario
- Interceptor `api-error.interceptor.ts` - Manejo de errores HTTP

---

## ✅ Checklist de Implementación

Próximos pasos para TASK-FE-1.2 (Implementación):

- [ ] Crear `electronic-document.model.ts` con tipos completos
- [ ] Crear `electronic-documents.service.ts` con métodos CRUD
- [ ] Crear componente de lista con tabla Material
- [ ] Implementar filtros (tipo, estado, fechas)
- [ ] Agregar acciones (ver, descargar, enviar, anular)
- [ ] Modificar `app.routes.ts` para agregar rutas
- [ ] Modificar `menu.model.ts` para agregar entrada de menú
- [ ] Probar integración con backend
- [ ] Validar UI responsiva
- [ ] Documentar componente

---

**Fin del documento de descubrimiento**  
**Siguiente tarea:** TASK-FE-1.2 — Implementación de UI
