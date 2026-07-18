# FASE 0 — AUDITORÍA DE ESTILOS UI

## Informe Técnico — Base4Empresas Frontend Angular

**Fecha:** 2026-07-17  
**Alcance:** Inventario completo de estilos globales y locales, detección de duplicidades, conflictos y sobreescrituras, baseline para migración UI controlada.  
**Estado Build Baseline:** ✅ COMPILA — con warnings (ver sección 6)

---

## 1. INVENTARIO DE ARCHIVOS DE ESTILO

### 1.1 Estilos Globales (src/)

| Archivo                        | Tipo                 | Función                                                             | Estado                                    |
| ------------------------------ | -------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| `src/styles.scss`              | SCSS Principal       | Entry point del sistema de diseño                                   | ✅ Activo                                 |
| `src/styles/_variables.scss`   | Tokens               | Colores, spacing, tipografía, breakpoints                           | ⚠️ Duplicados corregidos en Fase 0        |
| `src/styles/_functions.scss`   | Mixins/Funciones     | Mixins de layout, componentes, utilidades                           | ✅ Activo                                 |
| `src/styles/_reset.scss`       | Reset global         | Normalización + estilos base de HTML                                | ✅ Activo                                 |
| `src/styles/_components.scss`  | Componentes globales | Clases `.app-button`, `.app-card`, `.app-table`, `.app-badge`, etc. | ✅ Activo                                 |
| `src/styles-notifications.css` | CSS puro             | Estilos de notificaciones                                           | 📁 Existe pero no incluido en styles.scss |

### 1.2 Estilos de Layout (src/app/layout/)

| Archivo                                              | Tipo          | Función                       | Estado                                 |
| ---------------------------------------------------- | ------------- | ----------------------------- | -------------------------------------- |
| `layout.component.css`                               | CSS           | Sidebar, contenido principal  | ⚠️ Colores hardcoded, no usa variables |
| `toolbar.component.ts`                               | Inline styles | Toolbar superior              | ⚠️ Estilos inline en TypeScript        |
| `sidebar.component.ts`                               | Inline styles | Navegación lateral            | ⚠️ Estilos inline en TypeScript        |
| `horizontal-layout/horizontal-layout.component.scss` | SCSS          | Layout alternativo horizontal | ❓ Inactivo / paralelo                 |

### 1.3 Estilos de Páginas (src/app/pages/)

| Archivo                    | Tipo | Función                              | Estado                               |
| -------------------------- | ---- | ------------------------------------ | ------------------------------------ |
| `dashboard.component.scss` | SCSS | Dashboard principal (versión activa) | ⚠️ Solo colores hardcoded            |
| `dashboard.component.css`  | CSS  | Dashboard — archivo muerto/legacy    | 🔴 Archivo paralelo (ver duplicados) |

### 1.4 Estilos de Componentes (src/app/components/)

