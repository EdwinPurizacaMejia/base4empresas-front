# 📚 Snippets de Código - Products List Moderno

## HTML Refactorizado

### Estado (Badge Personalizado)

```html
<!-- ANTES: mat-chip -->
<mat-chip [color]="getStatusColor(element.is_active)" selected class="status-chip"> {{ getStatusLabel(element.is_active) }} </mat-chip>

<!-- AHORA: Badge personalizado -->
<span class="status-badge" [ngClass]="element.is_active ? 'status-active' : 'status-inactive'">
  <span class="status-dot" [ngClass]="element.is_active ? 'dot-active' : 'dot-inactive'"></span>
  {{ getStatusLabel(element.is_active) }}
</span>
```

### Estructura Completa de la Tabla

```html
<div class="products-container">
  <!-- Header -->
  <div class="products-header">
    <div class="header-left">
      <h1 class="page-title">Productos</h1>
      <p class="page-subtitle">Gestiona tu inventario de productos</p>
    </div>
    <button mat-raised-button color="primary" (click)="onNewProduct()" class="btn-new-product">
      <mat-icon>add</mat-icon>
      Nuevo producto
    </button>
  </div>

  <!-- Table -->
  <div class="table-wrapper">
    <div class="table-container">
      <table mat-table [dataSource]="dataSource" class="products-table">
        <!-- SKU Column -->
        <ng-container matColumnDef="sku">
          <th mat-header-cell *matHeaderCellDef class="column-sku">SKU</th>
          <td mat-cell *matCellDef="let element" class="column-sku">{{ element.sku }}</td>
        </ng-container>

        <!-- Producto Column (RESALTADO) -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="column-name">Producto</th>
          <td mat-cell *matCellDef="let element" class="column-name">{{ element.name }}</td>
        </ng-container>

        <!-- Precio Venta (DERECHA) -->
        <ng-container matColumnDef="sale_price">
          <th mat-header-cell *matHeaderCellDef class="column-price">Precio Venta</th>
          <td mat-cell *matCellDef="let element" class="column-price">{{ element.sale_price | currency:'PEN':'symbol':'1.2-2' }}</td>
        </ng-container>

        <!-- Stock Mín. (DERECHA) -->
        <ng-container matColumnDef="min_stock">
          <th mat-header-cell *matHeaderCellDef class="column-stock">Stock Mín.</th>
          <td mat-cell *matCellDef="let element" class="column-stock">{{ element.min_stock }}</td>
        </ng-container>

        <!-- Estado (BADGE NUEVO) -->
        <ng-container matColumnDef="is_active">
          <th mat-header-cell *matHeaderCellDef class="column-status">Estado</th>
          <td mat-cell *matCellDef="let element" class="column-status">
            <span class="status-badge" [ngClass]="element.is_active ? 'status-active' : 'status-inactive'">
              <span class="status-dot" [ngClass]="element.is_active ? 'dot-active' : 'dot-inactive'"></span>
              {{ getStatusLabel(element.is_active) }}
            </span>
          </td>
        </ng-container>

        <!-- Acciones (MEJORADAS) -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="column-actions">Acciones</th>
          <td mat-cell *matCellDef="let element" class="column-actions">
            <button mat-icon-button (click)="onViewProduct(element)" matTooltip="Ver detalle" class="action-btn view">
              <mat-icon>visibility</mat-icon>
            </button>
            <button mat-icon-button (click)="onEditProduct(element)" matTooltip="Editar" class="action-btn edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="onDeleteProduct(element)" matTooltip="Eliminar" class="action-btn delete">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <!-- Rows -->
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="data-row"></tr>
      </table>
    </div>

    <!-- Paginator -->
    <mat-paginator [pageSizeOptions]="pageSizeOptions" showFirstLastButtons [pageSize]="10" [length]="dataSource.data.length" class="paginator"> </mat-paginator>
  </div>
</div>
```

---

## SCSS Completo - Estilos Profesionales

