# Análisis de Diferencias: Frontend vs Backend - Ajustes de Stock

## 📊 Resumen Ejecutivo

**Estado:** ❌ **DESALINEADO** - Requiere refactorización completa  
**Prioridad:** 🔴 **CRÍTICA**  
**Archivos afectados:** 2

---

## 1. DIFERENCIAS ENCONTRADAS

### 1.1 AdjustmentReason (Enum)

| Aspecto      | Frontend Actual                                | Backend Real                                    | Estado                  |
| ------------ | ---------------------------------------------- | ----------------------------------------------- | ----------------------- |
| **Valores**  | CORRECTION, DAMAGE, EXPIRY, LOSS, FOUND, OTHER | MERMA, REGULARIZACION, INVENTARIO_INICIAL, OTRO | ❌ TOTALMENTE DIFERENTE |
| **Cantidad** | 6 valores                                      | 4 valores                                       | ❌                      |
| **Nombres**  | En inglés                                      | En español                                      | ❌                      |

**Impacto:** 🔴 CRÍTICO - El backend rechazará todos los valores del frontend

---

### 1.2 AdjustmentItem (Interface)

#### Frontend Actual:

```typescript
interface AdjustmentItem {
  product_id: string;
  quantity: number; // Positivo = incremento, Negativo = decremento
  reason: AdjustmentReason; // ❌ NO EXISTE EN BACKEND
  notes?: string; // ❌ NO EXISTE EN BACKEND
}
```

#### Backend Real:

```python
class StockAdjustmentItem(BaseModel):
    product_id: UUID
    quantity: condecimal(gt=0)  # SIEMPRE POSITIVO
    unit_cost: Optional[condecimal(ge=0)]  # ❌ NO EXISTE EN FRONTEND
```

**Diferencias críticas:**

| Campo        | Frontend                    | Backend                      | Estado                  | Impacto    |
| ------------ | --------------------------- | ---------------------------- | ----------------------- | ---------- |
| `product_id` | ✅ string                   | ✅ UUID                      | ✅ Compatible           | -          |
| `quantity`   | number (puede ser negativo) | decimal (siempre > 0)        | ❌ INCOMPATIBLE         | 🔴 CRÍTICO |
| `reason`     | ✅ Existe en item           | ❌ No existe (está en padre) | ❌ UBICACIÓN INCORRECTA | 🔴 CRÍTICO |
| `notes`      | ✅ Existe                   | ❌ No existe                 | ❌ NO SOPORTADO         | 🟡 Medio   |
| `unit_cost`  | ❌ No existe                | ✅ Existe (condicional)      | ❌ FALTANTE             | 🔴 CRÍTICO |

---

### 1.3 AdjustmentCreate (Request)

#### Frontend Actual:

```typescript
interface AdjustmentCreate {
  warehouse_id: string;
  items: AdjustmentItem[];
  performed_by: string; // ❌ NO EXISTE EN BACKEND
  notes?: string; // ⚠️ Backend usa "note" (singular)
}
```

#### Backend Real:

```python
class StockAdjustmentCreate(BaseModel):
    warehouse_id: UUID
    movement_type: str  # ❌ NO EXISTE EN FRONTEND
    reason: AdjustmentReason = "OTRO"
    note: Optional[str]
    items: list[StockAdjustmentItem]
```

**Diferencias críticas:**

| Campo           | Frontend       | Backend                     | Estado          | Impacto    |
| --------------- | -------------- | --------------------------- | --------------- | ---------- |
| `warehouse_id`  | ✅ string      | ✅ UUID                     | ✅ Compatible   | -          |
| `movement_type` | ❌ No existe   | ✅ "IN" o "OUT" (requerido) | ❌ FALTANTE     | 🔴 CRÍTICO |
| `reason`        | ❌ No existe   | ✅ AdjustmentReason         | ❌ FALTANTE     | 🔴 CRÍTICO |
| `note`          | notes (plural) | note (singular)             | ⚠️ DIFERENTE    | 🟡 Medio   |
| `performed_by`  | ✅ Existe      | ❌ No existe                | ❌ NO SOPORTADO | 🟡 Medio   |
| `items`         | ✅ Existe      | ✅ Existe                   | ✅ Compatible   | -          |

---

### 1.4 AdjustmentResponse

#### Frontend Actual:

