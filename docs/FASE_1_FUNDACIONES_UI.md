# FASE 1 — FUNDACIONES UI (Tokens y Base Visual)

## Informe de Implementación — Base4Empresas Frontend Angular

**Fecha:** 2026-07-18  
**Rama:** `feat/ui-fase-1-fundaciones`  
**Base:** `feat/ui-redesign` (incluye Fase 0 completada)  
**Build Status:** ✅ EXITOSO — sin nuevos warnings respecto al baseline

---

## 1. ARCHIVOS CREADOS Y MODIFICADOS

### Archivos CREADOS (nuevos)

| Archivo                        | Tipo       | Descripción                                                                                                                                                                           |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/_tokens.scss`      | SCSS nuevo | CSS Custom Properties en `:root` — expone todos los tokens SCSS como variables CSS nativas                                                                                            |
| `src/styles/_foundations.scss` | SCSS nuevo | Capa fundacional: focus ring, botones base, inputs base, `.status-badge`, `.section-card`, `.page-header`, `.form-section`, `.empty-state`, `.skeleton`, `.divider`, `[data-tooltip]` |

### Archivos MODIFICADOS (no disruptivos)

| Archivo                  | Cambio                                                                                                                                                                    | Impacto                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `src/styles.scss`        | Nuevos imports `_tokens` y `_foundations`, eliminado `body {}` duplicado con hardcoded, renombrado `@keyframes fadeIn` → `@keyframes backdropFadeIn` en sección de dialog | Bajo — misma apariencia visual                     |
| `src/styles/_reset.scss` | Agregado `overflow-x: hidden` al `body`                                                                                                                                   | Bajo — ya existía en el `body` hardcoded eliminado |

---

## 2. ARQUITECTURA DE ESTILOS — ESTRUCTURA EN CAPAS

El sistema de estilos ahora sigue una cascada en 6 capas bien definidas:

```
┌─────────────────────────────────────────────────────────────┐
│  Capa 1: _variables.scss   — Tokens SCSS (build-time)       │
│  Capa 2: _tokens.scss      — CSS Custom Properties (:root)  │  ← NUEVO
│  Capa 3: _reset.scss       — Normalización HTML5            │
│  Capa 4: _foundations.scss — Elementos interactivos base    │  ← NUEVO
│  Capa 5: _components.scss  — Clases reutilizables (.app-*)  │
│  Capa 6: styles.scss       — Overrides Material + utilidades│
└─────────────────────────────────────────────────────────────┘
```

### Principio de uso por capa:

- **Capa 1 (`$variable`)** → usar en archivos SCSS de componentes Angular. Resuelto en build-time, cero overhead en runtime.
- **Capa 2 (`var(--token)`)** → usar cuando se necesite theming dinámico, acceso desde JavaScript, o en componentes que no pueden importar SCSS.
- **Capa 4 (clases fundacionales)** → clases base como `.status-badge`, `.page-header`, `.section-card` disponibles globalmente en templates Angular sin necesidad de importar.

---

## 3. DETALLE DE `_tokens.scss` — CSS Custom Properties

Todos los tokens del sistema de diseño están ahora disponibles como CSS Custom Properties en `:root`. Esto habilita:

### ✅ Theming dinámico desde JavaScript

```typescript
// Cambiar color primario en runtime (futuro dark mode / multi-tenant)
document.documentElement.style.setProperty("--color-primary", "#6366f1");
```

### ✅ Uso en componentes que no usan SCSS

```css
/* En componentes con styleUrls: ['.component.css'] */
.mi-elemento {
  color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
}
```

### ✅ Inspección en DevTools

Todos los tokens son visibles en el panel Elements > :root de Chrome/Firefox DevTools.

**Tokens expuestos:** colores primarios, secundarios, neutrales, de estado, spacing, tipografía, border-radius, sombras, transiciones, dimensiones de layout, z-index.

---

## 4. DETALLE DE `_foundations.scss` — Componentes Fundacionales

### 4.1 Focus Ring Accesible (WCAG 2.1 AA)

```scss
:focus-visible {
  outline: 2px solid $color-primary;
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none; // Sin outline en click, solo en teclado
}
```

Aplica a todos los elementos interactivos. Compatible con Angular Material (que tiene su propio focus, pero este actúa como fallback).

### 4.2 Clase `.status-badge` — Badge de estado unificado

Reemplaza los badges ad-hoc en componentes individuales. Uso:

```html
<span class="status-badge status-active">Activo</span>
<span class="status-badge status-pending">Pendiente</span>
<span class="status-badge status-danger">Cancelado</span>
```

**Variantes disponibles:** `status-active`, `status-success`, `status-completed`, `status-pending`, `status-warning`, `status-partial`, `status-inactive`, `status-danger`, `status-cancelled`, `status-error`, `status-draft`, `status-info`, `status-processing`, `status-neutral`, `status-default`, `status-primary`.

### 4.3 Clase `.section-card` — Card semántica

```html
<div class="section-card">
  <div class="section-card__header">
    <h3 class="section-card__title">Título</h3>
    <button>Acción</button>
  </div>
  <div class="section-card__body">Contenido</div>
  <div class="section-card__footer">Pie</div>