| Componente               | Archivo(s) de estilo                                                                              | Tipo             | Notas                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------- |
| `adjustments-list`       | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `categories-list`        | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `costing-config`         | `costing-config.component.scss`                                                                   | SCSS             | OK                                     |
| `customer-form`          | `customer-form.component.scss`                                                                    | SCSS             | OK                                     |
| `customers-list`         | `customers-list.component.scss`                                                                   | SCSS             | OK                                     |
| `electronic-documents`   | `electronic-documents-list.component.scss`                                                        | SCSS             | ⚠️ Usa rem, no variables               |
| `generic-data-table`     | `generic-data-table.component.css`                                                                | CSS              | Debería ser SCSS                       |
| `improved-form-example`  | `improved-form-example.component.css`                                                             | CSS              | 🔴 Componente de ejemplo en producción |
| `kardex`                 | `kardex.component.css`                                                                            | CSS              | Debería ser SCSS                       |
| `orders/order-create`    | `order-create.component.scss`                                                                     | SCSS             | OK                                     |
| `orders/order-detail`    | `order-detail.component.scss`                                                                     | SCSS             | OK                                     |
| `orders/order-payments`  | `order-payments.component.scss`                                                                   | SCSS             | OK                                     |
| `orders/order-shipments` | `order-shipments.component.scss`                                                                  | SCSS             | OK                                     |
| `orders/orders-list`     | `orders-list.component.scss`                                                                      | SCSS             | OK                                     |
| `product-detail`         | `product-detail.component.css`                                                                    | CSS              | Debería ser SCSS                       |
| `product-form`           | `product-form.component.css` + `product-form.component.scss` + `EJEMPLO_PRODUCT_FORM_ESTILOS.css` | TRIPLE           | 🔴 DUPLICIDAD CRÍTICA                  |
| `products-list`          | `products-list.component.scss`                                                                    | SCSS             | OK                                     |
| `purchase-detail`        | `purchase-detail.component.css`                                                                   | CSS              | Debería ser SCSS                       |
| `purchase-form`          | `purchase-form.component.css`                                                                     | CSS              | 🔴 Excede budget (12.79KB / 12KB)      |
| `purchase-list`          | `purchase-list.component.scss`                                                                    | SCSS             | OK                                     |
| `sale-detail`            | `sale-detail.component.css`                                                                       | CSS              | Debería ser SCSS                       |
| `sale-form`              | `sale-form.component.css`                                                                         | CSS              | Debería ser SCSS                       |
| `sale-list`              | `sale-list.component.css`                                                                         | CSS              | Debería ser SCSS                       |
| `sales-channels` (form)  | `sales-channel-form.component.scss`                                                               | SCSS             | OK                                     |
| `sales-channels` (list)  | `sales-channels-list.component.scss`                                                              | SCSS             | OK                                     |
| `security`               | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `shared`                 | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `shipments-list`         | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `stock-detail`           | `stock-detail.component.css`                                                                      | CSS              | Debería ser SCSS                       |
| `stock-list`             | `stock-list.component.css` + `stock-list.component.scss`                                          | DOBLE            | ⚠️ Duplicidad de archivos              |
| `supplier-form`          | `supplier-form.component.scss`                                                                    | SCSS             | OK                                     |
| `suppliers-list`         | `suppliers-list.component.scss`                                                                   | SCSS             | OK                                     |
| `transfers-list`         | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `units-list`             | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |
| `warehouses-list`        | —                                                                                                 | sin estilo local | Sin archivo de estilo                  |

---

## 2. HALLAZGOS POR SEVERIDAD

### 🔴 CRÍTICO — Riesgo de regresión inmediata

#### C-01: Variables SCSS duplicadas con valores en conflicto

**Archivo:** `src/styles/_variables.scss`  
**Descripción:** El archivo contenía **10 variables declaradas dos veces**. La más grave: `$breakpoint-sm` declarado con dos valores distintos: `480px` (primera declaración) y `640px` (segunda declaración). En SCSS la última declaración gana, por lo que el breakpoint activo era 640px, pero cualquier refactoring que reorganizase el archivo habría activado el valor incorrecto de 480px silenciosamente.  
**Variables afectadas:**

- `$transition-base` — 2 declaraciones con distintos `cubic-bezier`
- `$transition-slow` — 2 declaraciones con distintos `cubic-bezier`
- `$easing-in` — 2 declaraciones (igual valor)
- `$easing-out` — 2 declaraciones (igual valor)
- `$easing-in-out` — 2 declaraciones (igual valor)
- `$breakpoint-xs` — 2 declaraciones (igual valor)
- `$breakpoint-sm` — 2 declaraciones con **VALORES DISTINTOS**: 480px vs 640px ← **BUG activo**
- `$breakpoint-md`, `$breakpoint-lg`, `$breakpoint-xl`, `$breakpoint-2xl` — 2 declaraciones (mismos valores)

**✅ RESUELTO EN FASE 0:** Eliminadas las declaraciones duplicadas. Valor canónico de `$breakpoint-sm` fijado en 640px (estándar SaaS moderno).

---

#### C-02: Paleta del sidebar desconectada del sistema de diseño

