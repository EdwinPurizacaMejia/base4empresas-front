# Plan de Implementación: Documentos Electrónicos en Ventas/Pedidos

## Fecha: 2026-07-16

## Alcance: Integración de Documentos Electrónicos (Boletas/Facturas) en el módulo de Ventas

---

## 1. Estado Actual del Sistema

### 1.1 Backend (ya implementado)

El backend expone los siguientes endpoints bajo `/api/v1/electronic-documents/`:

| Método | Endpoint                                               | Descripción                                            |
| ------ | ------------------------------------------------------ | ------------------------------------------------------ |
| `GET`  | `/api/v1/electronic-documents/`                        | Listar documentos (paginado)                           |
| `GET`  | `/api/v1/electronic-documents/{id}`                    | Obtener documento por ID                               |
| `GET`  | `/api/v1/electronic-documents/by-number/{full_number}` | Buscar por número                                      |
| `POST` | `/api/v1/electronic-documents/from-sale/{sale_id}`     | **Crear desde una venta** ← punto de entrada principal |
| `POST` | `/api/v1/electronic-documents/manual`                  | Crear manualmente                                      |
| `POST` | `/api/v1/electronic-documents/{id}/emit`               | **Emitir a SUNAT**                                     |
| `POST` | `/api/v1/electronic-documents/{id}/cancel`             | Anular documento                                       |
| `GET`  | `/api/v1/electronic-documents/{id}/status`             | Consultar estado en SUNAT                              |
| `GET`  | `/api/v1/electronic-documents/{id}/pdf`                | Descargar PDF                                          |
| `GET`  | `/api/v1/electronic-documents/{id}/xml`                | Descargar XML                                          |
| `GET`  | `/api/v1/electronic-documents/{id}/cdr`                | Descargar CDR (constancia SUNAT)                       |

**Parámetro clave para crear desde venta:**

```
POST /api/v1/electronic-documents/from-sale/{sale_id}?document_type=invoice
```

- `document_type`: `invoice` (factura), `credit_note` (nota de crédito), `debit_note` (nota de débito)

**Schema `DocumentResponse`:**

```
id, document_type, full_number, status, provider,
provider_document_id, provider_status, pdf_url, xml_url, cdr_url,
total_amount, created_at, updated_at
```

**Schema `EmitDocumentResponse`:**

```
success, provider_document_id, provider_status, status, message,
pdf_url, xml_url, cdr_url
```

### 1.2 Frontend (estado actual)

**Lo que ya existe:**

- `ElectronicDocumentsService` — solo tiene `listDocuments()`, incompleto
- `ElectronicDocumentsListComponent` — lista básica, ruta `/ventas/documentos-electronicos`
- `SaleDetailComponent` — vista de detalle de venta, sin integración de documentos
- `SaleListComponent` — existe pero **no tiene ruta definida en `app.routes.ts`**
- `OrderDetailComponent` — detalle de pedido, sin integración de documentos
- Proxy `/api/v1` no está en `proxy.conf.json`

**Lo que falta:**

- Modelo TypeScript `ElectronicDocument`
- Métodos del servicio: `createFromSale`, `emitDocument`, `cancelDocument`, `downloadPdf`, etc.
- Integración en `SaleDetailComponent` y `OrderDetailComponent`
- Ruta `/ventas/ventas` y `ventas/ventas/:id` para las ventas
- Proxy para `/api/v1`

---

## 2. Flujo de Usuario (UX)

### Flujo principal: Generar comprobante desde una venta

```
Lista de Ventas
  → Ver Detalle de Venta
      → Sección "Documentos Electrónicos" (nueva)
          → [Generar Comprobante] ← botón nuevo
              → Dialog: ¿Boleta o Factura?
                  → Llamada: POST /from-sale/{sale_id}?document_type=invoice
                      → Documento creado en estado "draft"
                          → [Emitir a SUNAT] ← botón
                              → Llamada: POST /{id}/emit
                                  → Estado actualizado
                                      → Descargar PDF / XML / CDR
```

### Flujo de cancelación

```
Detalle de Venta → Documento Electrónico existente
  → [Anular] ← botón
      → Dialog: Motivo de anulación
          → Llamada: POST /{id}/cancel
```

---

## 3. Cambios Técnicos a Realizar

### PASO 1: Actualizar `proxy.conf.json`

Agregar la ruta `/api` que ya existe en el proxy (verificar que `/api/v1/electronic-documents` pase correctamente). El proxy ya tiene `/api` pero verificar que está funcionando para las rutas `/api/v1/*`.

**Archivo:** `proxy.conf.json`

```json
"/api": {
  "target": "http://127.0.0.1:8000",
  "secure": false,
  "changeOrigin": true
}
```

