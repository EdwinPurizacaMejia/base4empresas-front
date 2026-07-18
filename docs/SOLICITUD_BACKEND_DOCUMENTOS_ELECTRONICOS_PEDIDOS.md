# Solicitud al Equipo Backend: Documentos Electrónicos en Pedidos

## Fecha: 2026-07-17

## Contexto

El frontend ya implementa la generación de comprobantes electrónicos (Boletas/Facturas) desde el módulo de **Ventas** usando el endpoint existente:

```
POST /api/v1/electronic-documents/from-sale/{sale_id}?document_type=invoice
```

Sin embargo, el módulo de **Pedidos** (`/orders`) **no tiene soporte para documentos electrónicos** y actualmente no existe ningún endpoint que permita generarlos desde un pedido.

---

## Problema Identificado

Al analizar el `OpenAPI` del backend, se encontró:

1. `OrderResponse` **no contiene** el campo `sale_id` — los pedidos no están vinculados a ventas.
2. **No existe** ningún endpoint `from-order/{order_id}` para documentos electrónicos.
3. El único endpoint disponible es `from-sale/{sale_id}`.

Esto significa que actualmente un usuario **no puede generar una boleta o factura desde un pedido**, lo cual es un flujo esencial para el negocio.

---

## Requerimiento

Se solicita al equipo backend implementar **una de las siguientes opciones** (se prefiere la Opción A):

---

### Opción A (Recomendada): Nuevo endpoint `from-order`

Crear el endpoint:

```
POST /api/v1/electronic-documents/from-order/{order_id}?document_type=invoice
```

**Comportamiento esperado:**

- Recibe el `order_id` de un pedido existente
- El parámetro `document_type` acepta: `invoice`, `credit_note`, `debit_note`
- Internamente el backend obtiene los datos del pedido (cliente, items, totales, almacén)
- Crea un documento electrónico asociado al pedido
- Retorna el mismo schema `DocumentResponse` que `from-sale`:

```json
{
  "id": "uuid",
  "document_type": "01",
  "full_number": "F001-000001",
  "status": "READY",
  "provider": null,
  "pdf_url": null,
  "xml_url": null,
  "cdr_url": null,
  "total_amount": 99.0,
  "created_at": "2026-07-17T...",
  "updated_at": "2026-07-17T..."
}
```

**Adicionalmente**, se solicita que `DocumentResponse` incluya el campo `order_id` (opcional/nullable) para poder filtrar documentos por pedido:

```json
{
  "id": "uuid",
  "order_id": "uuid-del-pedido",   ← campo nuevo
  "sale_id": "uuid-de-venta",      ← campo nuevo (también para ventas)
  "document_type": "01",
  ...
}
```

---

### Opción B (Alternativa): Vincular Pedido → Venta

Cuando un pedido alcanza el estado `completed` o `delivered`, el backend genera automáticamente una **Venta** (`/sales`) asociada al pedido, incluyendo:

- El campo `order_id` en `SaleResponse` para trazabilidad
- El campo `sale_id` en `OrderResponse` para referencia cruzada

Esto permitiría al frontend usar el flujo existente de `from-sale` para generar comprobantes desde pedidos completados.

---

## Impacto en el Frontend

Una vez implementada cualquiera de las opciones, el frontend requiere:

1. Agregar el método en `ElectronicDocumentsService`:

   ```typescript
   createFromOrder(orderId: string, documentType: ElectronicDocumentType): Observable<ElectronicDocument>
   ```

2. Integrar el `ElectronicDocumentPanelComponent` en el `OrderDetailComponent` (ya existe el componente, solo necesita ser incluido).

3. Agregar el botón "Generar Comprobante" en la lista de pedidos (similar al ya implementado en la lista de ventas).

---

## Endpoints existentes que sí funcionan (para referencia)

| Estado               | Endpoint                                                  |
| -------------------- | --------------------------------------------------------- |
| ✅ Implementado      | `POST /api/v1/electronic-documents/from-sale/{sale_id}`   |
| ✅ Implementado      | `POST /api/v1/electronic-documents/{id}/emit`             |
| ✅ Implementado      | `GET /api/v1/electronic-documents/`                       |
| ❌ Falta implementar | `POST /api/v1/electronic-documents/from-order/{order_id}` |

---

## Prioridad

**Alta** — La generación de comprobantes desde pedidos es un flujo de negocio esencial para cumplir con las obligaciones tributarias (SUNAT). Los pedidos representan la mayoría de las transacciones que requieren facturación electrónica en un modelo B2B.

---

_Documento generado por el equipo de Frontend — Base4Empresas_
