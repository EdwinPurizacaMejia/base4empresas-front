# FASE 3 — LISTADOS Y FILTROS

## Informe de Implementación — Base4Empresas Frontend Angular

**Fecha:** 2026-07-18  
**Rama:** `feat/ui-fase-3-listados-filtros`  
**Base:** `feat/ui-redesign` (incluye Fases 0, 1 y 2 completadas)  
**Build Status:** ✅ EXITOSO — sin nuevos warnings respecto al baseline

---

## 1. MÓDULOS MIGRADOS EN ESTA FASE

| Módulo               | Archivos tocados   | Estado                                     |
| -------------------- | ------------------ | ------------------------------------------ |
| `sale-list`          | HTML, TS, CSS→SCSS | ✅ Migrado con `page-header` + `FilterBar` |
| `generic-data-table` | CSS→SCSS, TS       | ✅ Mejorado con variables del sistema      |

---

## 2. ARCHIVOS CREADOS Y MODIFICADOS

### Archivos CREADOS (nuevos)

| Archivo                                                                   | Descripción                                                                |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/app/components/shared/filter-bar/filter-bar.component.ts`            | Componente reutilizable de barra de filtros con búsqueda, chips y debounce |
| `src/app/components/shared/filter-bar/filter-bar.component.scss`          | Estilos del FilterBar con variables del sistema                            |
| `src/app/components/generic-data-table/generic-data-table.component.scss` | SCSS mejorado con variables del sistema (reemplaza .css)                   |
| `src/app/components/sale-list/sale-list.component.scss`                   | SCSS del módulo Ventas con `.list-page` wrapper                            |

### Archivos MODIFICADOS

| Archivo                                                                 | Cambio                                                               | Impacto                                  |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| `src/app/components/generic-data-table/generic-data-table.component.ts` | `styleUrls` `.css` → `.scss`                                         | Bajo — mismo estilo mejorado             |
| `src/app/components/sale-list/sale-list.component.ts`                   | `styleUrls` `.css` → `.scss`, importa `FilterBarComponent`           | Bajo — misma lógica                      |
| `src/app/components/sale-list/sale-list.component.html`                 | Usa `.page-header`, `app-filter-bar`, elimina `.sales-header` ad-hoc | **Medio** — cambio visual del encabezado |

---

## 3. PATRÓN DE PÁGINA DE LISTADO ESTÁNDAR

Establecido en `sale-list` como módulo piloto. Aplicable a todos los listados:

```html
<div class="list-page">
  <!-- Encabezado estándar (clases de _foundations.scss) -->
  <div class="page-header">
    <div class="page-header__title-group">
      <h1 class="page-header__title">Título del módulo</h1>
      <p class="page-header__subtitle">Descripción breve</p>
    </div>
    <div class="page-header__actions">
      <button mat-raised-button color="primary" (click)="onCrear()"><mat-icon>add</mat-icon> Nueva entidad</button>
    </div>
  </div>

  <!-- Barra de filtros (componente reutilizable) -->
  <app-filter-bar searchPlaceholder="Buscar por número o nombre..." [activeFilters]="activeFilters" (searchChange)="onSearch($event)" (filterRemoved)="onRemoveFilter($event)" (filtersCleared)="onClearFilters()"> </app-filter-bar>

  <!-- Tabla genérica mejorada -->
  <app-generic-data-table [data]="items" [config]="tableConfig" [loading]="loading" [error]="error" [totalItems]="items.length" (actionClick)="onTableAction($event)"> </app-generic-data-table>
</div>
```

**CSS del wrapper** (en el componente de lista):

```scss
@import "../../../styles/variables";

.list-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $space-6;
}
```

---

## 4. FILTERBAR COMPONENT — API

**Selector:** `app-filter-bar`  
**Ubicación:** `src/app/components/shared/filter-bar/`

### Inputs

| Input               | Tipo                 | Default       | Descripción                            |
| ------------------- | -------------------- | ------------- | -------------------------------------- |
| `searchPlaceholder` | `string`             | `'Buscar...'` | Placeholder del campo de búsqueda      |
| `initialSearch`     | `string`             | `''`          | Valor inicial de búsqueda              |
| `debounceMs`        | `number`             | `300`         | Debounce en ms para `searchChange`     |
| `activeFilters`     | `ActiveFilterChip[]` | `[]`          | Chips de filtros activos a mostrar     |
| `showExtraFilters`  | `boolean`            | `false`       | Habilita el slot de content projection |

### Outputs

| Output           | Tipo                             | Descripción                                 |
| ---------------- | -------------------------------- | ------------------------------------------- |
| `searchChange`   | `EventEmitter<string>`           | Emite el término de búsqueda (con debounce) |
| `filterRemoved`  | `EventEmitter<ActiveFilterChip>` | Emite el chip eliminado                     |
| `filtersCleared` | `EventEmitter<void>`             | Emite cuando se limpian todos los filtros   |

### Interfaz `ActiveFilterChip`

```typescript
export interface ActiveFilterChip {
  key: string; // Identificador único del filtro
  label: string; // Etiqueta visible en el chip
  value?: any; // Valor del filtro (para referencia)
}
```

### Ejemplo con filtros adicionales (content projection)

```html
<app-filter-bar searchPlaceholder="Buscar..." [activeFilters]="activeFilters" [showExtraFilters]="true" (searchChange)="onSearch($event)" (filterRemoved)="onRemoveFilter($event)">
  <!-- Filtros adicionales proyectados -->
  <mat-form-field appearance="outline" subscriptSizing="dynamic">
    <mat-label>Estado</mat-label>
    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="onStatusFilter($event)">
      <mat-option value="">Todos</mat-option>
      <mat-option value="completed">Completado</mat-option>
      <mat-option value="pending">Pendiente</mat-option>
    </mat-select>
  </mat-form-field>