✅ Ya existe en el proxy, no requiere cambio.

---

### PASO 2: Crear modelo `ElectronicDocument`

**Archivo nuevo:** `src/app/models/electronic-document.model.ts`

```typescript
export type DocumentType = "invoice" | "credit_note" | "debit_note";
export type DocumentStatus = "draft" | "pending" | "accepted" | "rejected" | "cancelled";

export interface ElectronicDocument {
  id: string;
  document_type: DocumentType;
  full_number: string | null;
  status: DocumentStatus;
  provider: string | null;
  provider_document_id: string | null;
  provider_status: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  cdr_url: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmitDocumentRequest {
  provider_mode?: string; // 'sandbox' | 'production'
}

export interface EmitDocumentResponse {
  success: boolean;
  provider_document_id: string | null;
  provider_status: string | null;
  status: DocumentStatus;
  message: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  cdr_url: string | null;
}

export interface CancelDocumentRequest {
  reason: string;
  provider_mode?: string;
}

export interface PaginatedDocumentResponse {
  items: ElectronicDocument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
```

---

### PASO 3: Ampliar `ElectronicDocumentsService`

**Archivo:** `src/app/services/electronic-documents.service.ts`

Métodos a agregar:

```typescript
// Crear documento desde venta
createFromSale(saleId: string, documentType: DocumentType): Observable<ElectronicDocument>

// Obtener documento por ID
getDocumentById(documentId: string): Observable<ElectronicDocument>

// Emitir documento a SUNAT
emitDocument(documentId: string, request?: EmitDocumentRequest): Observable<EmitDocumentResponse>

// Cancelar documento
cancelDocument(documentId: string, request: CancelDocumentRequest): Observable<ElectronicDocument>

// Verificar estado en SUNAT
checkDocumentStatus(documentId: string): Observable<ElectronicDocument>

// Descargar archivos (retornan Blob)
downloadPdf(documentId: string): Observable<Blob>
downloadXml(documentId: string): Observable<Blob>
downloadCdr(documentId: string): Observable<Blob>

// Obtener documentos por venta (filtro)
getDocumentsBySale(saleId: string): Observable<PaginatedDocumentResponse>
```

---

### PASO 4: Agregar ruta de Ventas al router

**Archivo:** `src/app/app.routes.ts`

El `SaleListComponent` y `SaleDetailComponent` existen pero no tienen ruta. Agregar bajo `/ventas`:

```typescript
// Ventas directas (sin pedido previo)
{
  path: 'ventas',
  component: SaleListComponent,
  data: { title: 'Ventas' }
},
{
  path: 'ventas/:id',
  component: SaleDetailComponent,
  data: { title: 'Detalle de Venta' }
}
```

---

### PASO 5: Agregar ruta de Detalle de Documento Electrónico

**Archivo:** `src/app/app.routes.ts`

```typescript
{
  path: 'documentos-electronicos/:id',
  component: ElectronicDocumentDetailComponent,  // nuevo componente
  data: { title: 'Detalle de Documento Electrónico' }
}
```

---

### PASO 6: Crear componente `ElectronicDocumentPanelComponent` (Shared)

**Archivo nuevo:** `src/app/components/electronic-documents/electronic-document-panel.component.ts`

Componente reutilizable que muestra los documentos electrónicos asociados a una venta. Se puede usar tanto en `SaleDetailComponent` como en `OrderDetailComponent`.

**Funcionalidades:**

- Listar documentos asociados a la venta
- Botón "Generar Boleta" (document_type: `invoice` con cliente sin RUC)
- Botón "Generar Factura" (document_type: `invoice` con RUC del cliente)
- Por cada documento mostrar: número, tipo, estado (chip de color), monto
- Acciones por documento:
  - **[Emitir]** — Si estado es `draft`
  - **[Ver PDF]** — Si tiene `pdf_url`
  - **[Descargar XML]** — Si tiene `xml_url`
  - **[CDR]** — Si tiene `cdr_url`
  - **[Anular]** — Si estado es `accepted` o `pending`
  - **[Actualizar Estado]** — Consultar SUNAT

**Inputs:**

```typescript
@Input() saleId: string;
@Input() readonly?: boolean;
```

---

### PASO 7: Integrar `ElectronicDocumentPanelComponent` en `SaleDetailComponent`

**Archivo:** `src/app/components/sale-detail/sale-detail.component.ts` y `.html`

Agregar el panel de documentos electrónicos como una nueva sección en la vista de detalle de venta, después del resumen de totales.

---

### PASO 8: Crear `EmitDocumentDialogComponent`

