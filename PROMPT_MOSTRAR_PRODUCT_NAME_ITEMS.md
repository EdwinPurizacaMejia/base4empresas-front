# PROMPT: Mostrar product_name en Items de Orden

## CONTEXTO

El backend ahora retorna `product_name` en los items de la orden (GET /orders/{id}).

**Ejemplo de respuesta:**

```json
{
  "items": [
    {
      "id": "789a109b-3e91-4637-8152-659482157e72",
      "product_id": "eb716d77-ad7d-407d-86e1-97211b743438",
      "product_name": "Producto Test",  ← NUEVO CAMPO
      "product_sku": "TEST-SKU-001",
      "quantity": 1.0,
      "unit_price": 50.0,
      "subtotal": 50.0
    }
  ]
}
```

**Estado actual:** Columna "Producto" muestra UUID: `eb716d77-ad7d-407d-86e1-97211b743438`  
**Estado deseado:** Columna "Producto" muestra nombre: `Producto Test`

---

## OBJETIVO

Mostrar `product_name` en lugar de `product_id` en la tabla de Items de la Orden.

---

## ARCHIVO A MODIFICAR

**order-detail.component.html**

**Ubicación:** Sección "Ítems de la Orden"

**Buscar:**

```html
<!-- Producto -->
<ng-container matColumnDef="product">
  <th mat-header-cell *matHeaderCellDef>Producto</th>
  <td mat-cell *matCellDef="let item">{{ item.product?.name || item.product_id }}</td>
</ng-container>
```

**Reemplazar por:**

```html
<!-- Producto -->
<ng-container matColumnDef="product">
  <th mat-header-cell *matHeaderCellDef>Producto</th>
  <td mat-cell *matCellDef="let item">{{ item.product_name || item.product?.name || item.product_id }}</td>
</ng-container>
```

---

## EXPLICACIÓN DEL CAMBIO

### Orden de prioridad:

1. `item.product_name` - Campo nuevo del backend (populated)
2. `item.product?.name` - Si hay objeto product (legacy/fallback)
3. `item.product_id` - UUID como último recurso

### Lógica:

```typescript
item.product_name || // "Producto Test" ✅ PREFERIDO
  item.product?.name || // Fallback si existe objeto
  item.product_id; // UUID como último recurso
```

---

## VALIDACIÓN

### Build:

```bash
npm run build
```

**Resultado esperado:** ✅ Sin errores

### Prueba Manual:

**1. Ver detalle de orden:**

```
- Ir a /ventas/pedidos/{id}
- Revisar sección "Ítems de la Orden (1)"
- Columna "Producto"
- ✅ Debe mostrar: "Producto Test"
- ❌ NO debe mostrar: "eb716d77-ad7d-407d-86e1-97211b743438"
```

**2. Con múltiples items:**

```
- Orden con 3 productos
- ✅ Todos deben mostrar nombres legibles
- ✅ No deben mostrar UUIDs
```

---

## RESUMEN

**Archivo modificado:** 1  
**Líneas modificadas:** 1  
**Complejidad:** BAJA  
**Tiempo:** 2 minutos

**Cambio:**

```diff
  <td mat-cell *matCellDef="let item">
-   {{ item.product?.name || item.product_id }}
+   {{ item.product_name || item.product?.name || item.product_id }}
  </td>
```

---

## VENTAJAS

### ✅ Compatibilidad hacia atrás:

- Si backend retorna `product_name` → usa nombre ✅
- Si backend NO retorna `product_name` → usa product.name (legacy) ✅
- Si ninguno existe → muestra ID (último recurso) ✅

### ✅ Sin cambios en backend:

- Solo consume campo existente
- No requiere modificaciones en FastAPI

### ✅ UX mejorada:

- Usuario ve nombres legibles
- No ve UUIDs confusos

---

## EJEMPLO VISUAL

### ANTES (❌):

```
PRODUCTO                                     | CANTIDAD | PRECIO
eb716d77-ad7d-407d-86e1-97211b743438        | 1        | S/ 50.00
```

### DESPUÉS (✅):

```
PRODUCTO              | CANTIDAD | PRECIO
Producto Test         | 1        | S/ 50.00
```

---

## PROMPT PARA COPILOT

```
El backend ahora retorna product_name en los items de la orden.

Actualizar order-detail.component.html para mostrar product_name en la tabla de Items:

Archivo: src/app/components/orders/order-detail.component.html

Buscar la columna "product" en la tabla de items:
{{ item.product?.name || item.product_id }}

Cambiar por:
{{ item.product_name || item.product?.name || item.product_id }}

Esto usa product_name como primera opción, con fallback a product.name y finalmente product_id.

Validación:
- npm run build (debe compilar sin errores)
- Verificar en /ventas/pedidos/{id} que muestra "Producto Test" en lugar del UUID

No cambiar:
- No modificar backend
- No cambiar displayedColumns
- No cambiar servicios
- Solo el binding del template

Resultado esperado:
En lugar de ver: eb716d77-ad7d-407d-86e1-97211b743438
Debe mostrar: Producto Test
```

---

**Fecha:** 7/6/2026, 13:34  
**Prioridad:** MEDIA  
**Impacto:** UX - Mejora legibilidad de items  
**Riesgo:** BAJO - Cambio trivial
