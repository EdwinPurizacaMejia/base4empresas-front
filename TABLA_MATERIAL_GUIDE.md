# Guía de Implementación: Tablas Profesionales con Angular Material

## 📋 Descripción General

Se ha creado un componente genérico reutilizable de tabla (`GenericDataTableComponent`) que implementa todas las características de una tabla profesional de sistema administrativo:

- **Material Design**: Integración completa con Angular Material 3
- **Paginación**: Con opciones configurables de tamaño
- **Ordenamiento**: Clickeable en encabezados
- **Búsqueda**: Filtro de texto integrado
- **Acciones por fila**: Menú contextual con más opciones
- **Formatos personalizados**: Moneda, fecha, números, badges
- **Estados de carga y error**: UX completa
- **Responsive**: Adaptado a todos los tamaños de pantalla

---

## 🏗️ Estructura de Archivos

```
src/app/components/
├── generic-data-table/
│   ├── generic-data-table.component.ts      (Lógica principal)
│   ├── generic-data-table.component.html    (Template)
│   └── generic-data-table.component.css     (Estilos)
└── products-list/
    ├── products-list.component.ts           (Refactorizado)
    ├── products-list.component.html         (Refactorizado)
    └── products-list.component.css          (Simplificado)
```

---

## 🎯 Características Principales

### 1. **Columnas Configurables**

```typescript
interface TableColumn {
  key: string; // Campo del objeto de datos
  label: string; // Etiqueta de encabezado
  type?: "text" | "number" | "currency" | "date" | "badge" | "custom";
  sortable?: boolean; // Habilitar ordenamiento
  width?: string; // Ancho de columna (ej: '150px')
  formatter?: (value: any, row?: any) => string; // Función personalizada
}
```

### 2. **Acciones por Fila**

```typescript
interface TableAction {
  id: string; // Identificador único de la acción
  label: string; // Texto visible
  icon: string; // Nombre del icono Material
  color?: string; // Clase CSS (ej: 'danger')
  show?: (row: any) => boolean; // Mostrar condicionalmente
}
```

### 3. **Configuración de Tabla**

```typescript
interface TableConfig {
  columns: TableColumn[]; // Definición de columnas
  actions?: TableAction[]; // Acciones disponibles
  pageSize?: number; // Items por página (default: 10)
  pageSizeOptions?: number[]; // Opciones de paginación
  showSearch?: boolean; // Mostrar barra de búsqueda
  searchPlaceholder?: string; // Placeholder del input
}
```

---

## 📖 Ejemplo: Products List (Implementado)

### Paso 1: Configurar en el Componente TypeScript

```typescript
import { GenericDataTableComponent, TableConfig } from "../generic-data-table/generic-data-table.component";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductFormComponent,
    GenericDataTableComponent, // Importar el componente
  ],
  templateUrl: "./products-list.component.html",
  styleUrl: "./products-list.component.css",
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  // 📝 Configuración de la tabla
  tableConfig: TableConfig = {
    columns: [
      { key: "sku", label: "SKU", sortable: true, width: "120px" },
      { key: "name", label: "Producto", sortable: true },
      { key: "sale_price", label: "Precio Venta", type: "currency", sortable: true, width: "130px" },
      { key: "purchase_price", label: "Precio Compra", type: "currency", sortable: true, width: "130px" },
      { key: "min_stock", label: "Stock Mín.", type: "number", sortable: true, width: "100px" },
      {
        key: "is_active",
        label: "Estado",
        type: "badge",
        sortable: true,
        width: "100px",
      },
    ],
    actions: [
      {
        id: "view",
        label: "Ver detalle",
        icon: "visibility",
      },
      {
        id: "edit",
        label: "Editar",
        icon: "edit",
      },
      {
        id: "delete",
        label: "Eliminar",
        icon: "delete",
        color: "danger", // Rojo para acciones destructivas
      },
    ],
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showSearch: true,
    searchPlaceholder: "Buscar por nombre o SKU...",
  };

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al cargar productos.";
        this.products = [];
        this.loading = false;
      },
    });
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.productService.getProducts(searchTerm || undefined).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onTableAction(event: { action: string; row: Product }): void {
    switch (event.action) {
      case "view":
        this.onViewProduct(event.row);
        break;
      case "edit":
        this.onEditProduct(event.row);
        break;
      case "delete":
        this.onDeleteProduct(event.row);
        break;
    }
  }

  onViewProduct(product: Product): void {
    console.log("View:", product);
  }

  onEditProduct(product: Product): void {
    // Abrir formulario en modo edición
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      // Lógica de eliminación
    }
  }
}
```

