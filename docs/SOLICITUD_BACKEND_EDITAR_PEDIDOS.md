# Solicitud al Equipo Backend: Edición de Pedidos (Órdenes)

## Fecha: 2026-07-17

## De: Equipo Frontend — Base4Empresas

## Estado: ⏳ Pendiente de implementación

---

## 1. Contexto

El frontend del módulo de **Pedidos** (`/ventas/pedidos`) tiene implementados los siguientes flujos:

| Acción               | Estado              | Endpoint                                             |
| -------------------- | ------------------- | ---------------------------------------------------- |
| ✅ Listar pedidos    | Funcionando         | `GET /orders`                                        |
| ✅ Ver detalle       | Funcionando         | `GET /orders/{order_id}`                             |
| ✅ Crear pedido      | Funcionando         | `POST /orders`                                       |
| ✅ Cambiar estado    | Funcionando         | `PATCH /orders/{order_id}/status`                    |
| ❌ **Editar pedido** | **No implementado** | `PATCH /orders/{order_id}` — **falta en el backend** |

Al hacer clic en el botón "Editar" (✏️) en la lista de pedidos, el frontend actualmente solo navega al detalle porque **no existe el endpoint `PATCH /orders/{order_id}`** para editar la información general del pedido y sus items.

---

## 2. Requerimiento

Se solicita implementar el endpoint:

```
PATCH /orders/{order_id}
```

### 2.1 Parámetros de Path

| Parámetro  | Tipo          | Descripción            |
| ---------- | ------------- | ---------------------- |
| `order_id` | string (UUID) | ID del pedido a editar |

### 2.2 Body (todos los campos opcionales — PATCH parcial)

```json
{
  "customer_id": "uuid-del-cliente",
  "sales_channel_id": "uuid-del-canal",
  "currency": "PEN",
  "initial_payment_amount": 50.0,
  "items": [
    {
      "product_id": "uuid-del-producto",
      "quantity": 2,
      "unit_price": 49.9,
      "discount": 5.0
    }
  ]
}
```

### 2.3 Respuesta esperada

Retornar el objeto `Order` completo actualizado (mismo schema que `GET /orders/{order_id}`):

```json
{
  "id": "uuid",
  "order_number": "ORD-000011",
  "customer_id": "uuid",
  "customer_name": "Juan Pérez",
  "sales_channel_id": "uuid",
  "status": "DRAFT",
  "total_amount": 99.80,
  "initial_payment_amount": 50.00,
  "paid_amount": 0.00,
  "currency": "PEN",
  "items": [...],
  "created_at": "2026-07-17T...",
  "updated_at": "2026-07-17T..."
}
```

---

## 3. Consideraciones de Negocio

### 3.1 ¿Qué campos deben ser editables?

| Campo                    | ¿Editable? | Condición                                       |
| ------------------------ | ---------- | ----------------------------------------------- |
| `customer_id`            | ✅ Sí      | Sin restricciones                               |
| `sales_channel_id`       | ✅ Sí      | Sin restricciones                               |
| `currency`               | ⚠️ Depende | Solo si el pedido no tiene pagos registrados    |
| `initial_payment_amount` | ✅ Sí      | Monto inicial esperado para separación          |
| `items`                  | ⚠️ Depende | Solo si el pedido está en `DRAFT` o `SEPARATED` |
| `status`                 | ❌ No      | Se maneja con `PATCH /orders/{id}/status`       |
| `order_number`           | ❌ No      | Número correlativo, no editable                 |

### 3.2 Restricciones sugeridas

- **Pedidos en estado `DRAFT`**: Permitir editar todos los campos
- **Pedidos en estado `SEPARATED`**: Permitir editar `customer_id`, `initial_payment_amount` y opcionalmente `items`
- **Pedidos en estado `INVOICED` o posterior**: Solo permitir editar `customer_id` (no items, ya tiene comprobante emitido)
- **Pedidos cancelados (`CANCELLED`)**: No permitir ninguna edición
- **Stock**: Si se modifican `items`, recalcular la reserva de stock automáticamente

---

## 4. Códigos de Error esperados

| Código HTTP                | Situación                                                 |
| -------------------------- | --------------------------------------------------------- |
| `200 OK`                   | Pedido actualizado exitosamente                           |
| `400 Bad Request`          | Datos inválidos (cantidad <= 0, precio < 0, items vacíos) |
| `404 Not Found`            | Pedido/cliente/producto no encontrado                     |
| `409 Conflict`             | Stock insuficiente / pedido tiene comprobante emitido     |
| `422 Unprocessable Entity` | Edición no permitida por el estado actual del pedido      |

### Ejemplo de error 409 — pedido no editable

```json
{
  "detail": "No se pueden modificar los items: el pedido ORD-000011 está en estado INVOICED."
}
```

---

## 5. Impacto en el Frontend (ya preparado para implementar)

Una vez implementado el endpoint, el frontend requiere:

### 5.1 Agregar `OrderUpdate` al modelo

**Archivo:** `src/app/models/order.model.ts`

```typescript
export interface OrderItemUpdate {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number | null;
}

export interface OrderUpdate {
  customer_id?: string;
  sales_channel_id?: string;
  currency?: string;
  initial_payment_amount?: number | null;
  items?: OrderItemUpdate[];
}
```

### 5.2 Agregar `updateOrder()` al servicio

**Archivo:** `src/app/services/orders.service.ts`

```typescript
updateOrder(orderId: string, payload: OrderUpdate): Observable<Order> {
  return this.http.patch<Order>(`${this.apiUrl}/${orderId}`, payload);
}
```

### 5.3 Crear `OrderFormComponent` (modo edición)

Similar a como funciona `SaleFormComponent` con modo creación/edición. El formulario se abriría como dialog desde:

- La lista de pedidos (botón ✏️)
- El detalle del pedido (botón "Editar")

Con campos:

- **Cliente** (autocomplete)
- **Canal de venta** (autocomplete/select)
- **Monto inicial** (número)
- **Items** (lista con producto, cantidad, precio, descuento)

---

## 6. Flujo Visual Esperado

```
Lista de Pedidos
  → clic en ✏️ Editar en fila de ORD-000011
    → Se abre dialog "Editar Pedido" con campos pre-cargados:
        ├── Cliente: Cliente Test Edwin (editable)
        ├── Canal de Venta: Al por Mayor (editable)
        ├── Monto Inicial: S/ 50.00 (editable)
        └── Items: [ Producto, Cantidad, Precio Unit., Descuento ] (editable si estado lo permite)
    → El usuario modifica los campos deseados
    → Clic en "Guardar Cambios"
        → PATCH /orders/{order_id}
            → 200 OK → Notificación "Pedido actualizado" → Lista recargada
            → 409 Error → "No se pueden modificar los items: pedido facturado"
```

---

## 7. Prueba en Swagger UI

**URL:** `http://localhost:8000/docs` → sección **Orders** → `PATCH /orders/{order_id}`

**ID de pedido de prueba:**

```
85305b1b-f211-4808-8d07-e94cc893304c
```

**Body mínimo de prueba:**

```json
{
  "initial_payment_amount": 75.0
}
```

---

## 8. Prioridad

**Media-Alta** — La edición de pedidos es importante para corregir errores de registro antes de que el pedido avance en su ciclo de vida (cambio de cliente, ajuste de ítems o precios antes de la separación/facturación).

---

_Documento generado por el equipo de Frontend — Base4Empresas_
_Fecha: 2026-07-17_