```typescript
interface AdjustmentResponse {
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

#### Backend Real:

```python
class StockAdjustmentResponse(BaseModel):
    reference_id: UUID
    movement_type: str
    reason: str
    warehouse_id: UUID
    items: list[dict]
```

**Diferencias críticas:**

| Campo Frontend      | Campo Backend     | Estado              | Impacto    |
| ------------------- | ----------------- | ------------------- | ---------- |
| `id`                | `reference_id`    | ⚠️ NOMBRE DIFERENTE | 🟡 Medio   |
| `adjustment_number` | ❌ No existe      | ❌ NO SOPORTADO     | 🟡 Medio   |
| `warehouse_id`      | ✅ `warehouse_id` | ✅ Compatible       | -          |
| `items`             | ✅ `items`        | ✅ Compatible       | -          |
| `status`            | ❌ No existe      | ❌ NO SOPORTADO     | 🟡 Medio   |
| `created_at`        | ❌ No existe      | ❌ NO SOPORTADO     | 🟡 Medio   |
| `performed_by`      | ❌ No existe      | ❌ NO SOPORTADO     | 🟡 Medio   |
| `notes`             | ❌ No existe      | ❌ NO SOPORTADO     | 🟡 Medio   |
| ❌ No existe        | `movement_type`   | ❌ FALTANTE         | 🔴 CRÍTICO |
| ❌ No existe        | `reason`          | ❌ FALTANTE         | 🔴 CRÍTICO |

**Items Response:**

```typescript
// Backend retorna:
{
  product_id: string;
  quantity: number;
  unit_cost: number; // ❌ NO EXISTE EN FRONTEND
  line_total_cost: number; // ❌ NO EXISTE EN FRONTEND
}
```

---

## 2. CONCEPTOS FUNDAMENTALES INCORRECTOS

### 2.1 Sistema de Dirección de Movimientos

#### ❌ Frontend Actual (INCORRECTO):

```typescript
quantity: number; // Positivo = entrada, Negativo = salida
```

#### ✅ Backend Real (CORRECTO):

```typescript
movement_type: "IN" | "OUT"; // Define dirección
quantity: number; // SIEMPRE positivo (> 0)
```

**Impacto:** 🔴 CRÍTICO - El backend rechazará cantidades negativas (HTTP 422)

---

### 2.2 Ubicación del Campo "reason"

#### ❌ Frontend Actual (INCORRECTO):

```typescript
interface AdjustmentItem {
  reason: AdjustmentReason; // Cada ítem tiene su razón
}
```

#### ✅ Backend Real (CORRECTO):

```typescript
interface AdjustmentCreate {
  reason: AdjustmentReason; // UNA razón para todo el ajuste
  items: AdjustmentItem[]; // Items NO tienen reason individual
}
```

**Impacto:** 🔴 CRÍTICO - Diferencia arquitectónica fundamental

---

### 2.3 Campo unit_cost Condicional

#### ❌ Frontend Actual:

- No existe `unit_cost`

#### ✅ Backend Real:

```typescript
// Para movement_type = "IN":
unit_cost: number;  // OBLIGATORIO (HTTP 422 si falta)

