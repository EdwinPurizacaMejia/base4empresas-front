# Referencia de Rutas y Navegación

**Última actualización:** 26 de mayo de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 📍 Mapa Completo de Rutas

```
BASE_URL: http://localhost:4200

/
└── dashboard
    └── Dashboard principal

/catalogos (FASE 1)
├── /productos
│   ├── Listado de productos
│   └── /:id → Detalle de producto
├── /categorias
│   └── (placeholder)
├── /unidades
│   └── (placeholder)
├── /almacenes
│   └── (placeholder)
├── /canales-venta
│   └── Listado de canales de venta
├── /clientes
│   └── Listado de clientes (validados)
└── /proveedores
    └── Listado de proveedores (validados)

/ventas (FASE 2-3)
├── /pedidos
│   ├── Listado de órdenes de venta
│   ├── /crear → Crear nueva orden
│   └── /:id → Detalle de orden (incluye pagos + envíos)
└── /pagos
    └── Listado de pagos

/inventario (FASE 2-4)
├── /stock
│   ├── Listado de stock actual
│   └── /:id → Detalle de stock
├── /kardex
│   └── Historial de movimientos
├── /ajustes
│   └── Registro de ajustes de stock
└── /transferencias
    └── Transferencias entre almacenes

/logistica (FASE 4)
└── /envios
    └── Gestión de envíos

/compras
└── /ordenes
    ├── Listado de órdenes de compra
    └── /:id → Detalle de orden

/config (FASE 5)
├── /costeo
│   └── Configuración de valuación
├── /auditoria
│   └── Historial de auditoría
└── /seguridad
    └── Gestión de roles y permisos
```

---

## 🔗 URLs Directas (Copy-Paste)

### Dashboard

```
http://localhost:4200/dashboard
```

### Catálogos

```
http://localhost:4200/catalogos/productos
http://localhost:4200/catalogos/categorias
http://localhost:4200/catalogos/clientes
http://localhost:4200/catalogos/proveedores
http://localhost:4200/catalogos/canales-venta
```

### Ventas

```
http://localhost:4200/ventas/pedidos
http://localhost:4200/ventas/pedidos/1234         (detalle)
http://localhost:4200/ventas/pedidos/crear         (crear nuevo)
http://localhost:4200/ventas/pagos
```

### Inventario

```
http://localhost:4200/inventario/stock
http://localhost:4200/inventario/stock/5678       (detalle)
http://localhost:4200/inventario/kardex
http://localhost:4200/inventario/ajustes
http://localhost:4200/inventario/transferencias
```

### Logística

```
http://localhost:4200/logistica/envios
```

### Compras

```
http://localhost:4200/compras/ordenes
http://localhost:4200/compras/ordenes/9999        (detalle)
```

### Configuración

```
http://localhost:4200/config/costeo
http://localhost:4200/config/auditoria
http://localhost:4200/config/seguridad
```

---

## 🎯 Navegación Programática (TS)

### En un componente, inyecta Router:

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

// Navegar a una ruta
this.router.navigate(['/catalogos/productos']);
this.router.navigate(['/ventas/pedidos', { id: 123 }]);
this.router.navigate(['/inventario/stock', 456]);
```

### Con parámetros query:

```typescript
this.router.navigate(["/catalogos/productos"], {
  queryParams: {
    search: "notebook",
    page: 2,
  },
});
// URL: /catalogos/productos?search=notebook&page=2
```

### Navegar y reemplazar historial:

```typescript
this.router.navigate(["/dashboard"], {
  replaceUrl: true,
});
```

---

## 🔀 Redirecciones Legacy (Compatibilidad)

Estas rutas antiguas siguen funcionando (redireccionan automáticamente):

```
/productos                 → /catalogos/productos
/clientes                  → /catalogos/clientes
/proveedores               → /catalogos/proveedores
/kardex                    → /inventario/kardex
/pedidos                   → /ventas/pedidos
/configuracion/costeo      → /config/costeo
```

---

## 🧭 Cómo Navegar Desde Plantillas

### Usando routerLink

```html
<!-- Navegación simple -->
<a routerLink="/catalogos/productos"> Ir a Productos </a>

<!-- Con parámetros -->
<a [routerLink]="['/ventas/pedidos', pedidoId]"> Ver Orden {{ pedidoId }} </a>

<!-- Con query params -->
<a [routerLink]="['/catalogos/productos']" [queryParams]="{ search: 'notebook', sort: 'precio' }"> Buscar notebooks </a>

