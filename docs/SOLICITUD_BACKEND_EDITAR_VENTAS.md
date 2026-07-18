# Solicitud al Equipo Backend: Edición de Ventas

## Fecha: 2026-07-17

## De: Equipo Frontend — Base4Empresas

## Estado: ⏳ Pendiente de implementación

---

## 1. Contexto

El frontend del módulo de **Ventas** (`/ventas/ventas`) tiene implementados los siguientes flujos:

| Acción              | Estado              | Endpoint                                           |
| ------------------- | ------------------- | -------------------------------------------------- |
| ✅ Listar ventas    | Funcionando         | `GET /sales`                                       |
| ✅ Ver detalle      | Funcionando         | `GET /sales/{sale_id}`                             |
| ✅ Crear venta      | Funcionando         | `POST /sales`                                      |
| ❌ **Editar venta** | **No implementado** | `PATCH /sales/{sale_id}` — **falta en el backend** |
| ⬜ Eliminar venta   | Placeholder         | Sin endpoint definido                              |

Al hacer clic en el botón "Editar" (✏️) en la lista de ventas, actualmente el frontend navega al detalle de la venta como solución temporal porque **no existe el endpoint `PATCH /sales/{sale_id}`**.

---

## 2. Requerimiento

Se solicita implementar el endpoint:

```
PATCH /sales/{sale_id}
```

### 2.1 Parámetros de Path

| Parámetro | Tipo          | Descripción             |
| --------- | ------------- | ----------------------- |
| `sale_id` | string (UUID) | ID de la venta a editar |

### 2.2 Body (todos los campos opcionales)

```json
{
  "customer_id": "uuid-del-cliente | null",
  "warehouse_id": "uuid-del-almacen",
  "notes": "Notas adicionales | null",
  "items": [
    {
      "product_id": "uuid-del-producto",
      "quantity": 2,
      "unit_price": 49.9
    }
  ]
}
```

### 2.3 Respuesta esperada

Retornar el objeto `SaleResponse` actualizado (mismo schema que `GET /sales/{sale_id}`):

```json
{
  "id": "uuid",
  "number": "BOL-000006",
  "customer_id": "uuid | null",
  "warehouse_id": "uuid",
  "sale_date": "2026-07-17T...",
  "status": "completed",
  "payment_status": "paid",
  "subtotal": 99.80,
  "tax": 17.96,
  "total": 117.76,
  "notes": null,
  "items": [...]
}
```

---

## 3. Consideraciones de Negocio

### 3.1 ¿Qué campos deben ser editables?

Se solicita aclaración al equipo backend sobre cuáles campos son editables una vez creada la venta. Propuesta sugerida:

| Campo          | ¿Editable? | Comentario                               |
| -------------- | ---------- | ---------------------------------------- |
| `customer_id`  | ✅ Sí      | Cambiar el cliente asociado              |
| `warehouse_id` | ⚠️ Depende | Solo si la venta no ha movido stock aún  |
| `notes`        | ✅ Sí      | Siempre editable                         |
| `items`        | ⚠️ Depende | Solo si el estado es `pending` o similar |
| `status`       | ❌ No      | Se maneja con endpoints específicos      |

### 3.2 Restricciones sugeridas

- **Ventas en estado `completed`**: Solo permitir editar `notes` y `customer_id`
- **Ventas en estado `pending`**: Permitir editar todos los campos incluyendo `items`
- **Ventas con documentos electrónicos emitidos**: No permitir editar `items` ni `warehouse_id` (integridad contable)
- **Stock**: Si se modifica `items` o `warehouse_id`, el backend debe recalcular y ajustar el movimiento de stock

---

## 4. Respuestas de Error esperadas

| Código HTTP                | Situación                                             |
| -------------------------- | ----------------------------------------------------- |
| `200 OK`                   | Venta actualizada exitosamente                        |
| `400 Bad Request`          | Datos inválidos (precio negativo, cantidad = 0, etc.) |
| `404 Not Found`            | Venta no encontrada                                   |
| `409 Conflict`             | Stock insuficiente al modificar items                 |
| `422 Unprocessable Entity` | Edición no permitida por el estado actual de la venta |

---

## 5. Impacto en el Frontend

Una vez implementado el endpoint, el frontend requiere:

### 5.1 Agregar `SaleUpdate` al modelo

**Archivo:** `src/app/models/sale.model.ts`

```typescript
export interface SaleUpdate {
  customer_id?: string | null;
  warehouse_id?: string;
  notes?: string | null;
  items?: SaleItemCreate[];
}
```

### 5.2 Agregar método `updateSale()` al servicio

**Archivo:** `src/app/services/sales.service.ts`

```typescript
updateSale(saleId: string, payload: SaleUpdate): Observable<SaleResponse> {
  return this.http.patch<SaleResponse>(`${this.apiUrl}/${saleId}`, payload);
}
```

### 5.3 Actualizar `SaleFormComponent` para modo edición

**Archivo:** `src/app/components/sale-form/sale-form.component.ts`

El formulario de "Nueva Venta" ya existe y funciona. Se necesita:

- Aceptar datos de una venta existente via `MAT_DIALOG_DATA`
- Pre-llenar los campos (cliente, almacén, notas, items) con los valores actuales
- Cambiar el título a "Editar Venta"
- Al guardar, llamar `updateSale()` en lugar de `createSale()`

### 5.4 Conectar el botón "Editar" en la lista de ventas

**Archivo:** `src/app/components/sale-list/sale-list.component.ts`

```typescript
onEditSale(sale: SaleListItem): void {
  const dialogRef = this.dialog.open(SaleFormComponent, {
    width: '760px',
    data: { sale }, // pasar la venta para pre-llenar el formulario
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result) this.loadSales();
  });
}
```

---

## 6. Flujo Visual Esperado

```
Lista de Ventas
  → clic en ✏️ Editar
    → Se abre el dialog "Editar Venta" con datos pre-cargados
        - Almacén (pre-seleccionado)
        - Cliente (pre-seleccionado)
        - Notas (pre-cargadas)
        - Items (productos, cantidades y precios actuales)
    → El usuario modifica los campos deseados
    → Clic en "Guardar Cambios"
        → PATCH /sales/{sale_id}
            → OK → Notificación de éxito → Lista actualizada
            → Error → Mensaje de error descriptivo
```

---

## 7. Prioridad

**Media-Alta** — La funcionalidad de editar ventas es importante para corregir errores de registro (cliente incorrecto, precio equivocado, etc.) sin tener que eliminar y volver a crear la venta.

---

_Documento generado por el equipo de Frontend — Base4Empresas_