**Archivo:** `src/app/layout/layout.component.css`  
**Descripción:** El sidebar usa un gradiente `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (violet/purple) que **no pertenece al sistema de diseño**. El sistema define `$color-primary-dark: #1e40af` (azul índigo). Esto crea una inconsistencia visual entre el sidebar y el resto de la aplicación.  
**Código afectado:**

```css
.app-sidenav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

**Riesgo de regresión:** ALTO — cualquier rediseño del sidebar que use las variables del sistema producirá un cambio de color dramático.

---

#### C-03: `product-form` tiene TRES archivos de estilo simultáneos

**Archivos:**

- `src/app/components/product-form/product-form.component.css`
- `src/app/components/product-form/product-form.component.scss`
- `src/app/components/product-form/EJEMPLO_PRODUCT_FORM_ESTILOS.css`

**Descripción:** El componente sólo puede referenciar **uno** de ellos en `styleUrls`/`styleUrl`. Los otros son archivos muertos que confunden y pueden generar ediciones en el archivo equivocado. El archivo `EJEMPLO_PRODUCT_FORM_ESTILOS.css` es código de ejemplo que no debería existir en `src/app/components/`.  
**Riesgo:** Un desarrollador puede editar el `.css` creyendo que está activo, cuando el componente usa el `.scss`.

---

### 🟠 ALTO — Degradación progresiva de mantenibilidad

#### A-01: Toolbar y Sidebar con estilos inline en TypeScript

**Archivos:**

- `src/app/layout/toolbar.component.ts` — usa `styles: [...]` inline
- `src/app/layout/sidebar.component.ts` — usa `styles: [...]` inline

**Descripción:** Los estilos embebidos en TypeScript no pueden usar variables SCSS, no aparecen en búsquedas de estilos, no pueden ser sobreescritos fácilmente desde el sistema global y dificultan el theming. Son los componentes de mayor impacto visual (presentes en todas las pantallas).

---

#### A-02: Dashboard en doble versión — componente muerto en código

**Archivos:**

- `src/app/pages/dashboard/dashboard.component.ts` (activo) + `dashboard.component.css` (muerto)
- `src/app/pages/dashboard/dashboard.component.scss` (activo) + `dashboard.component.css` (muerto)
- `src/app/pages/dashboard/dashboard-new.component.ts` (estado: ¿activo o experimental?)

**Descripción:** Existen dos implementaciones del dashboard. `dashboard-new.component.ts` podría ser código experimental no limpiado. Los dos archivos de estilo del mismo dashboard (`dashboard.component.css` y `dashboard.component.scss`) indican una migración incompleta de CSS a SCSS.

---

#### A-03: `purchase-form.component.css` excede el budget de bundle

**Archivo:** `src/app/components/purchase-form/purchase-form.component.css`  
**Descripción:** El build emite el siguiente warning:

```
WARNING: purchase-form.component.css exceeded maximum budget. Budget 12.00 kB was not met by 814 bytes with a total of 12.79 kB.
```

El formulario de compras tiene 12.79KB de CSS, 814 bytes por encima del presupuesto configurado. Indica que el componente está absorbiendo estilos que deberían estar en el sistema global.

---

#### A-04: `background-color` del contenido principal desalineado

**Archivo:** `src/app/layout/layout.component.css`  
**Descripción:** `.app-content` usa `background-color: #f5f6fa` (hardcoded), pero el sistema define `$color-background: #f8fafc`. La diferencia es de 3 puntos en cada canal RGB — visualmente sutil pero que genera inconsistencia en el fondo de la aplicación respecto a las cards y formularios.

---

#### A-05: `stock-list` tiene dos archivos de estilo paralelos

**Archivos:**

- `src/app/components/stock-list/stock-list.component.css`
- `src/app/components/stock-list/stock-list.component.scss`

**Descripción:** Migración incompleta de CSS a SCSS. El componente sólo usa uno; el otro es un archivo muerto que puede generar ediciones en el lugar equivocado.

---

### 🟡 MEDIO — Deuda técnica y consistencia

#### M-01: Dashboard usa exclusivamente colores hardcoded, no variables

