# 🔍 AUDITORÍA TÉCNICA: Módulo "Inventario → Ajustes de Inventario"

**Fecha:** 5 de junio de 2026  
**Tech Lead:** Angular 17.3.0  
**Estado:** Análisis completo sin implementación

---

## 📋 RESUMEN EJECUTIVO

| Aspecto                  | Estado          | Verificado                           |
| ------------------------ | --------------- | ------------------------------------ |
| **Componente principal** | ✅ Existe       | AdjustmentsListComponent             |
| **Servicio creación**    | ✅ Existe       | StockOperationsService               |
| **Modelo/Interfaz**      | ✅ Existe       | AdjustmentCreate, AdjustmentResponse |
| **Botón deshabilitado**  | ✅ Identificado | Hardcoded `disabled` sin condición   |
| **Formulario**           | ❌ NO EXISTE    | No hay adjustment-form component     |
| **Integración**          | ❌ DESCONECTADA | Servicio no es usado por componente  |

**Diagnóstico:** `B) Falta conectar servicio` + `C) Falta formulario`

---

## 1. COMPONENTE PRINCIPAL

### Ubicación

```
src/app/components/adjustments-list/adjustments-list.component.ts
```

### Detalles

| Propiedad      | Valor                       |
| -------------- | --------------------------- |
| **Selector**   | `app-adjustments-list`      |
| **Standalone** | ✅ Sí                       |
| **Template**   | Inline (2 líneas de código) |
| **Estilos**    | Inline (scoped)             |

### Servicios Inyectados

```typescript
constructor(
  private kardexService: KardexService,      // Lectura: getKardex()
  private warehouseService: WarehouseService  // Lectura: getWarehouses()
)
```

### Método de Lectura

```typescript
loadAdjustments(): void {
  const filters = {
    referenceType: 'ADJUSTMENT',
    warehouseId: this.selectedWarehouse || ''
  };
  this.kardexService.getKardex(filters).subscribe({...})
}
```

### Datos Mostrados (Template)

```html
<table mat-table [dataSource]="adjustments" class="adjustments-table">
  <!-- Columnas: date, warehouse, product, quantity (±color), reason, user -->
</table>
```

### Interfaz de Datos

```typescript
export interface AdjustmentRow {
  date: string;
  warehouse: string;
  product: string;
  quantity: number; // ✅ Color-coded: +green, -red
  reason: string;
  user: string;
}
```

---

## 2. BOTÓN "NUEVO AJUSTE"

### Ubicación en Template

```html
<button
  mat-raised-button
  color="primary"
  disabled              <!-- ❌ HARDCODED sin condición -->
  matTooltip="Próximamente: Crear nuevo ajuste"
>
  <mat-icon>add</mat-icon>
  Nuevo Ajuste
</button>
```

### Análisis de `disabled`

| Aspecto                 | Estado                                 |
| ----------------------- | -------------------------------------- |
| **Valor**               | `disabled` (booleano puro, no binding) |
| **Condición dinámica**  | ❌ NO                                  |
| **Variable @Input**     | ❌ NO                                  |
| **Variable @Component** | ❌ NO                                  |
| **Permiso requerido**   | ❌ NO HAY AUTH SERVICE                 |
| **Feature flag**        | ❌ NO EXISTE                           |
| **Handler (click)**     | ❌ NO TIENE                            |
| **Intención**           | Placeholder para fase 2                |

### Conclusión

**Motivo del `disabled`:** Intencional. El tooltip dice "Próximamente", indicando que la funcionalidad será implementada en siguiente fase.

---

## 3. SERVICIOS

### 3.1 Servicio de Lectura (EN USO)

**Archivo:** `src/app/services/kardex.service.ts`

```typescript
getKardex(params: {
  warehouseId: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  referenceType?: KardexReferenceType;  // ← Filtro 'ADJUSTMENT'
}): Observable<InventoryKardexLine[]>
```

**Endpoint:** `GET /inventory/kardex?warehouse_id={id}&reference_type=ADJUSTMENT`

**Uso en componente:** ✅ SÍ (loadAdjustments)

---

