# Guía de Implementación Paso a Paso: Masters Module

**Objetivo:** Refactorizar el módulo `masters` (productos, categorías, unidades, almacenes) con la nueva estructura de feature modules  
**Fecha:** 26 de mayo de 2026  
**Complejidad:** Media  
**Tiempo estimado:** 2-3 horas

---

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [Paso 1: Preparar Estructura de Carpetas](#paso-1-preparar-estructura-de-carpetas)
3. [Paso 2: Crear Servicios en el Módulo](#paso-2-crear-servicios-en-el-módulo)
4. [Paso 3: Crear Módulos NgModule](#paso-3-crear-módulos-ngmodule)
5. [Paso 4: Mover Componentes](#paso-4-mover-componentes)
6. [Paso 5: Actualizar Rutas](#paso-5-actualizar-rutas)
7. [Paso 6: Verificar y Testear](#paso-6-verificar-y-testear)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 VISIÓN GENERAL

### Estado Actual (Estructura Plana)

```
src/app/
├── components/
│   ├── products-list/
│   ├── product-detail/
│   ├── product-form/
│   └── ...
├── services/
│   ├── products.service.ts
│   ├── categories.service.ts
│   ├── units.service.ts
│   └── warehouse.service.ts
└── app.routes.ts (routing plano)
```

### Estado Final (Modularizado)

```
src/app/
├── features/
│   └── masters/
│       ├── components/
│       │   ├── product-list/
│       │   ├── product-detail/
│       │   ├── product-form/
│       │   ├── category-list/
│       │   ├── warehouse-list/
│       │   └── unit-list/
│       ├── services/
│       │   ├── products.service.ts
│       │   ├── categories.service.ts
│       │   ├── units.service.ts
│       │   └── warehouse.service.ts
│       ├── models/
│       │   ├── product.model.ts
│       │   └── warehouse.model.ts
│       ├── masters.module.ts
│       └── masters-routing.module.ts
└── app.routes.ts (lazy loading)
```

---

## 🔧 PASO 1: PREPARAR ESTRUCTURA DE CARPETAS

### Opción A: Usando comandos bash

```bash
# Crear estructura base
mkdir -p src/app/features/masters/{components,services,models}

# Crear subcarpetas para cada componente
mkdir -p src/app/features/masters/components/{product-list,product-detail,product-form}
mkdir -p src/app/features/masters/components/{category-list,warehouse-list,unit-list}

# Verificar estructura
tree src/app/features/masters/
```

### Opción B: Manual en VS Code

1. En VS Code, click derecho en `src/app/`
2. "New Folder" → `features`
3. Dentro de `features`, "New Folder" → `masters`
4. Crear subcarpetas: `components`, `services`, `models`

### Estructura Creada

```
src/app/features/masters/
├── components/
│   ├── product-list/
│   ├── product-detail/
│   ├── product-form/
│   ├── category-list/
│   ├── warehouse-list/
│   └── unit-list/
├── services/
├── models/
├── masters.module.ts           (⭐ crear)
└── masters-routing.module.ts   (⭐ crear)
```

---

## 📦 PASO 2: CREAR SERVICIOS EN EL MÓDULO

### 2.1 Copiar Servicios Existentes

**Origen:** `src/app/services/products.service.ts`  
**Destino:** `src/app/features/masters/services/products.service.ts`

**Hacer lo mismo para:**

- `categories.service.ts`
- `units.service.ts`
- `warehouse.service.ts`

### 2.2 Actualizar Servicios (remover providedIn: 'root')

**Antes:**

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiConfigService } from "../../services/api-config.service";

@Injectable({
  providedIn: "root", // ❌ REMOVER esto
})
export class ProductsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.apiUrl = this.apiConfig.buildUrl("/products");
  }

  // ... métodos
}
```

**Después:**

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiConfigService } from "../../../shared/services/api-config.service";
// ↑ Ruta actualizada a shared

@Injectable() // ✅ Sin providedIn
export class ProductsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.apiUrl = this.apiConfig.buildUrl("/products");
  }

  // ... métodos
}
```

### 2.3 Crear/Copiar Modelos

**Origen:** `src/app/models/product.model.ts`  
**Destino:** `src/app/features/masters/models/product.model.ts`

**Hacer lo mismo para:**

- `warehouse.model.ts`

**Actualizar imports en servicios:**

```typescript
// Antes:
import { Product } from "../../models/product.model";

// Después:
import { Product } from "../models/product.model";
```

---

## 🏗️ PASO 3: CREAR MÓDULOS NGMODULE

### 3.1 Crear `masters.module.ts`

**Archivo:** `src/app/features/masters/masters.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Material Modules
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTabsModule } from "@angular/material/tabs";

// Routing
import { MastersRoutingModule } from "./masters-routing.module";

// Componentes
import { ProductsListComponent } from "./components/product-list/product-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { ProductFormComponent } from "./components/product-form/product-form.component";
import { CategoriesListComponent } from "./components/category-list/category-list.component";
import { WarehousesListComponent } from "./components/warehouse-list/warehouse-list.component";
import { UnitsListComponent } from "./components/unit-list/unit-list.component";

// Servicios
import { ProductsService } from "./services/products.service";
import { CategoriesService } from "./services/categories.service";
import { WarehouseService } from "./services/warehouse.service";
import { UnitsService } from "./services/units.service";

// Shared
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [ProductsListComponent, ProductDetailComponent, ProductFormComponent, CategoriesListComponent, WarehousesListComponent, UnitsListComponent],
  imports: [
    // Angular
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
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule,

    // Routing
    MastersRoutingModule,

    // Shared
    SharedModule,
  ],
  providers: [
    // Aquí van los servicios específicos del módulo
    // NO usar providedIn: 'root' en los servicios
    ProductsService,
    CategoriesService,
    WarehouseService,
    UnitsService,
  ],
})
export class MastersModule {}
```

### 3.2 Crear `masters-routing.module.ts`

**Archivo:** `src/app/features/masters/masters-routing.module.ts`

```typescript
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// Componentes
import { ProductsListComponent } from "./components/product-list/product-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { CategoriesListComponent } from "./components/category-list/category-list.component";
import { WarehousesListComponent } from "./components/warehouse-list/warehouse-list.component";
import { UnitsListComponent } from "./components/unit-list/unit-list.component";

const routes: Routes = [
  // Ruta por defecto -> productos
  {
    path: "",
    redirectTo: "productos",
    pathMatch: "full",
  },

  // Productos
  {
    path: "productos",
    component: ProductsListComponent,
    data: { title: "Gestión de Productos" },
  },
  {
    path: "productos/:id",
    component: ProductDetailComponent,
    data: { title: "Detalle de Producto" },
  },

  // Categorías (nuevo)
  {
    path: "categorias",
    component: CategoriesListComponent,
    data: { title: "Gestión de Categorías" },
  },

  // Almacenes (nuevo)
  {
    path: "almacenes",
    component: WarehousesListComponent,
    data: { title: "Gestión de Almacenes" },
  },

  // Unidades de Medida (nuevo)
  {
    path: "unidades",
    component: UnitsListComponent,
    data: { title: "Unidades de Medida" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MastersRoutingModule {}
```

---

## 🚚 PASO 4: MOVER COMPONENTES

### 4.1 ProductsListComponent

**Fuente Original:** `src/app/components/products-list/`  
**Nuevo Destino:** `src/app/features/masters/components/product-list/`

**Pasos:**

1. Copiar carpeta `products-list/` completa
2. Renombrar a `product-list/` (singular)
3. Actualizar imports en el `.component.ts`

**Actualizar imports en component.ts:**

```typescript
// Antes:
import { ProductsService } from "../../services/products.service";
import { Product } from "../../models/product.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

// Después:
import { ProductsService } from "../../services/products.service";
import { Product } from "../../models/product.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
// ↑ Actualizar ruta a shared
```

### 4.2 ProductDetailComponent

**Fuente Original:** `src/app/components/product-detail/`  
**Nuevo Destino:** `src/app/features/masters/components/product-detail/`

**Similar a ProductsListComponent, actualizar imports.**

### 4.3 ProductFormComponent

**Fuente Original:** `src/app/components/product-form/`  
**Nuevo Destino:** `src/app/features/masters/components/product-form/`

### 4.4 Crear Nuevos Componentes

Crear los componentes nuevos que aún no existen:

```bash
# En VS Code Terminal o bash
cd src/app/features/masters/components

# Crear categoría list
ng generate component category-list --skip-tests

# Crear warehouse list
ng generate component warehouse-list --skip-tests

# Crear unit list
ng generate component unit-list --skip-tests
```

O manualmente: crear carpetas y archivos básicos

#### `category-list.component.ts` (ejemplo):

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { CategoriesService } from "../../services/categories.service";
import { NotificationService } from "../../../../shared/services/notification.service";

@Component({
  selector: "app-category-list",
  standalone: false, // ← Si es NgModule-based
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.css"],
})
export class CategoriesListComponent implements OnInit {
  categories: any[] = [];
  displayedColumns: string[] = ["id", "name", "actions"];
  isLoading = false;

  constructor(
    private categoriesService: CategoriesService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoriesService.listCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.error("Error al cargar categorías");
        this.isLoading = false;
      },
    });
  }

  deleteCategory(id: number): void {
    if (confirm("¿Confirma eliminación?")) {
      this.categoriesService.deleteCategory(id).subscribe({
        next: () => {
          this.notificationService.success("Categoría eliminada");
          this.loadCategories();
        },
        error: () => this.notificationService.error("Error al eliminar"),
      });
    }
  }
}
```

#### `category-list.component.html` (ejemplo):

```html
<div class="container">
  <h1>Gestión de Categorías</h1>

  <button mat-raised-button color="primary" (click)="openForm()">
    <mat-icon>add</mat-icon>
    Nueva Categoría
  </button>

  <table mat-table [dataSource]="categories" class="mat-elevation-z8">
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef>ID</th>
      <td mat-cell *matCellDef="let element">{{ element.id }}</td>
    </ng-container>

    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Nombre</th>
      <td mat-cell *matCellDef="let element">{{ element.name }}</td>
    </ng-container>

    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Acciones</th>
      <td mat-cell *matCellDef="let element">
        <button mat-icon-button (click)="editCategory(element.id)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="deleteCategory(element.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>
</div>
```

---

## 🛣️ PASO 5: ACTUALIZAR RUTAS

### 5.1 Actualizar `app.routes.ts`

**Ubicación:** `src/app/app.routes.ts`

**Antes (routing plano):**

```typescript
import { Routes } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { ProductsListComponent } from "./components/products-list/products-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { StockListComponent } from "./components/stock-list/stock-list.component";
// ... más imports

export const routes: Routes = [
  {
    path: "",
    component: HorizontalLayoutComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: DashboardComponent },
      { path: "productos", component: ProductsListComponent },
      { path: "productos/:id", component: ProductDetailComponent },
      { path: "inventario", component: StockListComponent },
      // ... más rutas individuales
    ],
  },
];
```

**Después (con lazy loading):**

```typescript
import { Routes } from "@angular/router";
import { HorizontalLayoutComponent } from "./layout/horizontal-layout/horizontal-layout.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";