// Para movement_type = "OUT":
unit_cost?: never;  // IGNORADO (calculado por sistema)
```

**Impacto:** 🔴 CRÍTICO - El backend rechazará ajustes IN sin unit_cost

---

## 3. VALIDACIONES BACKEND NO CONTEMPLADAS

| Validación                     | Backend        | Frontend             | Estado            |
| ------------------------------ | -------------- | -------------------- | ----------------- |
| `movement_type` = "IN" o "OUT" | ✅ Obligatorio | ❌ No existe         | ❌ FALTANTE       |
| `quantity` > 0                 | ✅ Validado    | ⚠️ Permite negativos | ❌ INCORRECTO     |
| `unit_cost` obligatorio si IN  | ✅ Validado    | ❌ No contemplado    | ❌ FALTANTE       |
| Stock suficiente para OUT      | ✅ Validado    | ❌ No contemplado    | ⚠️ Backend valida |
| `items` no vacío               | ✅ Validado    | ❌ No contemplado    | ⚠️ Backend valida |

---

## 4. ARCHIVOS A MODIFICAR

### 4.1 src/app/models/stock-operations.model.ts

**Estado actual:** ❌ DESALINEADO  
**Acción:** 🔄 REFACTORIZAR COMPLETO

**Cambios necesarios:**

- ❌ Eliminar enum `AdjustmentReason` actual
- ✅ Crear enum `AdjustmentReason` con valores backend (MERMA, REGULARIZACION, etc.)
- ✅ Agregar enum `MovementType` ("IN" | "OUT")
- ❌ Eliminar interface `AdjustmentItem` actual
- ✅ Crear interface `StockAdjustmentItem` alineada con backend
- ❌ Eliminar interface `AdjustmentCreate` actual
- ✅ Crear interface `StockAdjustmentCreate` alineada con backend
- ❌ Eliminar interface `AdjustmentResponse` actual
- ✅ Crear interface `StockAdjustmentResponse` alineada con backend
- ✅ Agregar helper `getAdjustmentReasonLabel()` para labels en español

---

### 4.2 src/app/services/stock-operations.service.ts

**Estado actual:** ⚠️ PARCIALMENTE ALINEADO  
**Acción:** 🔄 ACTUALIZAR

**Cambios necesarios:**

- ✅ Mantener método `createAdjustment()`
- 🔄 Cambiar parámetro: `AdjustmentCreate` → `StockAdjustmentCreate`
- 🔄 Cambiar retorno: `AdjustmentResponse` → `StockAdjustmentResponse`
- ✅ Mantener URL: `/stock/adjustments`
- ⚠️ Agregar comentarios sobre validaciones

---

## 5. PROPUESTA DE CORRECCIÓN

### 5.1 Nuevo stock-operations.model.ts

```typescript
/**
 * Modelos alineados con backend FastAPI
 * Endpoint: POST /stock/adjustments
 * Schema: app/schemas/stock_adjustment.py
 */

/**
 * Tipo de movimiento de stock
 */
export enum MovementType {
  IN = 'IN',    // Entrada de stock (incremento)
  OUT = 'OUT'   // Salida de stock (decremento)
}

/**
 * Razones para ajustes de inventario
 * Valores del backend (en español)
 */
export enum AdjustmentReason {
  MERMA = 'MERMA',                           // Pérdidas, roturas, vencimientos
  REGULARIZACION = 'REGULARIZACION',         // Correcciones de inventario
  INVENTARIO_INICIAL = 'INVENTARIO_INICIAL', // Carga inicial de stock
  OTRO = 'OTRO'                              // Motivos no categorizados
}

/**
 * Item individual en un ajuste de stock
 * Nota: quantity es SIEMPRE POSITIVA (movement_type define dirección)
 */
export interface StockAdjustmentItem {
  product_id: string;
  quantity: number;      // SIEMPRE > 0
  unit_cost?: number;    // OBLIGATORIO para IN, IGNORADO para OUT
}

/**
 * Request para crear un ajuste de stock
 * POST /stock/adjustments
 */
export interface StockAdjustmentCreate {
  warehouse_id: string;
  movement_type: MovementType;  // "IN" o "OUT"
  reason?: AdjustmentReason;    // Default: OTRO
  note?: string;                // Nota opcional (singular)
  items: StockAdjustmentItem[]; // Mínimo 1 ítem
}

/**
 * Item en la respuesta del backend
 */
export interface StockAdjustmentItemResponse {
  product_id: string;
  quantity: number;
  unit_cost: number;         // Calculado por backend
  line_total_cost: number;   // quantity * unit_cost
}

/**
 * Response del backend al crear ajuste
 */
export interface StockAdjustmentResponse {
  reference_id: string;      // UUID del ajuste
  movement_type: string;     // "IN" o "OUT"
  reason: string;            // Motivo del ajuste
  warehouse_id: string;
  items: StockAdjustmentItemResponse[];
}

/**
 * Helper para obtener labels en español
 */
export function getAdjustmentReasonLabel(reason: AdjustmentReason): string {
  const labels: Record<AdjustmentReason, string> = {
    [AdjustmentReason.MERMA]: 'Merma / Pérdida',
    [AdjustmentReason.REGULARIZACION]: 'Regularización',
    [AdjustmentReason.INVENTARIO_INICIAL]: 'Inventario Inicial',
    [AdjustmentReason.OTRO]: 'Otro',
  };
  return labels[reason] || reason;
}

/**
 * Helper para obtener label de movement type
 */
export function getMovementTypeLabel(type: MovementType): string {
  return type === MovementType.IN
```