### 3.2 Servicio de Creación (NO USADO)

**Archivo:** `src/app/services/stock-operations.service.ts`

```typescript
@Injectable({ providedIn: "root" })
export class StockOperationsService {
  private adjustmentsUrl: string = "/stock/adjustments";

  createAdjustment(payload: AdjustmentCreate): Observable<AdjustmentResponse> {
    return this.http.post<AdjustmentResponse>(this.adjustmentsUrl, payload);
  }

  createTransfer(payload: TransferCreate): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(this.transfersUrl, payload);
  }
}
```

**Endpoint:** `POST /stock/adjustments`

**Uso en componente:** ❌ **NO** (no está importado ni inyectado)

**Conclusión:** El servicio existe pero está **totalmente desconectado** del componente de UI.

---

## 4. MODELOS

### 4.1 Interfaz de Lectura (EN USO)

**Archivo:** `src/app/models/inventory.model.ts`

```typescript
export interface InventoryKardexLine {
  id: number;
  created_at: string; // ✅ MATCHES backend
  movement_type: "IN" | "OUT"; // ✅ MATCHES backend
  reason: string; // ✅ MATCHES backend
  reference_type?: string; // ✅ MATCHES backend (ADJUSTMENT, TRANSFER, ORDER, etc.)
  reference_id?: string;
  quantity: number; // ✅ MATCHES backend
  unit_cost: number;
  line_value: number;
  running_qty: number;
  running_value: number;
}
```

**Completitud:** ✅ COMPLETA (todos los campos del backend incluidos)

---

### 4.2 Interfaz de Creación (NO USADA)

**Archivo:** `src/app/models/stock-operations.model.ts`

```typescript
export type AdjustmentReason =
  | "CORRECTION" // Corrección de inventario
  | "DAMAGE" // Daño/Deterioro
  | "EXPIRY" // Vencimiento
  | "LOSS" // Pérdida/Robo
  | "FOUND" // Encontrado/Sobrante
  | "OTHER"; // Otro motivo

export interface AdjustmentItem {
  product_id: string;
  quantity: number; // ← Positivo = IN, Negativo = OUT
  reason: AdjustmentReason; // ← Enum específico (no string)
  notes?: string;
}

export interface AdjustmentCreate {
  warehouse_id: string; // ✅ MATCHES backend
  items: AdjustmentItem[]; // ✅ MATCHES backend
  performed_by: string; // ✅ MATCHES backend
  notes?: string; // ✅ MATCHES backend
}

export interface AdjustmentResponse {
  id: string;
  adjustment_number: string;
  warehouse_id: string;
  items: AdjustmentItem[];
  status: string;
  created_at: string;
  performed_by: string;
  notes?: string;
}
```

**Completitud:** ✅ COMPLETA (estructura alineada con backend)

**Comparación Backend vs Frontend:**

| Aspecto           | Backend                        | Frontend                                       | Match               |
| ----------------- | ------------------------------ | ---------------------------------------------- | ------------------- |
| **Endpoint**      | POST /stock/adjustments        | StockOperationsService.createAdjustment()      | ✅                  |
| **warehouse_id**  | ✅ Requerido                   | ✅ AdjustmentCreate.warehouse_id               | ✅                  |
| **items**         | ✅ Array requerido             | ✅ AdjustmentItem[]                            | ✅                  |
| **movement_type** | ✅ IN\|OUT                     | ❌ NO EN MODELO (derivado de sign de quantity) | ⚠️                  |
| **reason**        | ✅ MERMA, REGULARIZACION, etc. | ✅ CORRECTION, DAMAGE, etc.                    | ⚠️ ENUMS DIFERENTES |
| **performed_by**  | ✅ Requerido                   | ✅ AdjustmentCreate.performed_by               | ✅                  |
| **note**          | ✅ Opcional                    | ✅ AdjustmentCreate.notes                      | ✅                  |

**Discrepancias:**

1. **Enum de `reason` diferente:**
   - Backend espera: `MERMA`, `REGULARIZACION`, `INVENTARIO_INICIAL`, `OTRO`
   - Frontend define: `CORRECTION`, `DAMAGE`, `EXPIRY`, `LOSS`, `FOUND`, `OTHER`
   - **Riesgo:** Incompatibilidad en validación backend