</div>
```

### 4.4 Clase `.page-header` — Encabezado de módulo

```html
<div class="page-header">
  <div class="page-header__title-group">
    <h1 class="page-header__title">Ventas</h1>
    <p class="page-header__subtitle">Gestión de órdenes de venta</p>
  </div>
  <div class="page-header__actions">
    <button mat-raised-button color="primary">Nueva venta</button>
  </div>
</div>
```

### 4.5 Clase `.skeleton` — Loading skeleton

```html
<div class="skeleton skeleton--title"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--row"></div>
```

### 4.6 Clase `.empty-state` — Estado vacío

```html
<div class="empty-state">
  <mat-icon class="empty-state__icon">inbox</mat-icon>
  <h3 class="empty-state__title">Sin resultados</h3>
  <p class="empty-state__message">No hay datos que coincidan con los filtros seleccionados.</p>
</div>
```

### 4.7 Atributo `[data-tooltip]` — Tooltip ligero

```html
<button data-tooltip="Eliminar registro">
  <mat-icon>delete</mat-icon>
</button>
```

---

## 5. CORRECCIONES APLICADAS EN `styles.scss`

### 5.1 Eliminación de `body {}` duplicado con valores hardcoded

**Antes (problemático):**

```scss
// En _reset.scss (con variables — correcto)
body { background-color: $color-background; font-family: $font-family-primary; ... }