export const routes: Routes = [
  {
    path: "",
    component: HorizontalLayoutComponent,
    children: [
      // Redirect inicial
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },

      // Dashboard (Eagerly loaded)
      {
        path: "dashboard",
        component: DashboardComponent,
        data: { title: "Dashboard" },
      },

      // Feature Modules (Lazy-loaded) ⭐⭐⭐

      // Masters Module
      {
        path: "masters",
        loadChildren: () => import("./features/masters/masters.module").then((m) => m.MastersModule),
        data: { title: "Catálogos" },
      },

      // Inventory Module
      {
        path: "inventory",
        loadChildren: () => import("./features/inventory/inventory.module").then((m) => m.InventoryModule),
        data: { title: "Inventario" },
      },

      // Purchasing Module
      {
        path: "purchasing",
        loadChildren: () => import("./features/purchasing/purchasing.module").then((m) => m.PurchasingModule),
        data: { title: "Compras" },
      },

      // Sales Module
      {
        path: "sales",
        loadChildren: () => import("./features/sales/sales.module").then((m) => m.SalesModule),
        data: { title: "Ventas" },
      },

      // Settings Module
      {
        path: "settings",
        loadChildren: () => import("./features/settings/settings.module").then((m) => m.SettingsModule),
        data: { title: "Configuración" },
      },
    ],
  },

  // Ruta wildcard
  {
    path: "**",
    redirectTo: "dashboard",
  },
];
```

### 5.2 Actualizar Navegación (si aplica)

Si tienes un componente de navegación/menú, actualizar rutas:

```typescript
// Antes:
{ label: 'Productos', route: '/productos' }