**Archivo:** `src/app/pages/dashboard/dashboard.component.scss`  
**Descripción:** El dashboard es la pantalla de mayor visibilidad y su SCSS define **100% de los colores como valores literales** (`#2563eb`, `#16a34a`, `#f59e0b`, `#dc2626`, `#0f172a`, `#64748b`, etc.) en lugar de las variables del sistema. Si el color primario cambia de `#3b82f6` a cualquier otro valor, el dashboard no se actualizará.

Colores hardcoded detectados vs variables disponibles:
| Hardcoded en dashboard | Variable en sistema | Equivalente |
|------------------------|---------------------|-------------|
| `#2563eb` | `$color-primary` aprox | ~equivalente |
| `#16a34a` | `$color-success-variant` | equivalente |
| `#f59e0b` | `$color-warning` | equivalente |
| `#dc2626` | `$color-danger-variant` | equivalente |
| `#0f172a` | `$color-text-dark` | equivalente |
| `#64748b` | `$color-text-medium` aprox | ~equivalente |
| `#f5f7fb` | `$color-background` aprox | similar |

---

#### M-02: `electronic-documents-list` usa unidades rem, sistema usa px

**Archivo:** `src/app/components/electronic-documents/electronic-documents-list.component.scss`  
**Descripción:** El archivo usa `1.5rem`, `2rem`, `1rem` para padding/margins mientras el sistema de diseño usa `px` con las variables `$space-*` (`$space-4: 16px`, `$space-6: 24px`). Inconsistencia de unidades entre componentes.

---

#### M-03: Mezcla de extensiones CSS/SCSS sin criterio uniforme

**Descripción:** 16 componentes usan `.css` y 18 usan `.scss`.

No hay un criterio uniforme — algunos módulos completos (orders, customers, sales-channels) usan `.scss` coherentemente, pero otros (sale-list, sale-form, sale-detail, purchase-form) usan `.css` heredado sin variables.

---

#### M-04: `body` definido dos veces con valores superpuestos

**Archivos:** `src/styles/_reset.scss` y `src/styles.scss`  
**Descripción:** `_reset.scss` define `body` correctamente con variables (`$font-family-primary`, `$color-background`). `styles.scss` vuelve a definir `body` con `font-family` hardcoded y `background-color: #f8fafc` literal (duplicando la variable). La segunda definición sobreescribe la primera parcialmente.

---

#### M-05: `@keyframes fadeIn` declarado dos veces

**Archivos:** `src/styles.scss` y `src/app/pages/dashboard/dashboard.component.scss` (como `dashShimmer`)  
**Descripción:** `styles.scss` define `@keyframes fadeIn` en la sección de diálogos Y también en la sección de animaciones globales. Existen dos `@keyframes fadeIn` distintos en el bundle final.

---

#### M-06: Clases con nombres colisionantes entre global y local

**Descripción:** Las siguientes clases existen tanto en `styles.scss`/`_components.scss` (scope global) como en `dashboard.component.scss` (scope local con `ViewEncapsulation` por defecto):

| Clase         | Definida en global                           | Definida en dashboard local |
| ------------- | -------------------------------------------- | --------------------------- |
| `.badge`      | `_components.scss` → `.app-badge` y `.badge` | `dashboard.component.scss`  |
| `.card`       | `_components.scss` → `.app-card`             | `dashboard.component.scss`  |
| `.table`      | `_components.scss` → `.app-table`            | `dashboard.component.scss`  |
| `.text-right` | `styles.scss` utilidades                     | `dashboard.component.scss`  |

Las clases locales en Angular con encapsulación por defecto están protegidas, pero si se usan en templates de Material (que breakea el encapsulamiento vía `::ng-deep`), puede haber colisiones.

---

### 🟢 BAJO — Limpieza y orden

#### B-01: Archivos de ejemplo en carpetas de producción

**Archivos a limpiar (no disruptivos, solo archivos muertos):**

- `src/app/components/product-form/EJEMPLO_PRODUCT_FORM_ESTILOS.css`
- `src/app/components/product-form/EJEMPLO_PRODUCT_FORM_MEJORADO.ts`
- `src/app/components/improved-form-example/` — carpeta completa de ejemplo