2. **`movement_type` no en modelo:**
   - Backend: Requiere `movement_type: IN | OUT`
   - Frontend: NO incluye en `AdjustmentCreate`, se infiere del sign de quantity
   - **Riesgo:** Backend puede rechazar si no envía explicitly

---

## 5. FORMULARIOS

### Búsqueda Extensiva

| Patrón de Búsqueda                      | Resultado                                          |
| --------------------------------------- | -------------------------------------------------- |
| `*adjustment*form*`                     | ❌ No encontrado                                   |
| `*adjustment*dialog*`                   | ❌ No encontrado                                   |
| `*adjustment*modal*`                    | ❌ No encontrado                                   |
| `AdjustmentCreate` en componentes       | ❌ Solo definido en modelo                         |
| `StockOperationsService` en componentes | ❌ Solo servicio exporta, no se importa            |
| `confirmation-dialog`                   | ✅ Existe (compartido, pero no usado para ajustes) |

### Conclusión

**NO EXISTE formulario para crear ajustes:**

- ❌ Componente de formulario
- ❌ Modal/Dialog
- ❌ Página de creación
- ❌ Handler para botón "Nuevo Ajuste"

---

## 6. ESTRUCTURA ACTUAL vs ESPERADA

### Estructura Actual

```
adjustments-list.component.ts
  ├── Lectura: KardexService.getKardex(referenceType='ADJUSTMENT')
  ├── Filtro: warehouse + fecha range
  ├── Tabla: 6 columnas (date, warehouse, product, quantity, reason, user)
  ├── Botón: Deshabilitado (placeholder)
  └── NO: Creación de ajustes
```

### Estructura Esperada (Completa)

```
adjustments-list.component.ts
  ├── Lectura: KardexService.getKardex()
  ├── Creación: StockOperationsService.createAdjustment()
  ├── Botón: Habilitado → Abre formulario
  └── Modales/Forms

adjustment-create-form.component.ts
  ├── Seleccionar: warehouse
  ├── Líneas: +Agregar producto
  │  ├── Producto (autocomplete)
  │  ├── Cantidad (número: +/-)
  │  ├── Razón (select dropdown)
  │  └── Notas (texto)
  ├── Validación: FormGroup
  └── Submit: StockOperationsService.createAdjustment()

adjustment-create-dialog.component.ts
  └── Wrapper Material MatDialog
```

---

## 7. DIAGNÓSTICO CLASIFICADO

```
CLASIFICACIÓN: B + C (Híbrida)
```

### B) Falta conectar servicio (70% del problema)

- ✅ Servicio `StockOperationsService` existe
- ✅ Endpoint correcto: POST /stock/adjustments
- ✅ Modelo `AdjustmentCreate` existe
- ❌ **Nunca se inyecta en el componente**
- ❌ **No hay handler para el botón**
- ❌ **No hay navegación a formulario**

### C) Falta formulario (30% del problema)

- ❌ No existe `adjustment-create-form.component.ts`
- ❌ No existe `adjustment-create-dialog.component.ts`
- ❌ No existe validación de campos
- ❌ No existe lógica de líneas múltiples

### Problemas Secundarios

1. **Enum mismatch:** `AdjustmentReason` no coincide con backend
2. **`performed_by` ausente:** ¿De dónde se obtiene? (no hay auth service)
3. **`movement_type` implícito:** Código asume que negative quantity = OUT

---

## 8. PLAN DE IMPLEMENTACIÓN

### BACKLOG