</app-filter-bar>
```

---

## 5. GENERIC DATA TABLE — MEJORAS FASE 3

### Cambios en el CSS (`.css` → `.scss`)

| Antes                                               | Después                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Colores hardcoded (`#667eea`, `#2c3e50`, `#f9fafb`) | Variables del sistema (`$color-primary`, `$color-text-dark`, `$color-surface-variant`) |
| Badge de number con `color: #667eea` (violet)       | `color: $color-primary` (azul índigo del sistema)                                      |
| Empty state con `color: #6b7280` hardcoded          | `color: $color-text-light` del sistema                                                 |
| Loading state con `background: #f5f5f5`             | `background-color: $color-surface` + borde del sistema                                 |

### Nuevas clases de badge de estado

Alineados con el sistema de colores:

| Clase CSS                                                | Color                         | Uso                  |
| -------------------------------------------------------- | ----------------------------- | -------------------- |
| `.badge-completed`, `.badge-paid`, `.badge-active`       | Verde (`$color-success-*`)    | Estados positivos    |
| `.badge-pending`, `.badge-partial`                       | Amarillo (`$color-warning-*`) | Estados intermedios  |
| `.badge-cancelled`, `.badge-inactive`, `.badge-rejected` | Rojo (`$color-danger-*`)      | Estados negativos    |
| `.badge-draft`, `.badge-processing`                      | Azul (`$color-info-*`)        | Estados informativos |

### Acciones compactas por icono

Los botones de acción en la columna Actions usan clases semánticas:

```css
.action-btn.view:hover    → color: $color-info      + fondo $color-info-light
.action-btn.edit:hover    → color: $color-primary   + fondo $color-primary-light
.action-btn.delete:hover  → color: $color-danger    + fondo $color-danger-light
.action-btn.primary:hover → color: $color-primary-dark + fondo $color-primary-light
```

---

## 6. BUILD STATUS

**Resultado:** ✅ BUILD EXITOSO  
**Tiempo de compilación:** 43.542 segundos  
**Bundle styles:** 117.89 kB (sin incremento respecto a Fase 2)  
**Nuevos warnings introducidos:** 0

### Warnings activos (todos pre-existentes):

| Tipo     | Archivo                           | Descripción                               |
| -------- | --------------------------------- | ----------------------------------------- |
| `NG8107` | `order-create.component.html:148` | Operador `?.` innecesario (pre-existente) |
| `NG8107` | `order-form.component.ts:33`      | Operador `?.` innecesario (pre-existente) |
| `NG8107` | `order-form.component.ts:81`      | Operador `?.` innecesario (pre-existente) |
| `BUDGET` | `purchase-form.component.css`     | 12.79KB / 12KB (pre-existente, Fase 4)    |

---

## 7. RIESGOS DE REGRESIÓN PENDIENTES

| ID   | Riesgo                                                                                                      | Severidad | Acción                                                |
| ---- | ----------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------- |
| R-01 | `sale-list.component.css` (legacy) coexiste con el nuevo `.scss`                                            | BAJO      | Eliminar en limpieza posterior                        |
| R-02 | `generic-data-table.component.css` (legacy) coexiste con el nuevo `.scss`                                   | BAJO      | Eliminar en limpieza posterior                        |
| R-03 | El `FilterBarComponent` usa `*ngIf` que requiere `CommonModule` — verificar compatibilidad con SSR          | BAJO      | Verificado: `CommonModule` está en imports            |
| R-04 | La función `onSearch` en `sale-list` hace llamada API completa en cada búsqueda (no filtra solo en memoria) | MEDIO     | Optimizar a filtrado local en Fase 4 o post-migración |
| R-05 | `FilterBarComponent` no está aplicado en `orders-list`, `purchase-list` aún                                 | MEDIO     | Aplicar en Fase 3 extendida o Fase 4                  |

---

## 8. RECOMENDACIÓN PARA FASE 4

> **Formularios y diálogos** — Estandarizar la experiencia de captura de datos en ventas, pedidos y compras usando el patrón de modal estándar con header/body/footer.

### Módulos prioritarios para Fase 4:

1. `sale-form` — Mayor uso operativo
2. `order-create` — Formulario más complejo
3. `purchase-form` — Excede budget de CSS (reducirlo)
4. Crear `ConfirmDialogComponent` reutilizable para reemplazar `confirm()` nativo

### Comando para crear Fase 4:

```bash
git checkout feat/ui-redesign
git merge --no-ff feat/ui-fase-3-listados-filtros -m "merge: cierre fase 3 listados filtros"
git push origin feat/ui-redesign
git checkout -b feat/ui-fase-4-formularios-dialogos
git push -u origin feat/ui-fase-4-formularios-dialogos
```

---

## 9. PENDIENTE DE APLICAR (Fase 3 Extendida)

Los siguientes módulos están identificados para usar el mismo patrón `page-header + FilterBar` pero no fueron migrados en esta iteración para mantener el alcance controlado:

- `orders-list` — Módulo de Pedidos
- `purchase-list` — Módulo de Compras
- `products-list` — Catálogo de Productos
- `customers-list` — Clientes
- `suppliers-list` — Proveedores
- `stock-list` — Stock actual
- `kardex` — Historial de movimientos

Cada uno requiere solo:

1. Importar `FilterBarComponent`
2. Agregar `app-filter-bar` al HTML
3. Agregar `.page-header` al encabezado
4. Crear/migrar su `.scss` con `.list-page`