```scss
// ============================================
// VARIABLES Y MIXINS
// ============================================

$primary-color: #667eea;
$text-primary: #2c3e50;
$text-secondary: #6c757d;
$border-color: #e9ecef;
$transition-default: all 0.3s ease;

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// ============================================
// CONTENEDOR PRINCIPAL
// ============================================

.products-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

// ============================================
// HEADER
// ============================================

.products-header {
  @include flex-between;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;

  .header-left {
    flex: 1;
    min-width: 200px;
  }

  .page-title {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    margin: 0;
    font-size: 14px;
    color: $text-secondary;
    font-weight: 400;
  }
}

.btn-new-product {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
    transform: translateY(-1px);
  }

  mat-icon {
    margin-right: 4px;
  }
}

// ============================================
// TABLE WRAPPER Y CONTENEDOR
// ============================================

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  overflow-x: auto;
  flex: 1;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }

  &::-webkit-scrollbar-thumb {
    background: #e9ecef;
    border-radius: 3px;

    &:hover {
      background: #bbb;
    }
  }
}

// ============================================
// TABLA PRINCIPAL
// ============================================

.products-table {
  width: 100%;
  border-collapse: collapse;

  // Encabezados
  th.mat-header-cell {
    background: #f8fafc;
    color: #1e293b;
    font-weight: 700;
    font-size: 12px;
    padding: 16px 12px;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
    user-select: none;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  // Celdas
  td.mat-cell {
    padding: 14px 12px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
  }

  // Filas
  .data-row {
    transition: $transition-default;

    &:hover {
      background: #fafcff;
      box-shadow: inset 0 0 0 1px #e2e8f0;
    }
  }

  // Alternadas
  .data-row:nth-child(even) {
    background: #fafcff;
  }

  .data-row:nth-child(odd) {
    background: white;
  }
}

// ============================================
// COLUMNAS
// ============================================

.column-sku {
  width: 100px;
  font-family: "Courier New", monospace;
  font-size: 13px;
  text-align: left;
  letter-spacing: 0.5px;
}

.column-name {
  width: auto;
  min-width: 200px;
  font-weight: 500; // ✅ RESALTADO
  color: #1e293b;
  letter-spacing: 0.2px;
}

.column-price {
  width: 130px;
  text-align: right; // ✅ DERECHA
  padding-right: 16px;
  font-variant-numeric: tabular-nums;

  &.mat-header-cell {
    padding-right: 16px;
  }
}

.column-stock {
  width: 110px;
  text-align: right; // ✅ DERECHA
  padding-right: 16px;
  font-variant-numeric: tabular-nums;

  &.mat-header-cell {
    padding-right: 16px;
  }
}

.column-status {
  width: 140px;
  text-align: center;
}

.column-actions {
  width: 150px;
  text-align: center;

  &.mat-header-cell {
    text-align: center;
  }

  &.mat-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
}

// ============================================
// BADGE DE ESTADO (PERSONALIZADO)
// ============================================

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  // ✅ ACTIVO - Verde suave
  &.status-active {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;

    .status-dot {
      background-color: #22c55e;
    }
  }

  // ❌ INACTIVO - Rojo suave (SIN CUADROS NEGROS)
  &.status-inactive {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;

    .status-dot {
      background-color: #ef4444;
    }
  }
}

// Punto indicador (dot)
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s infinite;

  &.dot-active {
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  }

  &.dot-inactive {
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
  }
}

// Animación de pulso
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// ============================================
// BOTONES DE ACCIÓN
// ============================================

.action-btn {
  transition: all 0.2s ease;
  color: #94a3b8; // Gris suave
  opacity: 0.8; // Desenfoque inicial
  padding: 4px;
  border-radius: 4px;

  &:hover {
    opacity: 1; // Visible al hover
  }

  // 👁️ VER - Azul cielo
  &.view {
    &:hover {
      color: #0369a1;
      background: rgba(3, 105, 161, 0.08);
    }
  }

  // ✏️ EDITAR - Azul primario
  &.edit {
    &:hover {
      color: #2563eb;
      background: rgba(37, 99, 235, 0.08);
    }
  }

  // 🗑️ ELIMINAR - Rojo (solo hover)
  &.delete {
    &:hover {
      color: #dc2626;
      background: rgba(220, 38, 38, 0.1);
    }
  }

  mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
}

// ============================================
// PAGINADOR
// ============================================

.paginator {
  border-top: 1px solid #e2e8f0;
  background: white;

  ::ng-deep .mat-mdc-paginator-outer-container {
    background: transparent;
  }

  ::ng-deep .mat-mdc-paginator-container {
    min-height: 56px;
    justify-content: space-between;
    padding: 0 16px;
    color: #334155;
    font-size: 14px;
  }

  ::ng-deep .mat-mdc-paginator-page-size {
    align-items: center;
    gap: 8px;

    .mat-mdc-paginator-page-size-label {
      margin: 0;
      color: #334155;
      font-weight: 500;
    }
  }

  ::ng-deep .mat-mdc-paginator-range-actions {
    gap: 8px;
  }

  ::ng-deep .mat-mdc-paginator-page-size-label,
  ::ng-deep .mat-mdc-paginator-range-label {
    color: #1e293b;
    font-weight: 500;
  }

  ::ng-deep .mat-mdc-paginator-container .mat-mdc-icon-button {
    color: #475569;
  }

  ::ng-deep .mat-mdc-select-value-text {
    color: #1e293b !important;
    font-weight: 500;
  }
}

// ============================================
// RESPONSIVE
// ============================================

@media (max-width: 1024px) {
  .products-container {
    padding: 16px;
  }

  .products-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .products-table {
    font-size: 13px;

    th.mat-header-cell,
    td.mat-cell {
      padding: 10px 8px;
      font-size: 12px;
    }
  }
}

@media (max-width: 480px) {
  .column-sku,
  .column-price,
  .column-stock {
    display: none;
  }
}
```