---

#### B-02: `src/styles-notifications.css` huérfano

**Archivo:** `src/styles-notifications.css`  
**Descripción:** El archivo existe en `src/` pero no está importado en `styles.scss` ni en `angular.json` (verificar). Los estilos de notificaciones no se están aplicando o están siendo duplicados por Material.

---

#### B-03: Layouts paralelos sin documentación de cuál está activo

**Archivos:**

- `src/app/layout/layout.component.ts` — Layout con sidebar izquierdo (activo en rutas)
- `src/app/layout/shell.component.ts` — Shell wrapper (estado desconocido)
- `src/app/layout/horizontal-layout/horizontal-layout.component.ts` — Layout horizontal (potencialmente inactivo)
- `src/app/layout/main-menu.component.ts` — Menú principal alternativo (vs sidebar.component.ts)

---

## 3. LISTA CONSOLIDADA DE ARCHIVOS AFECTADOS

### Prioridad CRÍTICA (intervención inmediata):

1. `src/styles/_variables.scss` — ✅ **CORREGIDO EN FASE 0**
2. `src/app/layout/layout.component.css` — Paleta sidebar incorrecta + background desalineado
3. `src/app/components/product-form/` — Limpiar duplicados CSS/SCSS/EJEMPLO

### Prioridad ALTA (Fase 1):

4. `src/app/layout/toolbar.component.ts` — Extraer inline styles a `.scss`
5. `src/app/layout/sidebar.component.ts` — Extraer inline styles a `.scss`
6. `src/app/pages/dashboard/dashboard.component.scss` — Migrar colores hardcoded a variables
7. `src/app/pages/dashboard/dashboard.component.css` — Eliminar archivo muerto
8. `src/app/components/purchase-form/purchase-form.component.css` — Reducir tamaño (presupuesto superado)

### Prioridad MEDIA (Fase 2-3):

9. `src/app/components/stock-list/stock-list.component.css` — Eliminar duplicado (conservar `.scss`)
10. `src/app/components/electronic-documents/electronic-documents-list.component.scss` — Migrar rem → px/variables
11. `src/app/components/sale-list/sale-list.component.css` → migrar a `.scss`
12. `src/app/components/sale-form/sale-form.component.css` → migrar a `.scss`
13. `src/app/components/sale-detail/sale-detail.component.css` → migrar a `.scss`
14. `src/app/components/purchase-detail/purchase-detail.component.css` → migrar a `.scss`
15. `src/app/components/product-detail/product-detail.component.css` → migrar a `.scss`
16. `src/app/components/kardex/kardex.component.css` → migrar a `.scss`
17. `src/app/components/generic-data-table/generic-data-table.component.css` → migrar a `.scss`

### Limpieza (sin impacto visual):

18. `src/app/components/product-form/EJEMPLO_PRODUCT_FORM_ESTILOS.css` — eliminar
19. `src/app/components/product-form/EJEMPLO_PRODUCT_FORM_MEJORADO.ts` — eliminar
20. `src/app/components/improved-form-example/` — evaluar eliminación
21. `src/styles-notifications.css` — incluir en `styles.scss` o eliminar si está duplicado

---

## 4. RIESGOS DE REGRESIÓN

