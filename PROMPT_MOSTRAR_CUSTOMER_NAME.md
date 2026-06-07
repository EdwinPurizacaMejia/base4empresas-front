# PROMPT: Mostrar customer_name en Listados de Órdenes y Pagos

## CONTEXTO

El backend ahora retorna el campo `customer_name` en el endpoint GET /orders.

**Ejemplo de respuesta:**

```json
{
  "id": "c7cdc807-0a92-4348-abc8-f02e2a3baa52",
  "order_number": "ORD-000009",
  "customer_id": "e26b1e14-9acf-4aff-a57d-005ebee6bb49",
  "customer_name": "Cliente Test Edwin",  ← NUEVO CAMPO
  "sales_channel_id": "016a0aed-646f-4d30-a497-48353f26dfa7",
  "status": "SEPARATED",
  "total_amount": 170.0,
  "paid_amount": 99.99,
  "currency": "PEN"
}
```

## OBJETIVO

Mostrar `customer_name` en lugar de `customer_id` en:

1. Listado de pedidos (orders-list.component)
2. Listado de pagos (payments-list.component)

---

## TAREA 1: Actualizar Order Model

**Archivo:** `src/app/models/order.model.ts`

**Acción:** Agregar campo `customer_name` opcional al interface Order

```typescript
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string; // ← AGREGAR ESTE CAMPO
  sales_channel_id: string;
  status: OrderStatus;
  total_amount: number;
  paid_amount: number;
  currency: string;
  is_stock_reserved: boolean;
  created_at: string;
  updated_at: string;
}
```

**Razón:** Definir el tipo para que TypeScript reconozca el campo

---

## TAREA 2: Actualizar Listado de Órdenes

**Archivo:** `src/app/components/orders/orders-list.component.html`

**Buscar la columna "customer":**

```html
<ng-container matColumnDef="customer">
  <th mat-header-cell *matHeaderCellDef>Cliente</th>
  <td mat-cell *matCellDef="let order">{{ order.customer_id }} ← CAMBIAR ESTO</td>
</ng-container>
```

**Reemplazar por:**

```html
<ng-container matColumnDef="customer">
  <th mat-header-cell *matHeaderCellDef>Cliente</th>
  <td mat-cell *matCellDef="let order">{{ order.customer_name || order.customer_id }}</td>
</ng-container>
```

**Razón:**

- Mostrar `customer_name` si existe
- Fallback a `customer_id` si no viene el nombre (compatibilidad)

---

## TAREA 3: Actualizar Listado de Pagos

**Archivo:** `src/app/components/orders/payments-list.component.ts`

**Buscar la columna "customer" en el template inline:**

```typescript
<!-- Cliente -->
<ng-container matColumnDef="customer">
  <th mat-header-cell *matHeaderCellDef>Cliente</th>
  <td mat-cell *matCellDef="let order">
    {{ order.customer_id }}  ← CAMBIAR ESTO
  </td>
</ng-container>
```

**Reemplazar por:**

```typescript
<!-- Cliente -->
<ng-container matColumnDef="customer">
  <th mat-header-cell *matHeaderCellDef>Cliente</th>
  <td mat-cell *matCellDef="let order">
    {{ order.customer_name || order.customer_id }}
  </td>
</ng-container>
```

**Razón:** Mismo pattern que orders-list

---

## VALIDACIÓN

### Build:

```bash
npm run build
```

**Resultado esperado:** ✅ Sin errores

### Prueba Manual:

**1. Listado de Órdenes:**

```
- Ir a /ventas/pedidos
- Verificar columna "Cliente"
- ✅ Debe mostrar: "Cliente Test Edwin" (no el UUID)
- ✅ Debe mostrar: "Maria Lopez" (no el UUID)
- ✅ Debe mostrar: "Botica Central S.A.C." (no el UUID)
```

**2. Listado de Pagos:**

```
- Ir a /ventas/pagos
- Verificar columna "Cliente"
- ✅ Debe mostrar nombres de clientes (no UUIDs)
```

---

## RESUMEN DE CAMBIOS

| Archivo                      | Cambio                                             | Descripción    |
| ---------------------------- | -------------------------------------------------- | -------------- |
| `order.model.ts`             | Agregar `customer_name?: string`                   | Definir tipo   |
| `orders-list.component.html` | `{{ order.customer_name \|\| order.customer_id }}` | Mostrar nombre |
| `payments-list.component.ts` | `{{ order.customer_name \|\| order.customer_id }}` | Mostrar nombre |

**Total archivos:** 3  
**Total líneas:** ~3 cambios  
**Complejidad:** BAJA  
**Tiempo:** 5 minutos

---

## CONSIDERACIONES

### ✅ Compatibilidad hacia atrás:

```typescript
{
  {
    order.customer_name || order.customer_id;
  }
}
```

- Si backend retorna `customer_name` → muestra nombre ✅
- Si backend NO retorna `customer_name` → muestra ID (fallback) ✅

### ✅ Sin cambios en backend:

- No requiere modificaciones en FastAPI
- Solo consume el campo ya existente

### ✅ Sin refactors:

- Mantiene estructura actual
- Solo cambia el binding del template

---

## PROMPT PARA AXET

```
El backend ahora retorna customer_name en GET /orders.

Actualizar frontend para mostrar customer_name en lugar de customer_id:

1. Archivo: src/app/models/order.model.ts
   - Agregar campo: customer_name?: string; al interface Order

2. Archivo: src/app/components/orders/orders-list.component.html
   - Buscar columna "customer"
   - Cambiar: {{ order.customer_id }}
   - Por: {{ order.customer_name || order.customer_id }}

3. Archivo: src/app/components/orders/payments-list.component.ts
   - Buscar columna "customer" en template inline
   - Cambiar: {{ order.customer_id }}
   - Por: {{ order.customer_name || order.customer_id }}

Validación:
- npm run build (debe compilar sin errores)
- Verificar en /ventas/pedidos que muestra nombres
- Verificar en /ventas/pagos que muestra nombres

No cambiar:
- No modificar backend
- No cambiar displayedColumns
- No cambiar servicios
- Solo binding del template

Resultado esperado:
En lugar de ver UUIDs como "e26b1e14-9acf-4aff-a57d-005ebee6bb49"
Debe mostrar nombres como "Cliente Test Edwin"
```

---

## EJEMPLO VISUAL

### ANTES (❌):

```
Nro. Orden  | Cliente                                    | Canal
ORD-000009  | e26b1e14-9acf-4aff-a57d-005ebee6bb49      | Tienda Física
ORD-000008  | 6a8e4683-8bc0-4ab3-90a2-e5faad81ba2a      | Ecommerce
```

### DESPUÉS (✅):

```
Nro. Orden  | Cliente                | Canal
ORD-000009  | Cliente Test Edwin     | Tienda Física
ORD-000008  | Botica Central S.A.C.  | Ecommerce
```

---

**Fecha:** 7/6/2026, 12:24  
**Prioridad:** MEDIA  
**Impacto:** UX - Mejora legibilidad  
**Riesgo:** BAJO - Cambio simple