// Después:
{ label: 'Productos', route: '/masters/productos' }
{ label: 'Almacenes', route: '/masters/almacenes' }
{ label: 'Categorías', route: '/masters/categorias' }
{ label: 'Unidades', route: '/masters/unidades' }
```

---

## ✅ PASO 6: VERIFICAR Y TESTEAR

### 6.1 Verificar Compilación

```bash
# Limpiar y recompilar
ng build

# Si hay errores, mostrar con detalle
ng build --verbose
```

### 6.2 Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
ng serve

# Abrir en navegador
# http://localhost:4200/dashboard
# http://localhost:4200/masters/productos
# http://localhost:4200/masters/almacenes
```

### 6.3 Verificar Lazy Loading

1. Abrir DevTools (F12)
2. Ir a "Network" tab
3. Recargar página
4. Navegar a `/masters/productos`
5. Deberías ver que se descarga un chunk separado (ej: `main.js`, `masters.js`)

**Esperado:**

- Dashboard carga inmediatamente
- Masters module carga solo cuando navegas a `/masters`

### 6.4 Ejecutar Tests

```bash
# Tests de todo
ng test

# Tests de un módulo específico
ng test --include='src/app/features/masters/**/*.spec.ts'

# Con coverage
ng test --code-coverage
```

### 6.5 Verificar Imports Correctos

