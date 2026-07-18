# 🔍 PROMPT: Verificar API de Shipments en Backend

**Para usar con Copilot en el proyecto Backend**

---

## 📋 Contexto

El frontend tiene configurado el menú "Logística/Envíos" que actualmente está usando incorrectamente el endpoint `/orders` (mismo que "Ventas/Pedidos"). Necesitamos verificar si existe la API correcta para shipments.

---

## ✉️ PROMPT PARA COPILOT BACKEND

```
Necesito verificar la existencia de la API para gestionar ENVÍOS (Shipments) en el backend.

Por favor, revisa y responde:

1. ¿Existe el endpoint GET /shipments en el backend?
   - Si existe, ¿qué router lo implementa?
   - ¿Qué filtros/parámetros acepta?
   - ¿Qué schema de respuesta usa?

2. ¿Existe el modelo Shipment en la base de datos?
   - ¿En qué archivo está definido? (ej: app/models/shipment.py)
   - ¿Qué campos tiene?
   - ¿Tiene relación con Order?

3. ¿Existen endpoints CRUD completos para shipments?
   - GET /shipments (listar)
   - GET /shipments/{id} (detalle)
   - POST /shipments (crear)
   - PUT /shipments/{id} (actualizar)
   - DELETE /shipments/{id} (eliminar)
   - PATCH /shipments/{id}/status (cambiar estado)

4. Si NO existe la API de shipments:
   - ¿Los shipments están integrados dentro de la API de Orders?
   - ¿Se manejan como sub-recurso de orders? (ej: /orders/{id}/shipment)
   - ¿Existe algún endpoint alternativo para gestionar envíos?

5. Revisa la documentación OpenAPI/Swagger en http://127.0.0.1:8000/docs
   - Busca endpoints relacionados con "shipment", "envío", "delivery", "logistics"
   - Lista todos los endpoints encontrados

Por favor, proporciona ejemplos de las respuestas JSON si los endpoints existen.
```

---

## 🔍 Verificación Manual Adicional

Si tienes acceso directo al backend, puedes verificar manualmente con estos comandos:

### 1. Verificar en OpenAPI Docs

```bash
# Abrir en navegador
http://127.0.0.1:8000/docs

# Buscar en la página: "shipment" o "envío"
```

### 2. Verificar endpoints con curl

```bash
# Intentar obtener shipments
curl -X GET 'http://127.0.0.1:8000/shipments' \
  -H 'Accept: application/json'

# Verificar rutas disponibles en FastAPI
curl -X GET 'http://127.0.0.1:8000/openapi.json' | grep -i shipment
```

### 3. Buscar en código del backend

```bash
# Buscar archivos relacionados con shipments
find . -type f -name "*shipment*"

# Buscar en routers
grep -r "shipments" app/routers/

# Buscar en modelos
grep -r "class Shipment" app/models/
```

---

## 📊 Respuestas Esperadas

### Si existe API completa de Shipments:

✅ **Acción**: Crear componente `ShipmentsListComponent` y servicio `ShipmentsService` en el frontend

### Si Shipments es sub-recurso de Orders:

⚠️ **Acción**: Modificar `OrderDetailComponent` para manejar envíos. Remover menú "Logística/Envíos" o hacer que filtre órdenes con envíos pendientes.

### Si NO existe API de Shipments:

❌ **Acción**:

- Opción A: Solicitar al backend implementar la API
- Opción B: Remover el menú "Logística/Envíos" del frontend
- Opción C: Documentar como feature pendiente (FASE 4)

---

## 📝 Información del Frontend

**Estado actual del frontend:**

- ✅ Modelo `Shipment` existe: `src/app/models/shipment.model.ts`
- ❌ Componente `ShipmentsListComponent`: NO existe
- ❌ Servicio `ShipmentsService`: NO existe
- ⚠️ Ruta `/logistica/envios`: Configurada pero usa `OrdersListComponent` (incorrecto)

**Tipos definidos en frontend:**

```typescript
export type ShippingMethod = "MOTORBIKE" | "COURIER_OLVA" | "COURIER_SHALOM" | "COURIER_OTHER" | "PICKUP_STORE";

export type ShipmentStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface Shipment {
  id: string;
  order_id: string;
  shipping_method: ShippingMethod;
  carrier_name?: string | null;
  tracking_number?: string | null;
  destination_address?: string | null;
  recipient_name: string;
  recipient_phone: string;
  status: ShipmentStatus;
  scheduled_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 🎯 Siguiente Paso

Una vez obtengas la respuesta del backend, compártela para decidir la mejor solución:

1. **Si existe `/shipments`** → Implementar componente y servicio completo
2. **Si es sub-recurso** → Ajustar rutas y componente existente
3. **Si no existe** → Documentar y remover o deshabilitar menú temporalmente

---

**Fecha**: 6 de mayo de 2026  
**Status**: ⏳ PENDIENTE DE VERIFICACIÓN BACKEND
