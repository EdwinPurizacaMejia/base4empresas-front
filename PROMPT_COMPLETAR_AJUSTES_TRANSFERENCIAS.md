# Prompt para Copilot: Completar Ajustes y Transferencias

Necesito completar la implementación de Ajustes y Transferencias de inventario. Ya tengo los modelos y servicios listos, solo faltan los componentes de UI.

## CONTEXTO

**Archivos ya creados:**

- ✅ `src/app/models/stock-operations.model.ts` (modelos completos)
- ✅ `src/app/services/stock-operations.service.ts` (servicio completo)
- ✅ `src/app/services/kardex.service.ts` (actualizado con filtro `reference_type`)

**Backend endpoints confirmados:**

- `POST /stock/adjustments` (crear ajuste)
- `POST /stock/transfers` (crear transferencia)
- `GET /inventory/kardex?reference_type=ADJUSTMENT` (listar ajustes)
- `GET /inventory/kardex?reference_type=TRANSFER` (listar transferencias)

---

## TAREA 1: Crear AdjustmentsListComponent

**Archivo a crear:** `src/app/components/adjustments-list/adjustments-list.component.ts`

### Requisitos:

- Componente standalone Angular con Material Design
- Lista ajustes filtrando Kardex con `referenceType: 'ADJUSTMENT'`
- Tabla Material con columnas: Fecha, Almacén, Producto, Cantidad, Razón, Usuario
- Botón "Nuevo Ajuste" (puede estar disabled con tooltip "Próximamente")
- Usar `KardexService.getKardex()` con filtro
- Estado de loading con `LoadingSpinnerComponent`
- Estado vacío si no hay ajustes
- Similar en diseño a `CategoriesListComponent` o `UnitsListComponent`

### Imports necesarios:

```typescript
import { KardexService } from "../../services/kardex.service";
import { WarehouseService } from "../../services/warehouse.service";
import { LoadingSpinnerComponent } from "../shared/loading-spinner.component";
// Material: MatTableModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule
```

### Lógica principal:

```typescript
loadAdjustments(): void {
  this.loading = true;

  this.kardexService.getKardex({
    warehouseId: this.selectedWarehouse,
    referenceType: 'ADJUSTMENT'
  }).subscribe({
    next: (movements) => {
      this.adjustments = movements;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading adjustments:', err);
      this.notificationService.error('Error al cargar los ajustes');
      this.loading = false;
    }
  });
}
```

### Template ejemplo:

```html
<div class="container">
  <div class="header">
    <h1>⚙️ Ajustes de Inventario</h1>
    <button mat-raised-button color="primary" disabled matTooltip="Próximamente: Crear nuevo ajuste">
      <mat-icon>add</mat-icon>
      Nuevo Ajuste
    </button>
  </div>

  <mat-card class="table-card">
    <app-loading-spinner *ngIf="loading" message="Cargando ajustes..."></app-loading-spinner>

    <div *ngIf="!loading && adjustments.length === 0" class="empty-state">
      <mat-icon>assignment</mat-icon>
      <p>No hay ajustes registrados</p>
      <p class="empty-subtitle">Los ajustes se registran para corregir diferencias de inventario</p>
    </div>

    <table mat-table [dataSource]="adjustments" class="adjustments-table" *ngIf="!loading && adjustments.length > 0">
      <!-- Columnas: fecha, almacén, producto, cantidad, razón -->
    </table>
  </mat-card>
</div>
```

---

## TAREA 2: Crear TransfersListComponent

**Archivo a crear:** `src/app/components/transfers-list/transfers-list.component.ts`

### Requisitos:

- Componente standalone Angular con Material Design
- Lista transferencias filtrando Kardex con `referenceType: 'TRANSFER'`
- Tabla Material con columnas: Fecha, Almacén Origen, Almacén Destino, Producto, Cantidad, Usuario
- Botón "Nueva Transferencia" (puede estar disabled con tooltip "Próximamente")
- Usar `KardexService.getKardex()` con filtro
- Estado de loading con `LoadingSpinnerComponent`
- Estado vacío si no hay transferencias
- Similar en diseño a `CategoriesListComponent` o `UnitsListComponent`

### Lógica principal:

```typescript
loadTransfers(): void {
  this.loading = true;

  this.kardexService.getKardex({
    warehouseId: this.selectedWarehouse,
    referenceType: 'TRANSFER'
  }).subscribe({
    next: (movements) => {
      this.transfers = movements;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading transfers:', err);
      this.notificationService.error('Error al cargar las transferencias');
      this.loading = false;
    }
  });
}
```

### Template ejemplo:

```html
<div class="container">
  <div class="header">
    <h1>↔️ Transferencias entre Almacenes</h1>
    <button mat-raised-button color="primary" disabled matTooltip="Próximamente: Crear nueva transferencia">
      <mat-icon>add</mat-icon>
      Nueva Transferencia
    </button>
  </div>

  <mat-card class="table-card">
    <app-loading-spinner *ngIf="loading" message="Cargando transferencias..."></app-loading-spinner>

    <div *ngIf="!loading && transfers.length === 0" class="empty-state">
      <mat-icon>swap_horiz</mat-icon>
      <p>No hay transferencias registradas</p>
      <p class="empty-subtitle">Las transferencias mueven productos entre almacenes</p>
    </div>

    <table mat-table [dataSource]="transfers" class="transfers-table" *ngIf="!loading && transfers.length > 0">
      <!-- Columnas: fecha, origen, destino, producto, cantidad -->
    </table>
  </mat-card>
</div>
```