<!-- Estilo activo -->
<a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"> Dashboard </a>
```

### En bucles/listas

```html
<button *ngFor="let product of products" [routerLink]="['/catalogos/productos', product.id]">{{ product.name }}</button>
```

---

## 📊 Matriz de Rutas - Componente Mapeo

| Ruta                         | Componente                   | Tipo                 | Fase |
| ---------------------------- | ---------------------------- | -------------------- | ---- |
| `/dashboard`                 | `DashboardComponent`         | Listado              | -    |
| `/catalogos/productos`       | `ProductsListComponent`      | Listado              | 1    |
| `/catalogos/productos/:id`   | `ProductDetailComponent`     | Detalle              | 1    |
| `/catalogos/clientes`        | `CustomersListComponent`     | Listado              | 1    |
| `/catalogos/proveedores`     | `SuppliersListComponent`     | Listado              | 1    |
| `/catalogos/canales-venta`   | `SalesChannelsListComponent` | Listado              | 1    |
| `/ventas/pedidos`            | `OrdersListComponent`        | Listado              | 2    |
| `/ventas/pedidos/crear`      | `OrderCreateComponent`       | Crear                | 2    |
| `/ventas/pedidos/:id`        | `OrderDetailComponent`       | Detalle+Pagos+Envíos | 2-4  |
| `/ventas/pagos`              | `OrdersListComponent`        | Listado              | 3    |
| `/inventario/stock`          | `StockListComponent`         | Listado              | 2-4  |
| `/inventario/stock/:id`      | `StockDetailComponent`       | Detalle              | 2-4  |
| `/inventario/kardex`         | `KardexComponent`            | Historial            | 2-4  |
| `/inventario/ajustes`        | `StockListComponent`         | Ajustes              | -    |
| `/inventario/transferencias` | `StockListComponent`         | Transfer             | -    |
| `/compras/ordenes`           | `PurchaseListComponent`      | Listado              | -    |
| `/compras/ordenes/:id`       | `PurchaseDetailComponent`    | Detalle              | -    |
| `/config/costeo`             | `CostingConfigComponent`     | Config               | 5    |
| `/config/auditoria`          | `CostingConfigComponent`     | Auditoría            | 5    |
| `/config/seguridad`          | `CostingConfigComponent`     | Seguridad            | 5    |

---

## 🔐 Rutas con Control de Acceso (Future)

```typescript
// En menu.model.ts:
{
  label: 'Admin Panel',
  route: '/config/seguridad',
  requiredRoles: ['ADMIN', 'SUPERADMIN']
}

// El componente MainMenuComponent puede filtrar
// items basado en permissionService.hasRole()
```

---

## 🚨 Validación de Rutas

### En tests:

```typescript
// Verificar que ruta existe en routing
const route = routes.find((r) => r.path === "catalogos");
expect(route).toBeDefined();

// Verificar que componente está mapeado
const productRoute = route.children?.find((r) => r.path === "productos");
expect(productRoute?.component).toBe(ProductsListComponent);
```

### Navegación segura en componentes:

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

navigarASinRiesgos(url: string): void {
  try {
    this.router.navigate([url]);
  } catch (error) {
    console.error('Error navegando a:', url, error);
    // Fallback a dashboard
    this.router.navigate(['/dashboard']);
  }
}
```

---

## 📱 Rutas Responsive

Todas las rutas funcionan en:

- ✅ Desktop (1024px+)
- ✅ Tablet (768px-1023px)
- ✅ Mobile (<768px)

**Nota:** En mobile, el menú solo muestra iconos (etiquetas ocultas por CSS).

---

## 🔄 Cambio de Rutas (Refactorización Histórica)

**Antes (Sin estructura):**

- `/productos` → Productos
- `/kardex` → Kardex
- `/pedidos` → Órdenes
- `/clientes` → Clientes
- etc. (disperso)

**Después (Organizado por dominio):**

- `/catalogos/productos` → Productos
- `/inventario/kardex` → Kardex
- `/ventas/pedidos` → Órdenes
- `/catalogos/clientes` → Clientes
- etc. (cohesivo)

**Compatibilidad:** Se mantienen redirecciones legacy automáticas.

---

## 📋 Tabla Rápida - Rutas Cortas

| Acceso Rápido  | Ruta                    |
| -------------- | ----------------------- |
| Dashboard      | `/dashboard`            |
| Productos      | `/catalogos/productos`  |
| Clientes       | `/catalogos/clientes`   |
| Pedidos        | `/ventas/pedidos`       |
| Crear Pedido   | `/ventas/pedidos/crear` |
| Stock          | `/inventario/stock`     |
| Kardex         | `/inventario/kardex`    |
| Envíos         | `/logistica/envios`     |
| Órdenes Compra | `/compras/ordenes`      |
| Config Costeo  | `/config/costeo`        |

---

## 🎮 Ejemplos de Navegación

### Desde un botón

```html
<button (click)="irAProductos()">Ver Productos</button>

<!-- En TS -->
irAProductos(): void { this.router.navigate(['/catalogos/productos']); }
```

### Desde una tabla de datos

```html
<tr *ngFor="let pedido of pedidos" (click)="verPedido(pedido.id)">
  <td>{{ pedido.numero }}</td>
</tr>

<!-- En TS -->
verPedido(id: string): void { this.router.navigate(['/ventas/pedidos', id]); }
```

### Con búsqueda

```html
<input [(ngModel)]="searchTerm" (keyup.enter)="buscar()" />

<!-- En TS -->
buscar(): void { this.router.navigate(['/catalogos/productos'], { queryParams: { search: this.searchTerm } }); }
```

---

## ✅ Checklist de Validación

- [x] Todas las rutas documentadas
- [x] Redirecciones legacy activas
- [x] Componentes mapeados correctamente
- [x] Tests de rutas pasando
- [x] Responsive en todos los breakpoints
- [x] Menu model sincronizado con rutas
- [ ] Testeo E2E en staging

---

**Versión:** 1.0  
**Última revisión:** 26 de mayo de 2026