---

## TypeScript (Sin Cambios)

```typescript
export class ProductsListComponent {
  // El método sigue igual, sin cambios
  getStatusLabel(isActive: boolean): string {
    return isActive ? "Activo" : "Inactivo";
  }

  // Este método puede mantenerse para compatibilidad
  getStatusColor(isActive: boolean): string {
    return isActive ? "primary" : "warn";
  }
}
```

---

## 🎨 Paleta de Colores Personalizables

Si necesitas cambiar colores, aquí está el mapa:

```scss
// Estados
$status-active-bg: #dcfce7; // Verde activo
$status-active-text: #166534; // Verde texto
$status-inactive-bg: #fee2e2; // Rojo inactivo
$status-inactive-text: #991b1b; // Rojo texto

// Acciones
$action-view: #0369a1; // Ver (azul cielo)
$action-edit: #2563eb; // Editar (azul)
$action-delete: #dc2626; // Eliminar (rojo)

// Texto
$text-header: #1e293b; // Azul muy oscuro
$text-body: #334155; // Gris oscuro
$text-muted: #94a3b8; // Gris suave

// Fondos
$bg-hover: #fafcff; // Azul suave hover
$bg-header: #f8fafc; // Gris header
$border-line: #e2e8f0; // Borde suave
```

---

## ✅ Checklist de Aplicación

- [ ] Reemplazar HTML de estado con nuevo badge
- [ ] Agregar estilos SCSS del status-badge
- [ ] Reemplazar estilos de action-btn
- [ ] Verificar columnasalineadas a derecha
- [ ] Comprobar font-weight del nombre
- [ ] Probar animaciones en navegador
- [ ] Validar responsive en móvil
- [ ] Compilar sin errores
- [ ] Prueba visual en navegador

---

**Versión:** 1.0  
**Última actualización:** 8 de mayo de 2026  
**Compatible con:** Angular 17 + Material 17.3