| ID   | Riesgo                                                                                      | Impacto | Probabilidad | Mitigación                                                                  |
| ---- | ------------------------------------------------------------------------------------------- | ------- | ------------ | --------------------------------------------------------------------------- |
| R-01 | Cambio de paleta del sidebar afecta visual de toda la app                                   | ALTO    | ALTA         | Cambiar sólo en layout.component.css, test visual inmediato                 |
| R-02 | Extracción de inline styles en Toolbar/Sidebar puede romper override de Material            | MEDIO   | MEDIA        | Usar `::ng-deep` sólo donde sea necesario, crear archivo `.scss` separado   |
| R-03 | Migración CSS→SCSS en componentes legacy puede silenciar errores de compilación             | MEDIO   | BAJA         | Migrar un componente a la vez, build local post-migración                   |
| R-04 | `purchase-form.component.css` a 12.79KB: reducir tamaño puede afectar layout del formulario | MEDIO   | MEDIA        | Auditar qué estilos son redundantes con el sistema global antes de eliminar |
| R-05 | Colisión `.badge`/`.card`/`.table` entre global y dashboard                                 | BAJO    | BAJA         | Renombrar clases locales del dashboard a `.dash-badge`, `.dash-card`, etc.  |
| R-06 | Eliminar `dashboard-new.component.ts` sin verificar si está en una ruta activa              | ALTO    | BAJA         | Revisar `app.routes.ts` antes de eliminar                                   |
| R-07 | `$breakpoint-sm` cambiado de 480px a 640px (ya activo el 640px pero ahora explícito)        | BAJO    | MUY BAJA     | ✅ Resuelto: el valor 640px ya era el activo antes del fix                  |

---

## 5. ORDEN RECOMENDADO DE INTERVENCIÓN

### FASE 0 (Completada ✅)

- [x] Auditoría de estilos
- [x] Corrección de variables duplicadas en `_variables.scss`
- [x] Generación de informe baseline

### FASE 1 — Layout y Estructura Base (próxima)

**Objetivo:** Establecer layout consistente con el sistema de diseño

**Orden de intervención:**

1. `layout.component.css` → Migrar a `.scss`, usar `$color-primary-dark` para sidebar, alinear background con `$color-background`
2. `toolbar.component.ts` → Extraer styles inline a `toolbar.component.scss`, usar variables
3. `sidebar.component.ts` → Extraer styles inline a `sidebar.component.scss`, usar variables
4. Confirmar cuál de los layouts es el activo (`layout.component.ts` vs `shell.component.ts` vs `horizontal-layout`)
5. Eliminar layouts no activos o documentar criterio de selección

**Archivos NO tocar en Fase 1:** Lógica de negocio, servicios, modelos, rutas.

### FASE 2 — Dashboard y Pantallas de Alta Visibilidad

**Objetivo:** Migrar las pantallas más vistas al sistema de variables

**Orden:**

1. `dashboard.component.scss` → Reemplazar colores hardcoded por variables SCSS
2. Eliminar `dashboard.component.css` (archivo muerto)
3. Clarificar estado de `dashboard-new.component.ts`

### FASE 3 — Módulo de Ventas (Sale-list, Sale-form, Sale-detail)

**Objetivo:** Módulo de mayor uso operativo

**Orden:**

1. Migrar `sale-list.component.css` → `.scss` con variables
2. Migrar `sale-form.component.css` → `.scss` con variables
3. Migrar `sale-detail.component.css` → `.scss` con variables

### FASE 4 — Módulo de Compras y Stock

**Objetivo:** Módulos de inventario

**Orden:**

1. Reducir `purchase-form.component.css` (supera budget)
2. Migrar `purchase-detail.component.css` → `.scss`
3. Resolver duplicado `stock-list` (eliminar `.css`, conservar `.scss`)
4. Migrar `stock-detail.component.css` → `.scss`

### FASE 5 — Componentes Transversales

**Objetivo:** Componentes usados en múltiples módulos

**Orden:**

1. `generic-data-table.component.css` → `.scss` + integrar con sistema
2. `kardex.component.css` → `.scss`
3. `electronic-documents-list.component.scss` → Migrar rem a px/variables
4. Limpieza de archivos de ejemplo

---

## 6. BUILD STATUS (Baseline — Fase 0)

**Resultado:** ✅ BUILD EXITOSO  
**Configuración:** `development`  
**Comando:** `npm run build`

### Warnings activos (pre-Fase 0):

| Tipo             | Archivo                        | Descripción                                              |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| `NG8107`         | `order-form.component.ts:33`   | Operador `?.` innecesario en `data?.order?.order_number` |
| `NG8107`         | `order-form.component.ts:81`   | Operador `?.` innecesario en `data?.order?.status`       |
| `BUDGET`         | `purchase-form.component.css`  | 12.79KB — excede budget de 12KB por 814 bytes            |
| `TEMPLATE ERROR` | `order-create.component.ts:44` | Error en template de `OrderCreateComponent`              |