// En styles.scss (hardcoded — duplicado incorrecto)
body {
  background-color: #f8fafc;  // ← hardcoded
  font-family: 'Inter', ...;  // ← hardcoded
}
```

**Después (correcto):**

- Solo existe la definición de `body` en `_reset.scss` con variables del sistema.
- `styles.scss` solo define `html, body { height: 100%; width: 100%; }` (lo que `_reset.scss` no puede establecer).
- `overflow-x: hidden` migrado a `_reset.scss`.

### 5.2 Resolución de conflicto `@keyframes fadeIn`

**Antes:** `@keyframes fadeIn` declarado **dos veces** en `styles.scss` con animaciones distintas (una para backdrop de dialog con blur, otra para fade general).

**Después:**

- `@keyframes backdropFadeIn` → animación del backdrop de dialog (con `backdrop-filter: blur`)
- `@keyframes fadeIn` → animación general de opacidad (única, sin conflicto)
- `.crm-dialog-backdrop { animation: backdropFadeIn 0.3s ease-out; }` actualizado

---

## 6. BUILD STATUS

**Resultado:** ✅ BUILD EXITOSO  
**Comando:** `npm run build`  
**Nuevos warnings introducidos:** 0

### Warnings activos (todos pre-existentes desde Fase 0):

| Tipo             | Archivo                        | Descripción                                       |
| ---------------- | ------------------------------ | ------------------------------------------------- |
| `NG8107`         | `order-form.component.ts:33`   | Operador `?.` innecesario (pre-existente)         |
| `NG8107`         | `order-form.component.ts:81`   | Operador `?.` innecesario (pre-existente)         |
| `BUDGET`         | `purchase-form.component.css`  | 12.79KB / 12KB (pre-existente, Fase 4)            |
| `TEMPLATE ERROR` | `order-create.component.ts:44` | Error template (pre-existente, fuera de scope UI) |

---

## 7. DECISIONES DE ARQUITECTURA

### ¿Por qué `_tokens.scss` como capa separada y no dentro de `_variables.scss`?

- **Separación de responsabilidades:** `_variables.scss` es build-time (SCSS), `_tokens.scss` es runtime (CSS). Son capas distintas con propósitos distintos.
- **Optionalidad:** Un componente puede importar solo `_variables.scss` sin necesitar el output CSS de `_tokens.scss`.
- **Theming futuro:** Permite crear `_tokens-dark.scss` que solo sobreescriba las Custom Properties en un selector `[data-theme="dark"]` sin tocar las variables SCSS.

### ¿Por qué `_foundations.scss` en lugar de agregar todo a `_components.scss`?

- **Capas claras:** `_foundations` define estilo de **elementos** (sin clase o con clase utilitaria simple). `_components` define sistemas de clases complejos (`.app-button--primary`, `.app-card--hover`, etc.).
- **Orden de cascada:** Las fundaciones deben estar antes que los componentes para que estos puedan sobreescribir si es necesario.
- **Clases nuevas sin colisión:** `.status-badge`, `.section-card`, `.page-header`, `.form-section` son nombres nuevos que no colisionan con las clases existentes `.app-badge`, `.app-card`, etc.

### ¿Por qué mantener `_components.scss` y no migrar a `_foundations.scss`?

- **No romper vistas existentes** — `_components.scss` tiene clases `.app-button`, `.app-card`, `.app-table` que pueden estar en uso en templates. Migrarlas requiere búsqueda y reemplazo en HTMLs.
- Las clases de `_foundations.scss` son **complementarias**, no reemplazos. Se adoptarán gradualmente en Fases 2-5.

---

## 8. RIESGOS Y DEUDAS PENDIENTES

| ID   | Riesgo/Deuda                                                                                                                                                  | Severidad | Fase recomendada |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------- |
| D-01 | `_components.scss` y `_foundations.scss` tienen clases con nombres similares (`.app-badge` vs `.status-badge`). Documentar cuál usar en cada contexto.        | BAJO      | Fase 3           |
| D-02 | Toolbar y Sidebar aún tienen inline styles (no usan tokens).                                                                                                  | MEDIO     | Fase 2           |
| D-03 | `dashboard.component.scss` sigue usando colores hardcoded.                                                                                                    | MEDIO     | Fase 5           |
| D-04 | `purchase-form.component.css` sigue excediendo budget.                                                                                                        | MEDIO     | Fase 4           |
| D-05 | La clase `.section-card` de `_foundations.scss` puede colisionar con `.card` de `dashboard.component.scss` si Angular Material no encapsula bien. Monitorear. | BAJO      | Fase 5           |
| D-06 | `_tokens.scss` importa `variables` internamente — si se usa `@use` en el futuro (migración a Sass moderno), requerirá ajuste.                                 | MUY BAJO  | Post-Fase 5      |

---

## 9. GUÍA DE USO RÁPIDO — Nuevas clases disponibles

### Para desarrolladores en Fases 2-5:

```html
<!-- ✅ Encabezado de página de módulo -->
<div class="page-header">
  <div class="page-header__title-group">
    <h1 class="page-header__title">Nombre del módulo</h1>
    <p class="page-header__subtitle">Descripción breve</p>
  </div>
  <div class="page-header__actions"><!-- botones --></div>
</div>

<!-- ✅ Estado vacío -->
<div class="empty-state">
  <mat-icon class="empty-state__icon">folder_open</mat-icon>
  <h3 class="empty-state__title">Sin datos</h3>
  <p class="empty-state__message">Mensaje descriptivo</p>
</div>

<!-- ✅ Badge de estado (reemplaza badges ad-hoc) -->
<span class="status-badge status-active">Activo</span>
<span class="status-badge status-pending">Pendiente</span>
<span class="status-badge status-danger">Cancelado</span>

<!-- ✅ Skeleton loading -->
<div class="skeleton skeleton--title"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--row"></div>

<!-- ✅ Sección de formulario -->
<div class="form-section"></div>
```