Buscar imports incorrectos:

```bash
# Buscar imports de servicios en ubicaciones antiguas
grep -r "from '../../services/" src/app/features/masters/

# Debería estar vacío o mostrar pocos resultados
# (solo los que están bien dentro del módulo)
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: Error "Cannot find module"

**Síntoma:** `ng serve` falla con "Cannot find module 'products.service'"

**Solución:**

1. Verificar rutas de imports
2. Ejecutar `npm install` o `ng build`
3. Reiniciar `ng serve`

```bash
# Limpiar cache de Angular
rm -rf .angular/cache
ng serve
```

### Problema 2: Componente no se renderiza

**Síntoma:** Componente no aparece en página

**Solución:**

1. Verificar que componente esté declarado en module
2. Verificar que ruta esté en routing module
3. Verificar que componente esté importado correctamente

```typescript
// masters.module.ts debe tener:
declarations: [
  ProductsListComponent, // ← verificar que esté aquí
  // ...
];
```

### Problema 3: Circular Dependency

**Síntoma:** Error "Circular dependency detected"

**Solución:**

1. No importar servicios de `app/services` dentro de módulos
2. Usar servicios locales del módulo
3. Usar `shared` para servicios globales

```typescript
// ❌ Incorrecto (circular):
import { ProductsService } from "../../services/products.service";