**Archivo nuevo:** `src/app/components/electronic-documents/emit-document-dialog.component.ts`

Dialog de confirmación antes de emitir a SUNAT. Muestra:

- Tipo de documento
- Número de documento
- Monto total
- Selector de modo: `sandbox` (pruebas) / `production` (producción)
- Advertencia: "Esta acción enviará el documento a SUNAT. ¿Desea continuar?"

---

### PASO 9: Agregar entrada al menú lateral

**Archivo:** `src/app/models/menu.model.ts` o donde esté la definición del menú

Agregar bajo la sección "Ventas":

- **Ventas** → `/ventas/ventas`
- **Documentos Electrónicos** → `/ventas/documentos-electronicos` (ya existe)

---

## 4. Resumen de Archivos a Crear / Modificar

| Acción       | Archivo                                                                            | Descripción                              |
| ------------ | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| 🆕 Crear     | `src/app/models/electronic-document.model.ts`                                      | Tipos e interfaces del modelo            |
| ✏️ Modificar | `src/app/services/electronic-documents.service.ts`                                 | Agregar todos los métodos de la API      |
| 🆕 Crear     | `src/app/components/electronic-documents/electronic-document-panel.component.ts`   | Panel reutilizable de documentos         |
| 🆕 Crear     | `src/app/components/electronic-documents/electronic-document-panel.component.html` | Template del panel                       |
| 🆕 Crear     | `src/app/components/electronic-documents/emit-document-dialog.component.ts`        | Dialog de confirmación de emisión        |
| 🆕 Crear     | `src/app/components/electronic-documents/cancel-document-dialog.component.ts`      | Dialog de anulación                      |
| ✏️ Modificar | `src/app/components/sale-detail/sale-detail.component.ts`                          | Integrar panel de documentos             |
| ✏️ Modificar | `src/app/components/sale-detail/sale-detail.component.html`                        | Agregar sección de documentos            |
| ✏️ Modificar | `src/app/app.routes.ts`                                                            | Agregar rutas de ventas y detalle de doc |
| ✏️ Modificar | menú lateral                                                                       | Agregar enlace a "Ventas"                |

---

## 5. Orden de Implementación (prioridad)

```
1. Modelo ElectronicDocument              ← base para todo lo demás
2. Ampliar ElectronicDocumentsService     ← métodos de API
3. ElectronicDocumentPanelComponent       ← UI reutilizable
4. EmitDocumentDialogComponent            ← confirmación de emisión
5. CancelDocumentDialogComponent          ← confirmación de anulación
6. Integrar panel en SaleDetailComponent  ← integración principal
7. Agregar rutas al router                ← navegación
8. Actualizar menú                        ← acceso desde el menú
```

---

## 6. Estados de un Documento Electrónico

| Estado      | Color sugerido   | Descripción                        |
| ----------- | ---------------- | ---------------------------------- |
| `draft`     | Gris             | Creado pero no enviado a SUNAT     |
| `pending`   | Naranja/Amarillo | Enviado, esperando respuesta SUNAT |
| `accepted`  | Verde            | Aceptado por SUNAT                 |
| `rejected`  | Rojo             | Rechazado por SUNAT                |
| `cancelled` | Gris oscuro      | Anulado                            |

---

## 7. Consideraciones Técnicas

### Descarga de archivos (PDF/XML/CDR)

Los endpoints de descarga retornan bytes. La implementación debe:

1. Llamar al endpoint con `responseType: 'blob'`
2. Crear un `URL.createObjectURL(blob)`
3. Abrir en nueva pestaña (PDF) o descargar directamente (XML/CDR)

### Manejo de errores

- Si la venta no tiene cliente con documento válido, el backend puede rechazar la creación
- Mostrar mensajes de error claros del backend (validaciones SUNAT)
- El estado `rejected` debe mostrar el mensaje de error de SUNAT

### Integración con `OrderDetail` (segunda fase)

Los pedidos (`orders`) y ventas (`sales`) son entidades separadas en el backend. La integración con pedidos se haría en una segunda fase, usando el mismo `ElectronicDocumentPanelComponent` pero pasando el `sale_id` asociado al pedido (si existe).

---

## 8. Notas sobre el Backend

- El endpoint `from-sale` solo acepta `document_type`: `invoice`, `credit_note`, `debit_note`
- Para boletas vs facturas, ambas usan `invoice` como `document_type` — la distinción boleta/factura la determina el backend según el tipo de documento del cliente (DNI → boleta, RUC → factura)
- El campo `provider_mode` en emisión permite probar en `sandbox` antes de ir a producción
- Los campos `pdf_url`, `xml_url`, `cdr_url` pueden ser `null` hasta que el documento sea emitido y aceptado