### Paso 2: Usar en el Template HTML

```html
<div class="container">
  <div class="header">
    <div>
      <h1 class="title">Productos</h1>
      <p class="subtitle">Gestiona tu inventario</p>
    </div>
    <button class="btn-primary" (click)="onNewProduct()">
      <mat-icon>add</mat-icon>
      Nuevo producto
    </button>
  </div>

  <!-- 🎯 Componente de tabla genérica -->
  <app-generic-data-table [data]="products" [config]="tableConfig" [loading]="loading" [error]="error" [totalItems]="products.length" (actionClick)="onTableAction($event)" (searchChange)="onSearch($event)"></app-generic-data-table>
</div>
```

---

## 🔧 Ejemplo: Adaptando a Purchase List

### 1. Configurar la tabla

```typescript
// purchase-list.component.ts

import { PurchaseListItem } from "../../models/purchase.model";

export class PurchaseListComponent implements OnInit {
  purchases: PurchaseListItem[] = [];
  loading = false;
  error: string | null = null;

  tableConfig: TableConfig = {
    columns: [
      { key: "number", label: "Número", sortable: true, width: "100px" },
      { key: "supplier_id", label: "Proveedor", sortable: true },
      { key: "warehouse_id", label: "Almacén", sortable: true },
      { key: "total", label: "Total", type: "currency", sortable: true, width: "130px" },
      {
        key: "created_at",
        label: "Fecha",
        type: "date",
        sortable: true,
        width: "120px",
      },
      {
        key: "status",
        label: "Estado",
        type: "badge",
        formatter: (value) => (value === "pending" ? "Pendiente" : "Completado"),
      },
    ],
    actions: [
      {
        id: "view",
        label: "Ver detalle",
        icon: "visibility",
      },
      {
        id: "edit",
        label: "Editar",
        icon: "edit",
        show: (row) => row.status === "pending", // Solo si está pendiente
      },
      {
        id: "delete",
        label: "Eliminar",
        icon: "delete",
        color: "danger",
      },
    ],
    pageSize: 10,
    showSearch: true,
    searchPlaceholder: "Buscar por número o proveedor...",
  };

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al cargar compras.";
        this.purchases = [];
        this.loading = false;
      },
    });
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.purchaseService.getPurchases(searchTerm).subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
    });
  }

  onTableAction(event: { action: string; row: PurchaseListItem }): void {
    switch (event.action) {
      case "view":
        // Navegar a detalle
        break;
      case "edit":
        // Abrir formulario
        break;
      case "delete":
        if (confirm("¿Eliminar compra?")) {
          // Ejecutar eliminación
        }
        break;
    }
  }
}
```

### 2. Usar en el template

```html
<app-generic-data-table [data]="purchases" [config]="tableConfig" [loading]="loading" [error]="error" (actionClick)="onTableAction($event)" (searchChange)="onSearch($event)"></app-generic-data-table>
```

---

## 🎨 Tipos de Columnas Soportados

### 1. **Text (Defecto)**

```typescript
{ key: 'name', label: 'Nombre', type: 'text' }
```

### 2. **Currency**

```typescript
{ key: 'total', label: 'Total', type: 'currency' }
// Formato: $1,234,567.89
```

### 3. **Date**

```typescript
{ key: 'created_at', label: 'Fecha', type: 'date' }
// Formato: 3 may 2026
```

### 4. **Number**

```typescript
{ key: 'quantity', label: 'Cantidad', type: 'number' }
// Formato: 1,234
```

### 5. **Badge**

```typescript
{ key: 'is_active', label: 'Estado', type: 'badge' }
// Muestra true/false como badge con colores
```

### 6. **Custom (Formatter)**

