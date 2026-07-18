# Reorganización de Feature Modules - base4empresas Frontend

**Documento de Referencia:** PLAN_FRONTEND_FASES.md (punto 0.2)  
**Fecha:** 26 de mayo de 2026  
**Estado:** Propuesta de arquitectura listo para implementación

---

## 📋 ÍNDICE

1. [Análisis de Estructura Actual](#análisis-de-estructura-actual)
2. [Propuesta de Feature Modules](#propuesta-de-feature-modules)
3. [Estructura de Carpetas Sugerida](#estructura-de-carpetas-sugerida)
4. [Mapeo de Componentes y Servicios](#mapeo-de-componentes-y-servicios)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Configuración de Lazy Loading](#configuración-de-lazy-loading)
7. [Guía de Migración](#guía-de-migración)
8. [Consideraciones y Testing](#consideraciones-y-testing)

---

## 🔍 ANÁLISIS DE ESTRUCTURA ACTUAL

### Estructura Existente (Pre-Refactorización)

```
src/app/
├── components/           (Componentes sin organización por dominio)
│   ├── confirmation-dialog/
│   ├── costing-config/
│   ├── generic-data-table/
│   ├── kardex/
│   ├── product-detail/
│   ├── product-form/
│   ├── products-list/
│   ├── purchase-detail/
│   ├── purchase-form/
│   ├── purchase-list/
│   ├── sale-detail/
│   ├── sale-form/
│   ├── sale-list/
│   ├── shared/           (Componentes reutilizables)
│   ├── stock-detail/
│   └── stock-list/
│
├── services/             (Servicios sin organización por dominio)
│   ├── api-config.service.ts        ✅ GLOBAL
│   ├── categories.service.ts
│   ├── confirmation.service.ts      ✅ GLOBAL
│   ├── costing-config.service.ts
│   ├── inventory.service.ts
│   ├── kardex.service.ts
│   ├── notification.service.ts      ✅ GLOBAL
│   ├── products.service.ts
│   ├── purchase.service.ts
│   ├── sales.service.ts
│   ├── search.service.ts            ✅ GLOBAL
│   ├── stock.service.ts
│   ├── suppliers.service.ts
│   ├── units.service.ts
│   └── warehouse.service.ts
│
├── models/              (Modelos de datos - organizados por dominio ✅)
│   ├── costing-config.model.ts
│   ├── inventory.model.ts
│   ├── kardex.model.ts
│   ├── product.model.ts
│   ├── purchase.model.ts
│   ├── sale.model.ts
│   ├── stock.model.ts
│   └── warehouse.model.ts
│
├── pages/               (Layouts)
│   └── dashboard/
│
├── layout/              (Componentes de layout)
│   └── horizontal-layout/
│
├── interceptors/        (HTTP Interceptors)
│   └── api-error.interceptor.ts
│
├── app.routes.ts        (Routing plano - sin lazy loading)
└── app.config.ts        (Configuración de la app)
```

### Problemas Identificados

| Problema                           | Impacto                                    | Solución                                  |
| ---------------------------------- | ------------------------------------------ | ----------------------------------------- |
| **Componentes sin organización**   | Difícil localizar componentes relacionados | Agrupar en feature modules por dominio    |
| **Servicios mezclados**            | Difícil entender dependencias              | Organizar servicios dentro de sus módulos |
| **Routing plano**                  | Sin lazy loading, bundle grande            | Implementar lazy loading por módulo       |
| **Falta de escalabilidad**         | Difícil agregar nuevas fases               | Estructura modular facilitará expansión   |
| **Sin separación de dependencias** | Riesgos de acoplamiento circular           | Definir providers en módulos              |

---

## 🎯 PROPUESTA DE FEATURE MODULES

### Módulos Propuestos (Alineados con 5 Fases del Backend)

#### 1. **masters** (Catálogos/Maestros)

- **Responsabilidad:** Gestión de datos maestros/catálogos
- **Componentes:** Productos, Categorías, Unidades, Almacenes, Canales
- **Servicios:** ProductsService, CategoriesService, UnitsService, WarehouseService
- **Modelos:** product.model, warehouse.model
- **Rutas Hijas:**
  - `/masters/productos`
  - `/masters/categorias`
  - `/masters/unidades`
  - `/masters/almacenes`
  - `/masters/canales`

#### 2. **customers-suppliers** (Clientes y Proveedores - Fase 1)

- **Responsabilidad:** Gestión de clientes y proveedores validados
- **Componentes:** CustomersList, CustomerForm, SuppliersList, SupplierForm
- **Servicios:** CustomersService, SuppliersService
- **Modelos:** customer.model, supplier.model (por crear)
- **Rutas Hijas:**
  - `/customers-suppliers/clientes`
  - `/customers-suppliers/clientes/:id`
  - `/customers-suppliers/proveedores`
  - `/customers-suppliers/proveedores/:id`

#### 3. **inventory** (Inventario - Fase 4)

- **Responsabilidad:** Gestión de inventario, stock y kardex
- **Componentes:** StockList, StockDetail, KardexComponent
- **Servicios:** StockService, KardexService, InventoryService
- **Modelos:** stock.model, kardex.model, inventory.model
- **Rutas Hijas:**
  - `/inventory/stock`
  - `/inventory/stock/:id`
  - `/inventory/kardex`
  - `/inventory/valuacion`

#### 4. **purchasing** (Compras)

- **Responsabilidad:** Gestión de órdenes de compra
- **Componentes:** PurchaseList, PurchaseDetail, PurchaseForm
- **Servicios:** PurchaseService, SuppliersService
- **Modelos:** purchase.model
- **Rutas Hijas:**
  - `/purchasing/compras`
  - `/purchasing/compras/:id`
  - `/purchasing/compras/crear`

#### 5. **sales** (Ventas - Fases 2-3)

- **Responsabilidad:** Gestión de órdenes de venta, pagos, envíos
- **Componentes:** SaleList, SaleDetail, SaleForm, PaymentForm, ShipmentForm
- **Servicios:** SalesService, SalesChannelService
- **Modelos:** sale.model
- **Rutas Hijas:**
  - `/sales/ordenes`
  - `/sales/ordenes/:id`
  - `/sales/ordenes/:id/pagos`
  - `/sales/ordenes/:id/envios`

#### 6. **settings** (Configuración)

- **Responsabilidad:** Configuración global de la aplicación
- **Componentes:** CostingConfigComponent
- **Servicios:** CostingConfigService
- **Modelos:** costing-config.model
- **Rutas Hijas:**
  - `/settings/costeo`

#### 7. **shared** (NO es Feature Module - Librería de Componentes)

- **Responsabilidad:** Componentes, servicios y directivas reutilizables
- **Componentes:** ConfirmationDialog, GenericDataTable, etc.
- **Servicios:** NotificationService, ConfirmationService, ApiConfigService, SearchService
- **Ubicación:** `src/app/shared/` (no en lazy loading)
- **Importación:** CommonModule, FormsModule, MaterialModule

---

## 📁 ESTRUCTURA DE CARPETAS SUGERIDA

```
src/app/
├── shared/                      ⭐ NO Lazy-loaded (librería global)
│   ├── components/
│   │   ├── confirmation-dialog/
│   │   └── generic-data-table/
│   ├── services/
│   │   ├── api-config.service.ts
│   │   ├── notification.service.ts
│   │   ├── confirmation.service.ts
│   │   └── search.service.ts
│   └── shared.module.ts         (opcional, si necesitas re-exportar)
│
├── layout/                      ⭐ Global
│   └── horizontal-layout/
│
├── pages/                       ⭐ Global
│   └── dashboard/
│
├── interceptors/                ⭐ Global
│   └── api-error.interceptor.ts
│
├── models/                      ⭐ Datos compartidos (opcional mover a cada módulo)
│   ├── product.model.ts
│   ├── warehouse.model.ts
│   ├── stock.model.ts
│   └── ... (otros modelos)
│
├── features/                    ⭐ Feature Modules (lazy-loaded)
│   ├── masters/
│   │   ├── components/
│   │   │   ├── product-list/
│   │   │   ├── product-form/
│   │   │   ├── product-detail/
│   │   │   ├── category-list/       (nuevo)
│   │   │   ├── warehouse-list/      (nuevo)
│   │   │   ├── unit-list/           (nuevo)
│   │   │   └── sales-channel-list/  (nuevo - Fase 1)
│   │   ├── services/
│   │   │   ├── products.service.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── units.service.ts
│   │   │   └── warehouse.service.ts
│   │   ├── models/                  (opcional: modelos específicos del módulo)
│   │   │   ├── product.model.ts
│   │   │   └── warehouse.model.ts
│   │   ├── masters-routing.module.ts
│   │   └── masters.module.ts
│   │
│   ├── customers-suppliers/        (Fase 1)
│   │   ├── components/
│   │   │   ├── customer-list/       (nuevo)
│   │   │   ├── customer-form/       (nuevo)
│   │   │   ├── supplier-list/       (nuevo)
│   │   │   └── supplier-form/       (nuevo)
│   │   ├── services/
│   │   │   ├── customers.service.ts (nuevo)
│   │   │   └── suppliers.service.ts
│   │   ├── models/
│   │   │   ├── customer.model.ts    (nuevo)
│   │   │   └── supplier.model.ts    (nuevo)
│   │   ├── customers-suppliers-routing.module.ts
│   │   └── customers-suppliers.module.ts
│   │
│   ├── inventory/                   (Fase 4)
│   │   ├── components/
│   │   │   ├── stock-list/
│   │   │   ├── stock-detail/
│   │   │   ├── kardex/
│   │   │   └── inventory-valuation/  (nuevo)
│   │   ├── services/
│   │   │   ├── stock.service.ts
│   │   │   ├── kardex.service.ts
│   │   │   └── inventory.service.ts
│   │   ├── models/
│   │   │   ├── stock.model.ts
│   │   │   └── kardex.model.ts
│   │   ├── inventory-routing.module.ts
│   │   └── inventory.module.ts
│   │
│   ├── purchasing/
│   │   ├── components/
│   │   │   ├── purchase-list/
│   │   │   ├── purchase-detail/
│   │   │   └── purchase-form/
│   │   ├── services/
│   │   │   └── purchase.service.ts
│   │   ├── models/
│   │   │   └── purchase.model.ts
│   │   ├── purchasing-routing.module.ts
│   │   └── purchasing.module.ts
│   │
│   ├── sales/                       (Fases 2-3)
│   │   ├── components/
│   │   │   ├── sale-list/
│   │   │   ├── sale-detail/
│   │   │   ├── sale-form/
│   │   │   ├── payment-form/        (nuevo - Fase 3)
│   │   │   └── shipment-form/       (nuevo - Fase 3)
│   │   ├── services/
│   │   │   └── sales.service.ts
│   │   ├── models/
│   │   │   ├── sale.model.ts
│   │   │   ├── payment.model.ts     (nuevo)
│   │   │   └── shipment.model.ts    (nuevo)
│   │   ├── sales-routing.module.ts
│   │   └── sales.module.ts
│   │
│   └── settings/
│       ├── components/
│       │   └── costing-config/
│       ├── services/
│       │   └── costing-config.service.ts
│       ├── models/
│       │   └── costing-config.model.ts
│       ├── settings-routing.module.ts
│       └── settings.module.ts
│
├── app.routes.ts                ⭐ Routing actualizado con lazy loading
├── app.config.ts
└── app.component.ts
```

---

## 🗂️ MAPEO DE COMPONENTES Y SERVICIOS

### De Estructura Plana → Feature Modules

#### **MASTERS Module**

| Componente Actual | Nueva Ubicación                                   | Servicio            | Modelo             |
| ----------------- | ------------------------------------------------- | ------------------- | ------------------ |
| `products-list/`  | `features/masters/components/`                    | ProductsService     | product.model.ts   |
| `product-detail/` | `features/masters/components/`                    | ProductsService     | product.model.ts   |
| `product-form/`   | `features/masters/components/`                    | ProductsService     | product.model.ts   |
| _(nuevo)_         | `features/masters/components/category-list/`      | CategoriesService   | _(nuevo)_          |
| _(nuevo)_         | `features/masters/components/warehouse-list/`     | WarehouseService    | warehouse.model.ts |
| _(nuevo)_         | `features/masters/components/unit-list/`          | UnitsService        | _(nuevo)_          |
| _(nuevo)_         | `features/masters/components/sales-channel-list/` | SalesChannelService | _(nuevo)_          |

#### **INVENTORY Module**

| Componente      | Nueva Ubicación                                      | Servicio         | Modelo             |
| --------------- | ---------------------------------------------------- | ---------------- | ------------------ |
| `stock-list/`   | `features/inventory/components/`                     | StockService     | stock.model.ts     |
| `stock-detail/` | `features/inventory/components/`                     | StockService     | stock.model.ts     |
| `kardex/`       | `features/inventory/components/`                     | KardexService    | kardex.model.ts    |
| _(nuevo)_       | `features/inventory/components/inventory-valuation/` | InventoryService | inventory.model.ts |

#### **PURCHASING Module**

| Componente         | Nueva Ubicación                   | Servicio        | Modelo            |
| ------------------ | --------------------------------- | --------------- | ----------------- |
| `purchase-list/`   | `features/purchasing/components/` | PurchaseService | purchase.model.ts |
| `purchase-detail/` | `features/purchasing/components/` | PurchaseService | purchase.model.ts |
| `purchase-form/`   | `features/purchasing/components/` | PurchaseService | purchase.model.ts |

#### **SALES Module**

| Componente     | Nueva Ubicación                            | Servicio     | Modelo        |
| -------------- | ------------------------------------------ | ------------ | ------------- |
| `sale-list/`   | `features/sales/components/`               | SalesService | sale.model.ts |
| `sale-detail/` | `features/sales/components/`               | SalesService | sale.model.ts |
| `sale-form/`   | `features/sales/components/`               | SalesService | sale.model.ts |
| _(nuevo)_      | `features/sales/components/payment-form/`  | _(nuevo)_    | _(nuevo)_     |
| _(nuevo)_      | `features/sales/components/shipment-form/` | _(nuevo)_    | _(nuevo)_     |

#### **SETTINGS Module**

| Componente        | Nueva Ubicación                 | Servicio             | Modelo                  |
| ----------------- | ------------------------------- | -------------------- | ----------------------- |
| `costing-config/` | `features/settings/components/` | CostingConfigService | costing-config.model.ts |

#### **SHARED Library (No Lazy-loaded)**

| Componente             | Ubicación            | Propósito                         |
| ---------------------- | -------------------- | --------------------------------- |
| `confirmation-dialog/` | `shared/components/` | Diálogo reutilizable              |
| `generic-data-table/`  | `shared/components/` | Tabla genérica reutilizable       |
| NotificationService    | `shared/services/`   | Notificaciones globales           |
| ConfirmationService    | `shared/services/`   | Diálogos de confirmación          |
| ApiConfigService       | `shared/services/`   | Configuración de API centralizada |
| SearchService          | `shared/services/`   | Búsqueda global                   |

---

## 💻 EJEMPLOS DE CÓDIGO

### 1. Estructura Básica de un Feature Module

#### `masters.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

// Routing
import { MastersRoutingModule } from "./masters-routing.module";

// Componentes
import { ProductsListComponent } from "./components/product-list/product-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { ProductFormComponent } from "./components/product-form/product-form.component";
import { CategoriesListComponent } from "./components/category-list/category-list.component";
import { WarehousesListComponent } from "./components/warehouse-list/warehouse-list.component";
import { UnitsListComponent } from "./components/unit-list/unit-list.component";
import { SalesChannelsListComponent } from "./components/sales-channel-list/sales-channel-list.component";

// Servicios (Providers)
import { ProductsService } from "./services/products.service";
import { CategoriesService } from "./services/categories.service";
import { WarehouseService } from "./services/warehouse.service";
import { UnitsService } from "./services/units.service";

// Módulos compartidos
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [ProductsListComponent, ProductDetailComponent, ProductFormComponent, CategoriesListComponent, WarehousesListComponent, UnitsListComponent, SalesChannelsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    // Custom
    MastersRoutingModule,
    SharedModule,
  ],
  providers: [ProductsService, CategoriesService, WarehouseService, UnitsService],
})
export class MastersModule {}
```

#### `masters-routing.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// Componentes
import { ProductsListComponent } from "./components/product-list/product-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { CategoriesListComponent } from "./components/category-list/category-list.component";
import { WarehousesListComponent } from "./components/warehouse-list/warehouse-list.component";
import { UnitsListComponent } from "./components/unit-list/unit-list.component";
import { SalesChannelsListComponent } from "./components/sales-channel-list/sales-channel-list.component";

const routes: Routes = [
  {
    path: "productos",
    component: ProductsListComponent,
    data: { title: "Productos" },
  },
  {
    path: "productos/:id",
    component: ProductDetailComponent,
    data: { title: "Detalle de Producto" },
  },
  {
    path: "categorias",
    component: CategoriesListComponent,
    data: { title: "Categorías" },
  },
  {
    path: "almacenes",
    component: WarehousesListComponent,
    data: { title: "Almacenes" },
  },
  {
    path: "unidades",
    component: UnitsListComponent,
    data: { title: "Unidades de Medida" },
  },
  {
    path: "canales",
    component: SalesChannelsListComponent,
    data: { title: "Canales de Venta" },
  },
  {
    path: "",
    redirectTo: "productos",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MastersRoutingModule {}
```

### 2. Feature Module para Customers-Suppliers (Fase 1)

#### `customers-suppliers.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

// Routing
import { CustomersSuppliersRoutingModule } from "./customers-suppliers-routing.module";

// Componentes (por crear)
import { CustomersListComponent } from "./components/customers-list/customers-list.component";
import { CustomerFormComponent } from "./components/customer-form/customer-form.component";
import { CustomersDetailComponent } from "./components/customers-detail/customers-detail.component";
import { SuppliersListComponent } from "./components/suppliers-list/suppliers-list.component";
import { SupplierFormComponent } from "./components/supplier-form/supplier-form.component";

// Servicios
import { CustomersService } from "./services/customers.service";
import { SuppliersService } from "./services/suppliers.service";

// Shared
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [CustomersListComponent, CustomerFormComponent, CustomersDetailComponent, SuppliersListComponent, SupplierFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule, CustomersSuppliersRoutingModule, SharedModule],
  providers: [CustomersService, SuppliersService],
})
export class CustomersSuppliersModule {}
```

#### `customers-suppliers-routing.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CustomersListComponent } from "./components/customers-list/customers-list.component";
import { CustomersDetailComponent } from "./components/customers-detail/customers-detail.component";
import { SuppliersListComponent } from "./components/suppliers-list/suppliers-list.component";

const routes: Routes = [
  {
    path: "clientes",
    component: CustomersListComponent,
    data: { title: "Clientes" },
  },
  {
    path: "clientes/:id",
    component: CustomersDetailComponent,
    data: { title: "Detalle de Cliente" },
  },
  {
    path: "proveedores",
    component: SuppliersListComponent,
    data: { title: "Proveedores" },
  },
  {
    path: "",
    redirectTo: "clientes",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersSuppliersRoutingModule {}
```

### 3. Módulo Shared (Reutilizable - NO Lazy-loaded)

#### `shared/shared.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/common/forms";

// Material
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Componentes Shared
import { ConfirmationDialogComponent } from "./components/confirmation-dialog/confirmation-dialog.component";
import { GenericDataTableComponent } from "./components/generic-data-table/generic-data-table.component";

// Servicios Shared (ya con providedIn: 'root')
import { NotificationService } from "./services/notification.service";
import { ConfirmationService } from "./services/confirmation.service";
import { ApiConfigService } from "./services/api-config.service";
import { SearchService } from "./services/search.service";

@NgModule({
  declarations: [ConfirmationDialogComponent, GenericDataTableComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  exports: [
    // Re-exportar componentes
    ConfirmationDialogComponent,
    GenericDataTableComponent,
    // Re-exportar módulos comunes
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  providers: [NotificationService, ConfirmationService, ApiConfigService, SearchService],
})
export class SharedModule {}
```

---

## 🚀 CONFIGURACIÓN DE LAZY LOADING

### `app.routes.ts` Actualizado

```typescript
import { Routes } from "@angular/router";
import { HorizontalLayoutComponent } from "./layout/horizontal-layout/horizontal-layout.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";

/**
 * RUTAS PRINCIPALES CON LAZY LOADING
 *
 * - Feature modules se cargan bajo demanda (lazy loading)
 * - Dashboard y layout son eagerly loaded
 * - Cada módulo maneja su propio routing
 */
export const routes: Routes = [
  {
    path: "",
    component: HorizontalLayoutComponent,
    children: [
      // Dashboard (Eagerly loaded)
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        component: DashboardComponent,
        data: { title: "Dashboard" },
      },

      // Feature Modules (Lazy-loaded)

      // Masters (Catálogos)
      {
        path: "masters",
        loadChildren: () => import("./features/masters/masters.module").then((m) => m.MastersModule),
        data: { title: "Catálogos" },
      },

      // Customers & Suppliers (Fase 1)
      {
        path: "customers-suppliers",
        loadChildren: () => import("./features/customers-suppliers/customers-suppliers.module").then((m) => m.CustomersSuppliersModule),
        data: { title: "Clientes y Proveedores" },
      },

      // Inventory (Fase 4)
      {
        path: "inventory",
        loadChildren: () => import("./features/inventory/inventory.module").then((m) => m.InventoryModule),
        data: { title: "Inventario" },
      },

      // Purchasing
      {
        path: "purchasing",
        loadChildren: () => import("./features/purchasing/purchasing.module").then((m) => m.PurchasingModule),
        data: { title: "Compras" },
      },

      // Sales (Fases 2-3)
      {
        path: "sales",
        loadChildren: () => import("./features/sales/sales.module").then((m) => m.SalesModule),
        data: { title: "Ventas" },
      },

      // Settings
      {
        path: "settings",
        loadChildren: () => import("./features/settings/settings.module").then((m) => m.SettingsModule),
        data: { title: "Configuración" },
      },
    ],
  },

  // 404 - Not Found
  {
    path: "**",
    redirectTo: "dashboard",
  },
];
```

### Alternativa con `loadComponent()` (Angular 15+)

Si prefieres standalone components en lugar de NgModule:

```typescript
// app.routes.ts - Usando standalone components
export const routes: Routes = [
  {
    path: "",
    component: HorizontalLayoutComponent,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "masters",
        loadChildren: () => import("./features/masters/masters.routes").then((m) => m.MASTERS_ROUTES),
      },
      // ... más rutas
    ],
  },
];
```

Y en `features/masters/masters.routes.ts`:

```typescript
import { Routes } from "@angular/router";
import { ProductsListComponent } from "./components/product-list/product-list.component";

export const MASTERS_ROUTES: Routes = [
  {
    path: "productos",
    component: ProductsListComponent,
  },
  // ... más rutas
];
```

---

## 📋 GUÍA DE MIGRACIÓN

### Fase 1: Preparación

1. **Crear estructura de carpetas:**

   ```bash
   mkdir -p src/app/features/{masters,customers-suppliers,inventory,purchasing,sales,settings}
   mkdir -p src/app/shared/{components,services}

   for feature in masters customers-suppliers inventory purchasing sales settings; do
     mkdir -p src/app/features/$feature/{components,services,models}
   done
   ```

2. **Copiar archivos base:**
   - Crear `masters.module.ts` y `masters-routing.module.ts` en `src/app/features/masters/`
   - Repetir para otros módulos

### Fase 2: Mover Componentes

#### Ejemplo: Mover ProductsListComponent a masters module

**Antes (estructura plana):**

```
src/app/components/products-list/
├── products-list.component.ts
├── products-list.component.html
├── products-list.component.css
└── products-list.component.spec.ts
```

**Después (en feature module):**

```
src/app/features/masters/components/product-list/
├── product-list.component.ts
├── product-list.component.html
├── product-list.component.css
└── product-list.component.spec.ts
```

**Cambios en component.ts:**

```typescript
// Antes:
import { ProductsService } from "../../services/products.service";

// Después:
import { ProductsService } from "../../services/products.service";
// (ruta igual porque servicios están en el mismo módulo)
```

**Actualizar imports en module:**

```typescript
// En masters.module.ts
import { ProductsListComponent } from './components/product-list/product-list.component';

@NgModule({
  declarations: [ProductsListComponent],
  // ...
})
```

### Fase 3: Mover Servicios

**Antes:**

```typescript
// src/app/services/products.service.ts
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService { ... }
```

**Después:**

```typescript
// src/app/features/masters/services/products.service.ts
// Remover @Injectable({ providedIn: 'root' })
// porque el módulo lo proporciona

@Injectable()
export class ProductsService { ... }
```

**En masters.module.ts:**

```typescript
import { ProductsService } from './services/products.service';

@NgModule({
  // ...
  providers: [ProductsService], // ← Aquí se proporciona
})
```

### Fase 4: Actualizar Rutas

**Migrar de routing plano a lazy loading:**

```typescript
// app.routes.ts
// Antes:
const routes: Routes = [
  {
    path: "productos",
    component: ProductsListComponent,
  },
  {
    path: "productos/:id",
    component: ProductDetailComponent,
  },
];

// Después:
const routes: Routes = [
  {
    path: "masters",
    loadChildren: () => import("./features/masters/masters.module").then((m) => m.MastersModule),
  },
];

// Las rutas hijas están en masters-routing.module.ts
```

### Fase 5: Actualizar Importaciones en Componentes

**Ejemplo: Componente que usa ProductsService**

```typescript
// Antes:
import { Component } from "@angular/core";
import { ProductsService } from "../../services/products.service";
import { HorizontalLayoutComponent } from "../../layout/horizontal-layout/horizontal-layout.component";

// Después (dentro de masters module):
import { Component } from "@angular/core";
import { ProductsService } from "../../services/products.service";
import { HorizontalLayoutComponent } from "../../../layout/horizontal-layout/horizontal-layout.component";
// (layout sigue siendo global, por eso ../ extra)
```

---

## 🧪 CONSIDERACIONES Y TESTING

### Impacto en Tests Existentes

#### 1. Actualizar rutas en archivos `.spec.ts`

```typescript
// Antes:
import { ProductsService } from "../../services/products.service";

// Después:
import { ProductsService } from "../../services/products.service";
// (ruta actualizada según nueva estructura)
```

#### 2. Configurar TestBed correctamente

```typescript
describe("ProductsListComponent", () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsListComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        SharedModule, // ← Importante
      ],
      providers: [
        ProductsService, // ← Importante: proporcionar en test
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj("HttpClient", ["get", "post"]),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

#### 3. Ejecutar tests después de migración

```bash
# Tests de un módulo específico
ng test --include='src/app/features/masters/**/*.spec.ts'

# Todos los tests
ng test

# Coverage
ng test --code-coverage
```

### Checklist de Verificación

- [ ] Estructura de carpetas creada
- [ ] Módulos NgModule creados (masters, customers-suppliers, etc.)
- [ ] Componentes movidos a sus módulos
- [ ] Servicios reorganizados
- [ ] Rutas actualizadas en app.routes.ts (lazy loading)
- [ ] Imports actualizados en componentes
- [ ] Tests ejecutan sin errores
- [ ] Compilación sin errores: `ng build`
- [ ] Aplicación funciona en dev: `ng serve`
- [ ] Lazy loading funciona (verificar Network en DevTools)
- [ ] No hay circular dependencies

### Ventajas de la Nueva Estructura

| Ventaja                      | Impacto                                                  |
| ---------------------------- | -------------------------------------------------------- |
| **Organización por dominio** | Fácil localizar componentes relacionados                 |
| **Lazy loading**             | Bundle más pequeño, mejor performance                    |
| **Escalabilidad**            | Fácil agregar nuevas fases (Fase 2, 3, etc.)             |
| **Reutilización**            | Shared module con componentes comunes                    |
| **Mantenibilidad**           | Menos acoplamiento, dependencias claras                  |
| **Testing**                  | Tests más aislados por módulo                            |
| **Team collaboration**       | Diferentes equipos pueden trabajar en módulos diferentes |

---

## 📚 REFERENCIA RÁPIDA

### Crear un nuevo Feature Module

1. **Crear carpetas:**

   ```bash
   mkdir -p src/app/features/my-feature/{components,services,models}
   ```

2. **Crear módulo:**

   ```bash
   ng generate module features/my-feature/my-feature --routing
   ```

3. **Crear componentes:**

   ```bash
   ng generate component features/my-feature/components/my-component --module features/my-feature/my-feature
   ```

4. **Agregar a app.routes.ts:**
   ```typescript
   {
     path: 'my-feature',
     loadChildren: () =>
       import('./features/my-feature/my-feature.module').then(m => m.MyFeatureModule),
   }
   ```

### Importar SharedModule en Feature Modules

```typescript
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule],
  // ...
})
```

---

## 📞 SOPORTE Y PREGUNTAS

**¿Qué pasa con los servicios con `providedIn: 'root'`?**

- En feature modules, cambiar a `@Injectable()` y proporcionarlos en `providers: []`
- Servicios globales (NotificationService, etc.) pueden mantener `providedIn: 'root'` en shared

**¿Cómo testear feature modules lazy-loaded?**

- TestBed cargará el módulo automáticamente
- Asegurar que `SharedModule` esté importado en cada módulo

**¿Puedo mezclar NgModules con standalone components?**

- Sí, Angular 15+ lo permite. NgModules son recomendados para lazy loading.

---

## ✅ CONCLUSIÓN

Esta estructura propuesta:

- ✅ Alinea el frontend con las 5 fases del backend
- ✅ Implementa lazy loading para mejor performance
- ✅ Facilita escalabilidad y mantenimiento
- ✅ Respeta las convenciones de Angular
- ✅ Permite trabajo paralelo en módulos diferentes
- ✅ Preparada para las próximas fases (Fase 2-5)

**Próximo paso:** Comenzar implementación desde `masters` module, que es la base para otras fases.

---

**Documento generado:** 26 de mayo de 2026  
**Versión:** 1.0  
**Estado:** Listo para implementación