| #     | Prioridad | Archivo                               | Cambio                                              | Complejidad | Estimación |
| ----- | --------- | ------------------------------------- | --------------------------------------------------- | ----------- | ---------- |
| **1** | ALTA      | stock-operations.model.ts             | Alinear `AdjustmentReason` enum con backend         | 🟩 Trivial  | 15 min     |
| **2** | ALTA      | adjustment-create-form.component.ts   | **Crear** componente formulario (ReactiveForm)      | 🟧 Media    | 2-3h       |
| **3** | MEDIA     | adjustment-create-dialog.component.ts | **Crear** wrapper MatDialog                         | 🟩 Trivial  | 30 min     |
| **4** | MEDIA     | adjustments-list.component.ts         | Inyectar `StockOperationsService` + evento click    | 🟩 Trivial  | 20 min     |
| **5** | MEDIA     | adjustments-list.component.ts         | Cambiar `disabled` → `(click)="openCreateDialog()"` | 🟩 Trivial  | 10 min     |
| **6** | MEDIA     | adjustments-list.component.ts         | Agregar método `openCreateDialog()`                 | 🟩 Trivial  | 15 min     |
| **7** | BAJA      | adjustments-list.component.ts         | Refresh tabla post-creación (subscribe a response)  | 🟩 Trivial  | 15 min     |
| **8** | BAJA      | app.routes.ts (si aplica)             | Agregar ruta para standalone create-form            | 🟩 Trivial  | 10 min     |

### Estimación Total

- **Tiempo:** ~5 horas (desarrollo limpio + testing)
- **Riesgo:** BAJO (todos los componentes existen o son simples)

---

## 9. DEPENDENCIAS EXTERNAS

### Servicios Requeridos (Existentes)

- ✅ `ApiConfigService` - buildUrl()
- ✅ `WarehouseService` - getWarehouses()
- ✅ `KardexService` - getKardex() (refresh post-create)

### Servicios Requeridos (NO EXISTEN)

- ❌ `AuthService` - Obtener `performed_by` (usuario logueado)
- ❌ `PermissionService` - Verificar permiso "create_adjustment"

### Recomendaciones

1. **Obtener usuario:** Buscar token en localStorage o inyectar desde session
2. **Permisos:** Si no existe auth, usar modelo simple (siempre permitido)

---

## 10. CHECKLIST DE VALIDACIÓN

Antes de implementar:

- [ ] Verificar enum `AdjustmentReason` contra API docs backend
- [ ] Confirmar si backend espera `movement_type` explícito o lo infiere
- [ ] Decidir: ¿`performed_by` = usuario logueado o field seleccionable?
- [ ] Revisar si Material MatDialog ya está importado en proyecto
- [ ] Confirmar si hay validación de "productos activos" por almacén
- [ ] Definir flujo post-creación (¿refresh automático? ¿notificación?)

---

## 11. OBSERVACIONES TÉCNICAS

### Debilidades Actuales

1. **Servicio huérfano:** `StockOperationsService` existe pero nadie lo usa
2. **Modelos sin usar:** `AdjustmentCreate`, `AdjustmentResponse` sin consumidor
3. **Componente incompleto:** Botón placeholder sin funcionalidad
4. **Sin auditoría:** `performed_by` sin origen claro

### Fortalezas

1. ✅ Arquitectura preparada (servicio + modelo listos)
2. ✅ Endpoint backend implementado
3. ✅ Lectura (Kardex) funciona correctamente
4. ✅ UI base (tabla, filtros) lista
5. ✅ Material Design integrado

### Riesgos al Implementar

1. **Enum mismatch** → Validación backend puede fallar
2. **performed_by ausente** → POST rechazado si required
3. **Validación producto** → ¿Qué productos son válidos por almacén?
4. **Permisos** → Sin auth, cualquiera puede crear (si se habilita botón)

---

## 12. CONCLUSIÓN

**Diagnóstico Final:** `B + C (Híbrida) - Moderadamente bloqueante`

### Estado Actual

- ✅ 80% de infraestructura existe
- ❌ 20% falta: formulario + integración UI-servicio
- ⚠️ Riesgo técnico bajo, pero requiere coordinación backend (enum validación)

### Recomendación

**Implementable en 1 sprint corto (5 horas dev + 1h QA)**

Prerequisitos:

1. Alinear enum con backend
2. Aclarar fuente de `performed_by`
3. Definir validaciones de producto por almacén

---

**Auditoría completada:** 5 junio 2026  
**Próximo paso:** Confirmar discrepancias enum con backend, luego proceder a implementación.