```typescript
{
  key: 'status',
  label: 'Estado',
  formatter: (value, row) => {
    if (value === 'pending') return '⏳ Pendiente';
    if (value === 'completed') return '✓ Completado';
    return '❌ Cancelado';
  }
}
```

---

## 📡 Eventos y Comunicación

### Events Emitidos

```typescript
// 1. Cuando se hace click en una acción
@Output() actionClick = new EventEmitter<{ action: string; row: any }>();

// 2. Cuando se hace click en una fila
@Output() rowClick = new EventEmitter<any>();

// 3. Cuando cambia la página
@Output() pageChange = new EventEmitter<PageEvent>();

// 4. Cuando cambia el ordenamiento
@Output() sortChange = new EventEmitter<Sort>();

// 5. Cuando se busca
@Output() searchChange = new EventEmitter<string>();
```

### Uso en Template

```html
<app-generic-data-table [data]="items" [config]="config" (actionClick)="onAction($event)" (rowClick)="onRowClick($event)" (pageChange)="onPageChange($event)" (sortChange)="onSort($event)" (searchChange)="onSearch($event)"></app-generic-data-table>
```

---

## 🎯 Mejores Prácticas

### 1. **Importar en Standalone Components**

```typescript
import { GenericDataTableComponent } from '../generic-data-table/generic-data-table.component';

@Component({
  imports: [
    CommonModule,
    GenericDataTableComponent,
    MatButtonModule,
    MatIconModule
  ]
})
```

### 2. **Manejar Búsqueda Eficientemente**

```typescript
onSearch(searchTerm: string): void {
  // Debounce para no hacer requests excesivos
  this.loading = true;
  this.service.getItems(searchTerm).subscribe({
    next: (data) => {
      this.items = data;
      this.loading = false;
    }
  });
}
```

### 3. **Mostrar/Ocultar Acciones Condicionalmente**

```typescript
{
  id: 'edit',
  label: 'Editar',
  icon: 'edit',
  show: (row) => {
    // Solo mostrar si el usuario es propietario
    return row.user_id === this.currentUserId;
  }
}
```

### 4. **Formatear Datos Complejos**

```typescript
{
  key: 'customer',
  label: 'Cliente',
  formatter: (value, row) => {
    // Mostrar nombre y teléfono juntos
    return `${row.customer_name} (${row.customer_phone})`;
  }
}
```

---

## 🔄 Migración de Componentes Existentes

Para migrar otros listados (purchase-list, sale-list, stock-list):

### 1. Importar `GenericDataTableComponent`

### 2. Crear `tableConfig` con columnas y acciones

### 3. Reemplazar tabla HTML antigua con `<app-generic-data-table>`

### 4. Implementar `onTableAction()` para manejar acciones

### 5. Simplificar CSS (Material se encarga de estilos)

---

## 💡 Próximos Pasos

1. **Edición Inline**: Añadir capacidad de editar celdas directamente en la tabla
2. **Exportación**: Exportar datos a Excel/CSV
3. **Filtros Avanzados**: Añadir filtros por columna además de búsqueda global
4. **Selección múltiple**: Checkboxes para acciones en lote
5. **Drag & Drop**: Reordenar filas o columnas

---

## 📚 Recursos

- [Angular Material Table](https://material.angular.io/components/table/overview)
- [Material Paginator](https://material.angular.io/components/paginator/overview)
- [Material Sort](https://material.angular.io/components/sort/overview)
- [Material Icons](https://fonts.google.com/icons)

---

## ✅ Checklist de Implementación

Para cada componente que uses la tabla genérica:

- [ ] Importar `GenericDataTableComponent`
- [ ] Crear `tableConfig` con `columns` y `actions`
- [ ] Pasar datos a `[data]`
- [ ] Manejar evento `(actionClick)`
- [ ] Manejar evento `(searchChange)`
- [ ] Cargar datos en `ngOnInit()`
- [ ] Simplificar CSS del componente
- [ ] Probar en dispositivos móviles

---

**Creado**: 3 de mayo de 2026  
**Versión**: 1.0  
**Estado**: Listo para usar en todos los listados del proyecto