---

## TAREA 3: Actualizar app.routes.ts

**Archivo:** `src/app/app.routes.ts`

### Paso 1: Importar componentes

Agregar al inicio del archivo, junto a los otros imports de INVENTARIO:

```typescript
import { AdjustmentsListComponent } from "./components/adjustments-list/adjustments-list.component";
import { TransfersListComponent } from "./components/transfers-list/transfers-list.component";
```

### Paso 2: Actualizar rutas

En la sección `path: 'inventario'`, dentro de `children`, **REEMPLAZAR**:

```typescript
// ANTES (placeholder con StockListComponent):
{
  path: 'ajustes',
  component: StockListComponent,
  data: { title: 'Ajustes de Stock' }
},
{
  path: 'transferencias',
  component: StockListComponent,
  data: { title: 'Transferencias de Stock' }
}
```

**POR**:

```typescript
// DESPUÉS (componentes dedicados):
{
  path: 'ajustes',
  component: AdjustmentsListComponent,
  data: { title: 'Ajustes de Stock' }
},
{
  path: 'transferencias',
  component: TransfersListComponent,
  data: { title: 'Transferencias de Stock' }
}
```

---

## TAREA 4: Restaurar opciones en menu.model.ts

**Archivo:** `src/app/models/menu.model.ts`

Buscar la sección de Inventario y **DESCOMENTAR/AGREGAR** las opciones de Ajustes y Transferencias:

```typescript
{
  label: 'Inventario',
  icon: '📦',
  tooltip: 'Control de stock, valuación y movimientos',
  children: [
    {
      label: 'Stock actual',
      icon: '📊',
      route: '/inventario/stock',
      tooltip: 'Vista de stock actual por almacén',
    },
    {
      label: 'Kardex',
      icon: '📝',
      route: '/inventario/kardex',
      tooltip: 'Historial de movimientos de inventario',
    },
    // AGREGAR/DESCOMENTAR ESTAS DOS OPCIONES:
    {
      label: 'Ajustes de stock',
      icon: '⚙️',
      route: '/inventario/ajustes',
      tooltip: 'Registrar correcciones de inventario',
    },
    {
      label: 'Transferencias',
      icon: '↔️',
      route: '/inventario/transferencias',
      tooltip: 'Transferir entre almacenes',
    },
  ],
},
```

---

## PATRONES A SEGUIR

### Estructura de Componente (referencia)

Usa como base estos componentes existentes:

- `src/app/components/categories-list/categories-list.component.ts`
- `src/app/components/units-list/units-list.component.ts`

### Servicios disponibles:

- `KardexService` - Para listar movimientos filtrados
- `WarehouseService` - Para obtener nombres de almacenes
- `NotificationService` - Para mostrar errores
- `LoadingSpinnerComponent` - Para estados de carga

### Estilos CSS comunes:

```css
.container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 500;
  color: #1a237e;
}

.table-card {
  padding: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state mat-icon {
  font-size: 64px;
  width: 64px;
  height: 64px;
  color: #bdbdbd;
  margin-bottom: 16px;
}
```

---

## CHECKLIST DE VALIDACIÓN

Después de implementar, verifica:

- [ ] `AdjustmentsListComponent` creado y compilando sin errores
- [ ] `TransfersListComponent` creado y compilando sin errores
- [ ] Imports agregados en `app.routes.ts`
- [ ] Rutas actualizadas en `app.routes.ts`
- [ ] Opciones agregadas/descomentadas en `menu.model.ts`
- [ ] No hay errores de compilación TypeScript
- [ ] El menú Inventario muestra 4 opciones (Stock, Kardex, Ajustes, Transferencias)

---

## NOTAS IMPORTANTES

1. **No necesitas crear formularios de creación aún**, solo listas que consultan el Kardex
2. Los botones "Nuevo Ajuste" y "Nueva Transferencia" pueden estar **disabled** por ahora
3. El backend ya filtra los movimientos por `reference_type` cuando se pasa el parámetro
4. Los componentes deben ser **standalone** (imports array en @Component)
5. Usa **Material Design** para mantener consistencia con el resto de la app

---

## RESUMEN EJECUTIVO

**Objetivo:** Completar módulo de Ajustes y Transferencias de inventario

**Archivos a crear:**

1. `src/app/components/adjustments-list/adjustments-list.component.ts`
2. `src/app/components/transfers-list/transfers-list.component.ts`

**Archivos a modificar:**

1. `src/app/app.routes.ts` (imports + rutas)
2. `src/app/models/menu.model.ts` (opciones de menú)

**Tiempo estimado:** 30-45 minutos

**Prioridad:** Alta (para completar módulo de Inventario)

---

**¡Hazlo paso a paso y confirma que cada archivo compila correctamente antes de continuar con el siguiente!**