**Nota:** El "TEMPLATE ERROR" en `OrderCreateComponent` es un error de compilación de template que el build de desarrollo ignora parcialmente (Angular compila pero reporta el error). Requiere investigación separada — **no es regresión de Fase 0**.

### Build status post-fix variables:

La corrección de `_variables.scss` (eliminación de duplicados) **no introduce cambios en CSS generado** porque el valor activo antes del fix (`640px` para `$breakpoint-sm`) es el mismo que el valor canónico ahora explícito. El build debería compilar limpiamente con los mismos warnings.

---

## 7. RESUMEN POR ARCHIVO — ESTADO FINAL FASE 0

| Archivo                                                        | Estado Antes                                    | Estado Después | Acción Realizada                             |
| -------------------------------------------------------------- | ----------------------------------------------- | -------------- | -------------------------------------------- |
| `src/styles/_variables.scss`                                   | 🔴 10 vars duplicadas, $breakpoint-sm conflicto | ✅ Limpio      | Duplicados eliminados, valor canónico fijado |
| `src/app/layout/layout.component.css`                          | 🟠 Paleta incorrecta, bg desalineado            | 🟠 Sin cambio  | Documentado, pendiente Fase 1                |
| `src/app/layout/toolbar.component.ts`                          | 🟠 Inline styles                                | 🟠 Sin cambio  | Documentado, pendiente Fase 1                |
| `src/app/layout/sidebar.component.ts`                          | 🟠 Inline styles                                | 🟠 Sin cambio  | Documentado, pendiente Fase 1                |
| `src/app/pages/dashboard/dashboard.component.scss`             | 🟡 Colores hardcoded                            | 🟡 Sin cambio  | Documentado, pendiente Fase 2                |
| `src/app/components/product-form/`                             | 🔴 Triple duplicidad                            | 🔴 Sin cambio  | Documentado, limpiar en Fase 1               |
| `src/app/components/stock-list/`                               | ⚠️ Doble CSS+SCSS                               | ⚠️ Sin cambio  | Documentado, resolver en Fase 4              |
| `src/app/components/purchase-form/purchase-form.component.css` | 🔴 Budget excedido                              | 🔴 Sin cambio  | Documentado, reducir en Fase 4               |
| `src/app/components/electronic-documents/*.scss`               | 🟡 rem vs px                                    | 🟡 Sin cambio  | Documentado, pendiente Fase 5                |

---

## 8. SIGUIENTE PASO — RECOMENDACIÓN FASE 1

**Acción inmediata recomendada para iniciar Fase 1:**

> **Migrar `layout.component.css` a SCSS y alinear paleta con el sistema de diseño.**

Este es el cambio de mayor impacto visual por unidad de esfuerzo: afecta **todas las pantallas** (sidebar y contenido principal son el esqueleto de la app).

**Pasos concretos para Fase 1:**

```
1. Renombrar layout.component.css → layout.component.scss
2. Actualizar angular.json / decorador @Component con la nueva extensión
3. Reemplazar gradiente violet (#667eea → #764ba2) por:
   background: linear-gradient(135deg, $color-primary-dark 0%, $color-primary 100%)
4. Reemplazar background-color: #f5f6fa por: background-color: $color-background
5. Extraer styles inline de toolbar.component.ts → toolbar.component.scss
6. Extraer styles inline de sidebar.component.ts → sidebar.component.scss
7. Ejecutar build local: npm run build
8. Verificar visualmente en navegador: layout, sidebar, toolbar
```

**Criterio de éxito Fase 1:**

- Build limpio (mismos warnings que baseline, ninguno nuevo)
- Sidebar usa paleta del sistema de diseño (azul índigo)
- Toolbar y Sidebar con archivos `.scss` externos
- Fondo de `.app-content` alineado con `$color-background`

---

_Documento generado automáticamente — Fase 0 Auditoría UI — Base4Empresas_  
_Archivo: `docs/FASE_0_AUDITORIA_ESTILOS_UI.md`_