// ✅ Correcto (local):
import { ProductsService } from "../../services/products.service";
```

### Problema 4: SharedModule no importado

**Síntoma:** Componentes de shared no se encuentran (ej. ConfirmationDialog)

**Solución:**

```typescript
// Agregar a masters.module.ts
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule], // ← Agregar aquí
})
```

### Problema 5: Tests fallan después de mover componentes

**Síntoma:** `ng test` falla en componentes movidos

**Solución:**

```typescript
// Actualizar imports en .spec.ts
import { ProductsService } from "../../services/products.service"; // ← Nueva ruta

// Asegurar que TestBed importe SharedModule
TestBed.configureTestingModule({
  declarations: [ProductsListComponent],
  imports: [
    CommonModule,
    SharedModule, // ← Agregar
    MatTableModule,
  ],
});
```

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

### Preparación

- [ ] Estructura de carpetas creada (`src/app/features/masters/`)
- [ ] Carpetas de componentes, servicios, modelos creadas

### Servicios y Modelos

- [ ] Servicios copiados a `features/masters/services/`
- [ ] `providedIn: 'root'` removido de servicios
- [ ] Rutas de imports actualizadas en servicios
- [ ] Modelos copiados a `features/masters/models/`
- [ ] Modelos importados correctamente en servicios

### Módulos

- [ ] `masters.module.ts` creado con todas las declaraciones
- [ ] Todos los servicios agregados a `providers`
- [ ] `masters-routing.module.ts` creado con todas las rutas
- [ ] SharedModule importado en masters.module

### Componentes

- [ ] Componentes existentes copiados a nuevas ubicaciones
- [ ] Imports de componentes actualizados
- [ ] Nuevos componentes creados (categorías, almacenes, unidades)
- [ ] Templates `.html` copiados correctamente
- [ ] Estilos `.css` copiados correctamente

### Rutas

- [ ] `app.routes.ts` actualizado con lazy loading
- [ ] Rutas de navegación actualizadas
- [ ] Rutas hijas en `masters-routing.module.ts` configuradas

### Testing

- [ ] Compilación sin errores: `ng build`
- [ ] Servidor development: `ng serve`
- [ ] Navegación funciona a `/masters/productos`
- [ ] Lazy loading funciona (verificar Network)
- [ ] Tests pasan: `ng test`
- [ ] No hay errores en console

### Limpieza

- [ ] Componentes antiguos en `src/app/components/` removidos (opcional)
- [ ] Servicios antiguos en `src/app/services/` removidos (opcional)
- [ ] No hay imports duplicados

---

## 🎉 RESULTADO FINAL

Después de completar esta guía:

✅ **Masters module funcional**

```
/masters/productos       → Listado de productos
/masters/productos/:id   → Detalle de producto
/masters/categorias      → Listado de categorías
/masters/almacenes       → Listado de almacenes
/masters/unidades        → Listado de unidades
```

✅ **Lazy loading activo**

- Masters module carga solo cuando lo necesitas
- Reduce tamaño inicial del bundle

✅ **Estructura escalable**

- Fácil replicar este patrón para otros módulos
- Listo para agregar más funcionalidades

✅ **Preparado para próximas fases**

- Estructura lista para inventory, purchasing, sales, settings modules

---

## 📚 PRÓXIMOS PASOS

1. **Completar otros módulos** siguiendo el mismo patrón:
   - `inventory` module
   - `purchasing` module
   - `sales` module
   - `settings` module
   - `customers-suppliers` module (Fase 1)

2. **Optimizar shared module** si es necesario

3. **Agregar guards y resolvers** para proteger rutas

4. **Implementar feature flags** si es necesario

5. **Documentar cambios** para el equipo

---

**Documento generado:** 26 de mayo de 2026  
**Versión:** 1.0  
**Estado:** Listo para usar
