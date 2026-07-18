# 🎨 Rediseño de Menú Frontend - Base4Empresas

**Fecha de Implementación**: 26 de mayo de 2026  
**Estado**: ✅ Estructura completa lista para integración  
**Versión Angular**: 14+

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura de Menú](#estructura-de-menú)
3. [Componentes Creados](#componentes-creados)
4. [Cómo Integrar](#cómo-integrar)
5. [Rutas por Dominio](#rutas-por-dominio)
6. [Testing](#testing)
7. [Próximos Pasos](#próximos-pasos)

---

## 📊 Resumen Ejecutivo

### ✨ Cambios Realizados

| Aspecto            | Antes                                          | Ahora                               |
| ------------------ | ---------------------------------------------- | ----------------------------------- |
| Estructura de menú | Flat, hardcodeado en componentes               | Jerárquico, centralizado en modelo  |
| Navegación         | Tabs simples: "Productos \| Compras \| Ventas" | Menú principal + submenús dinámicos |
| Organización       | Sin agrupación lógica                          | **6 dominios de negocio** + 5 fases |
| Control de acceso  | No implementado                                | Soporte para roles (ready)          |
| Escalabilidad      | Difícil de mantener                            | Fácil agregar nuevos items/rutas    |

### 🎯 Beneficios

✅ **UX Mejorada**: Menú más intuativo y profesional  
✅ **Mantenibilidad**: Fuente única de verdad (MAIN_MENU)  
✅ **Escalabilidad**: Agregar rutas es trivial  
✅ **Testing**: Tests unitarios incluidos  
✅ **Performance**: ChangeDetectionStrategy.OnPush  
✅ **Alineación**: Perfectamente alineado con 5 fases backend

---

## 🗂️ Estructura de Menú

```
📊 Dashboard
├── 📚 CATÁLOGOS (FASE 1)
│   ├── 📦 Productos
│   ├── 🏷️ Categorías
│   ├── ⚖️ Unidades
│   ├── 🏢 Almacenes
│   ├── 🛒 Canales de venta
│   ├── 👥 Clientes (Validados RENIEC)
│   └── 🚚 Proveedores (Validados SUNAT)
│
├── 💰 VENTAS (FASE 2-3)
│   ├── 📋 Pedidos (Órdenes, estados, separaciones)
│   └── 💳 Pagos (Validación, métodos YAPE/TRANSFER)
│
├── 📦 INVENTARIO (FASE 2-4)
│   ├── 📊 Stock actual
│   ├── 📝 Kardex
│   ├── ⚙️ Ajustes de stock
│   └── ↔️ Transferencias
│
├── 🚚 LOGÍSTICA (FASE 4)
│   └── 📮 Envíos (Tracking, OLVA, Shalom, etc.)
│
├── 🛍️ COMPRAS
│   └── 📦 Órdenes de compra
│
└── ⚙️ CONFIGURACIÓN (FASE 5)
    ├── 📋 Auditoría (Historial de actividades)
    ├── 🔒 Seguridad (Roles, permisos, 2FA)
    └── 💹 Configuración de costeo
```

---

## 🔧 Componentes Creados

### 1. **Modelo de Menú** (`src/app/models/menu.model.ts`)

```typescript
export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  requiredRoles?: string[];
  disabled?: boolean;
  tooltip?: string;
}

export const MAIN_MENU: MenuItem[] = [...]
```

**Características**:

- ✅ Tipado fuerte (TypeScript)
- ✅ Soporte para submenús anidados
- ✅ Control de roles/permisos
- ✅ Iconos emoji (escalable)
- ✅ Tooltips descriptivos

### 2. **Componente MainMenuComponent** (`src/app/layout/main-menu.component.ts`)

**Característica principales**:

- ✅ Standalone component (Angular 14+)
- ✅ OnPush strategy para performance
- ✅ Dos niveles de navegación:
  - **Nivel 1**: Items principales (Dashboard, Catálogos, etc.)
  - **Nivel 2**: Submenús dinámicos según selección
- ✅ Integración con Angular Router (`routerLink`, `routerLinkActive`)
- ✅ Estilos modernos con Tailwind + Custom CSS
- ✅ Responsive para mobile (oculta labels, solo iconos)
- ✅ Estado activo automático basado en ruta actual

**Template**:

```html
<!-- Menú Principal (Nivel 1) -->
<nav class="main-menu">
  <a *ngFor="let item of mainMenu" [routerLink]="item.route" routerLinkActive="active" (click)="selectMenuItem(item)">
    <span class="menu-icon">{{ item.icon }}</span>
    <span class="menu-label">{{ item.label }}</span>
  </a>
</nav>

<!-- Submenú Dinámico (Nivel 2) -->
<nav class="sub-menu" *ngIf="activeParent?.children?.length">
  <a *ngFor="let child of activeParent.children" [routerLink]="child.route" routerLinkActive="active"> {{ child.label }} </a>
</nav>
```

### 3. **Tests Unitarios** (`src/app/layout/main-menu.component.spec.ts`)

**Cobertura**:

| Test Suite             | Casos | Objetivo                                         |
| ---------------------- | ----- | ------------------------------------------------ |
| Menu Model - MAIN_MENU | 9     | Validar estructura, items, children, rutas       |
| Renderizado            | 5     | Verificar que DOM es correcto                    |
| Submenú                | 4     | Renderizado dinámico de submenús                 |
| Interacción            | 3     | Navegación, cambios de ruta, evento activeParent |
| Ciclo de vida          | 1     | Cleanup en ngOnDestroy                           |
| Estilos                | 2     | Clases active, iconos renderizados               |

**Ejecución**:

```bash
ng test --include='**/main-menu.component.spec.ts'
```

---

## 🔌 Cómo Integrar

### Paso 1: Actualizar `app.routes.ts`

**Reorganizar rutas por dominio**:

```typescript
export const routes: Routes = [
  {
    path: "",
    component: MainLayoutComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },

      // Dashboard
      { path: "dashboard", component: DashboardComponent },

      // ========== CATÁLOGOS (FASE 1) ==========
      {
        path: "catalogos",
        children: [
          { path: "productos", component: ProductsListComponent },
          { path: "productos/:id", component: ProductDetailComponent },
          { path: "categorias", component: CategoriesComponent },
          { path: "canales-venta", component: SalesChannelsListComponent },
          { path: "clientes", component: CustomersListComponent },
          { path: "proveedores", component: SuppliersListComponent },
        ],
      },

      // ========== VENTAS (FASE 2-3) ==========
      {
        path: "ventas",
        children: [
          { path: "pedidos", component: OrdersListComponent },
          { path: "pedidos/crear", component: OrderCreateComponent },
          { path: "pedidos/:id", component: OrderDetailComponent },
          { path: "pagos", component: PaymentsListComponent },
        ],
      },

      // ========== INVENTARIO (FASE 2-4) ==========
      {
        path: "inventario",
        children: [
          { path: "stock", component: StockListComponent },
          { path: "kardex", component: KardexComponent },
          { path: "ajustes", component: StockAdjustmentsComponent },
          { path: "transferencias", component: TransfersComponent },
        ],
      },

      // ========== LOGÍSTICA (FASE 4) ==========
      {
        path: "logistica",
        children: [
          { path: "envios", component: ShipmentsListComponent },
          { path: "envios/:id", component: ShipmentDetailComponent },
        ],
      },

      // ========== COMPRAS ==========
      {
        path: "compras",
        children: [
          { path: "ordenes", component: PurchaseListComponent },
          { path: "ordenes/:id", component: PurchaseDetailComponent },
        ],
      },

      // ========== CONFIGURACIÓN (FASE 5) ==========
      {
        path: "config",
        children: [
          { path: "auditoria", component: AuditHistoryComponent },
          { path: "seguridad", component: SecuritySettingsComponent },
          { path: "costeo", component: CostingConfigComponent },
        ],
      },
    ],
  },
];
```

### Paso 2: Actualizar Layout Principal

En `src/app/layout/layout.component.ts` o el layout que uses:

```typescript
import { MainMenuComponent } from "./main-menu.component";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [CommonModule, MainMenuComponent, RouterModule],
  template: `
    <div class="app-layout">
      <app-toolbar></app-toolbar>
      <app-main-menu></app-main-menu>
      <!-- ← NUEVO -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class LayoutComponent {}
```

### Paso 3: Crear Componentes Faltantes

Si aún no existen, crear componentes placeholder:

```bash
# Catálogos
ng generate component pages/categorias --skip-tests
ng generate component pages/unidades --skip-tests

# Inventario
ng generate component pages/stock-adjustments --skip-tests
ng generate component pages/transfers --skip-tests

# Logística
ng generate component pages/shipments-list --skip-tests
ng generate component pages/shipment-detail --skip-tests

# Config
ng generate component pages/audit-history --skip-tests
ng generate component pages/security-settings --skip-tests
```

### Paso 4: Inyectar PermissionService

Asegurarse de que `PermissionService` esté disponible:

```typescript
// Si no existe, crear: src/app/services/permission.service.ts
@Injectable({ providedIn: "root" })
export class PermissionService {
  hasPermission(permission: string): boolean {
    // Implementar lógica de permisos
    return true; // Por ahora, retornar true
  }

  hasRole(role: string): boolean {
    // Implementar lógica de roles
    return true; // Por ahora, retornar true
  }
}
```

---

## 🛣️ Rutas por Dominio

### Referencia Rápida de Rutas

```
/dashboard                              Dashboard principal

/catalogos/productos                    ABM de productos
/catalogos/productos/:id                Detalle de producto
/catalogos/categorias                   Gestión de categorías
/catalogos/unidades                     Gestión de unidades
/catalogos/almacenes                    Gestión de almacenes
/catalogos/canales-venta                Canales de venta (FASE 1)
/catalogos/clientes                     Clientes (FASE 1)
/catalogos/proveedores                  Proveedores (FASE 1)

/ventas/pedidos                         Lista de pedidos (FASE 2)
/ventas/pedidos/crear                   Crear pedido (FASE 2)
/ventas/pedidos/:id                     Detalle de pedido (FASE 2)
/ventas/pagos                           Lista de pagos (FASE 3)

/inventario/stock                       Stock actual (FASE 2-4)
/inventario/kardex                      Kardex de movimientos
/inventario/ajustes                     Ajustes de stock
/inventario/transferencias              Transferencias entre almacenes

/logistica/envios                       Lista de envíos (FASE 4)
/logistica/envios/:id                   Detalle de envío (FASE 4)

/compras/ordenes                        Órdenes de compra
/compras/ordenes/:id                    Detalle de orden

/config/auditoria                       Historial de auditoría (FASE 5)
/config/seguridad                       Gestión de seguridad/roles (FASE 5)
/config/costeo                          Configuración de costeo
```

---

## ✅ Testing

### Ejecutar Tests

```bash
# Tests del menú
ng test --include='**/main-menu.component.spec.ts'

# Todos los tests
ng test

# Coverage
ng test --code-coverage --include='**/main-menu.component.spec.ts'
```

### Casos de Prueba Clave

✅ Estructura de MAIN_MENU es válida  
✅ Items principales se renderizan  
✅ Submenús dinámicos según selección  
✅ routerLink apunta a rutas correctas  
✅ Clase "active" aplicada correctamente  
✅ Responsive works (mobile vs desktop)

---

## 🚀 Próximos Pasos

### Fase 1: Integración (Día 1)

- [ ] Actualizar `app.routes.ts` con nueva estructura
- [ ] Integrar `MainMenuComponent` en layout
- [ ] Crear componentes faltantes
- [ ] Ejecutar tests (debe pasar 100%)
- [ ] Validar navegación en navegador

### Fase 2: Polish (Día 2)

- [ ] Ajustar estilos según brand
- [ ] Agregar animations/transitions
- [ ] Test en mobile/tablet
- [ ] Agregar breadcrumbs (opcional)

### Fase 3: Features Avanzadas (Futuro)

- [ ] Implementar control de roles (`requiredRoles`)
- [ ] Agregar indicadores de notificación (badges)
- [ ] Collapsible/expandable items
- [ ] Search global en menú
- [ ] Recent items / favoritos

---

## 📁 Estructura de Archivos

```
src/app/
├── layout/
│   ├── main-menu.component.ts          ← NUEVO: Componente de menú
│   ├── main-menu.component.spec.ts     ← NUEVO: Tests del menú
│   ├── layout.component.ts             ← ACTUALIZAR: Integrar menú
│   └── ...otros componentes layout
│
├── models/
│   └── menu.model.ts                   ← NUEVO: Modelo MenuItem + MAIN_MENU
│
├── services/
│   └── permission.service.ts           ← Usar para control de acceso
│
└── app.routes.ts                       ← ACTUALIZAR: Reorganizar rutas
```

---

## 🎨 Personalización

### Cambiar Colores

En `main-menu.component.ts`, modificar estilos CSS:

```scss
// Colores actuales: Tailwind indigo/blue
background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
border-bottom: 3px solid #3b82f6;
color: #93c5fd;

// Cambiar a tu brand (ej. verde):
background: linear-gradient(90deg, #064e3b 0%, #022c22 100%);
border-bottom: 3px solid #10b981;
color: #6ee7b7;
```

### Agregar Nuevos Items

En `menu.model.ts`, solo agregar a `MAIN_MENU`:

```typescript
{
  label: 'Mi Nuevo Módulo',
  icon: '✨',
  children: [
    { label: 'Opción 1', route: '/nuevo/opcion1' },
    { label: 'Opción 2', route: '/nuevo/opcion2' },
  ]
}
```

---

## 📚 Referencias

- **Angular Router**: https://angular.io/guide/router
- **OnPush Strategy**: https://angular.io/guide/change-detection#default-and-onpush-strategies
- **Standalone Components**: https://angular.io/guide/standalone-components
- **Testing Guide**: https://angular.io/guide/testing

---

**Estado**: ✅ LISTO PARA IMPLEMENTACIÓN  
**Fecha Última Actualización**: 26 de mayo de 2026  
**Versión**: 1.0.0
