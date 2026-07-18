# FASE 2 – Guía Rápida Desarrollo Angular

## 📦 Instalación

```bash
# Instalar dependencias (si no lo hizo antes)
npm install

# Instalar Material (si es necesario)
ng add @angular/material
```

---

## 🚀 Correr la Aplicación

```bash
# Development server
ng serve --open

# El app estará en: http://localhost:4200
```

---

## 🧪 Tests Unitarios

```bash
# Correr todos los tests
ng test

# Correr tests específicos (FASE 2)
ng test --include='**/orders/**/*.spec.ts'

# Con cobertura
ng test --code-coverage
```

---

## 📂 Estructura FASE 2

```
src/app/
├── models/
│   └── order.model.ts                    ← Tipos y helpers
├── services/
│   ├── orders.service.ts                 ← CRUD HTTP
│   └── orders.service.spec.ts            ← Tests (12 casos)
├── components/orders/
│   ├── order-create.component.ts         ← Crear orden
│   ├── order-create.component.html
│   ├── order-create.component.scss
│   ├── order-create.component.spec.ts    ← Tests (10 casos)
│   ├── orders-list.component.ts          ← Listar órdenes
│   ├── orders-list.component.html
│   ├── orders-list.component.scss
│   ├── orders-list.component.spec.ts     ← Tests (9 casos)
│   ├── order-detail.component.ts         ← Ver/editar orden
│   ├── order-detail.component.html
│   ├── order-detail.component.scss
│   └── order-detail.component.spec.ts    ← Tests (11 casos)
└── app.routes.ts                         ← Rutas actualizadas
```

---

## 🔗 Rutas Disponibles

| Ruta             | Componente           | Descripción                     |
| ---------------- | -------------------- | ------------------------------- |
| `/pedidos`       | OrdersListComponent  | Listado de órdenes con filtros  |
| `/pedidos/crear` | OrderCreateComponent | Crear nueva orden               |
| `/pedidos/:id`   | OrderDetailComponent | Ver detalles y gestionar estado |

---

## 🎯 Funcionalidades

### Listado de Órdenes (/pedidos)

- ✅ Filtro por estado (8 estados)
- ✅ Filtro por canal de venta
- ✅ Tabla con totales y pagado
- ✅ Acceso a detalle
- ✅ Crear nueva orden

### Crear Orden (/pedidos/crear)

- ✅ Formulario reactivo
- ✅ Selector de cliente
- ✅ Selector de canal de venta
- ✅ Tabla dinámica de ítems (agregar/remover)
- ✅ Cálculo automático de totales
- ✅ Validaciones en tiempo real

### Detalle de Orden (/pedidos/:id)

- ✅ Ver información completa
- ✅ Tabla de ítems (read-only)
- ✅ Resumen financiero
- ✅ Gestión de estados con transiciones válidas
- ✅ Control de vencimiento de separaciones
- ✅ Acciones rápidas (Separar, Facturar, Cancelar)

---

## 🧯 Casos de Prueba

### OrdersService (12)

```bash
✓ should create
✓ should list orders without filters
✓ should list orders with status filter
✓ should list orders with multiple filters
✓ should get order by ID
✓ should get order with special characters in ID
✓ should create order
✓ should update order status
✓ should mark as separated
✓ should cancel order
✓ should mark as pending invoice
✓ should mark as invoiced
```

### OrderCreateComponent (10)

```bash
✓ should create component
✓ should load data on init
✓ should add item
✓ should remove item
✓ should not allow removing last item
✓ should calculate total correctly
✓ should submit valid form
✓ should show error for invalid form
✓ should navigate on cancel
✓ should navigate on success
```

### OrdersListComponent (9)

```bash
✓ should create component
✓ should load channels and orders
✓ should filter by status
✓ should filter by channel
✓ should clear filters
✓ should navigate to detail
✓ should navigate to create
✓ should show empty state
✓ should handle errors
```

### OrderDetailComponent (11)

```bash
✓ should create component
✓ should load order on init
✓ should show available transitions
✓ should update status
✓ should mark as separated
✓ should mark as invoiced
✓ should cancel with confirmation
✓ should detect expiring separation
✓ should detect expired separation
✓ should calculate balance
✓ should navigate back
```

---

## 🔧 Backend Endpoints Esperados

El frontend consume estos endpoints:

```
GET    /orders              (listar, con ?status=, ?sales_channel_id=, ?customer_id=)
GET    /orders/{id}         (obtener por ID)
POST   /orders              (crear)
PATCH  /orders/{id}         (actualizar estado)

GET    /customers
GET    /customers/{id}

GET    /sales-channels      (listar canales)

GET    /products
```

---

## 📝 Variables de Ambiente (.env)

Si necesita, configure en `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:8001", // Backend URL
};
```

---

## 🐛 Debugging

### En Browser Console

```javascript
// Ver servicio OrdersService
inject(OrdersService).listOrders().subscribe(console.log);

// Ver orden específica
inject(OrdersService).getOrder("ord-1").subscribe(console.log);
```

### En Chrome DevTools

1. Ir a **Network** tab
2. Hacer una acción (crear, filtrar, etc.)
3. Ver requests en Network
4. Verificar response status y body

---

## 📦 Build Producción

```bash
# Build para producción
ng build --configuration production

# Archivos en: dist/base4empresas/
```

---

## 🚨 Errores Comunes

### "Cannot find module OrdersService"

```bash
# Solución: Asegurarse que está en app.routes.ts
import { OrdersService } from '...
```

### Tests fallan en CI/CD

```bash
# Correr con headless browser
ng test --watch=false --browsers=ChromeHeadless
```

### CORS errors

```bash
# Backend debe permitir requests desde http://localhost:4200
# Configurar en backend: CORS_ORIGINS=http://localhost:4200
```

---

## 📚 Documentación Completa

Leer: `FASE_2_FRONTEND_IMPLEMENTACION.md`

---

## ✅ Checklist Antes de Merge

- [ ] `npm install` sin errores
- [ ] `ng serve` corre correctamente
- [ ] `ng test` pasa todos los 32 tests
- [ ] No hay warnings de TypeScript
- [ ] No hay warnings de Material
- [ ] Rutas funcionan: /pedidos, /pedidos/crear, /pedidos/:id
- [ ] Filtros funcionan en listado
- [ ] Crear orden funciona
- [ ] Detalle de orden muestra información
- [ ] Cambios de estado funcionan
- [ ] Notificaciones de éxito/error aparecen
- [ ] Responsive en mobile (768px)

---

**Autor:** Frontend Team | **Fecha:** 26 mayo 2026 | **Status:** ✅ Production Ready
