# 🎨 Guía de Diseño SaaS Profesional - Base4Empresas

## 📋 Índice

1. [Propuesta Visual](#propuesta-visual)
2. [Paleta de Colores](#paleta-de-colores)
3. [Sistema de Tokens SCSS](#sistema-de-tokens-scss)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Layout Principal](#layout-principal)
6. [Componentes](#componentes)
7. [Angular Material Customization](#angular-material-customization)
8. [Implementación Paso a Paso](#implementación-paso-a-paso)

---

## 🎯 Propuesta Visual

### Concepto General

Transformar Base4Empresas en una aplicación SaaS B2B moderna con:

- **Estilo**: Clean, profesional, confiable
- **Referencias**: Slack, Notion, Linear, Monday.com
- **Características**:
  - Sidebar oscuro con iconos Material
  - Toolbar limpio y minimalista
  - Cards con sombras suaves
  - Espaciado generoso
  - Tipografía clara y jerárquica
  - Colores sobrios y profesionales

### Principios de Diseño

1. **Claridad**: Información fácil de escanear
2. **Consistencia**: Patrones repetibles
3. **Jerarquía**: Guía visual clara
4. **Espaciado**: Respiración entre elementos
5. **Feedback**: Estados claros e inmediatos

---

## 🎨 Paleta de Colores

### Paleta Principal

```scss
// Primary - Azul Profesional
$primary-50: #e8eaf6;
$primary-100: #c5cae9;
$primary-200: #9fa8da;
$primary-300: #7986cb;
$primary-400: #5c6bc0;
$primary-500: #3f51b5; // Principal
$primary-600: #3949ab;
$primary-700: #303f9f;
$primary-800: #283593;
$primary-900: #1a237e;

// Secondary - Indigo/Violeta
$secondary-50: #ede7f6;
$secondary-100: #d1c4e9;
$secondary-200: #b39ddb;
$secondary-300: #9575cd;
$secondary-400: #7e57c2;
$secondary-500: #673ab7; // Principal
$secondary-600: #5e35b1;
$secondary-700: #512da8;
$secondary-800: #4527a0;
$secondary-900: #311b92;

// Neutral - Grises
$gray-50: #fafbfc;
$gray-100: #f4f5f7;
$gray-200: #e9ecef;
$gray-300: #dee2e6;
$gray-400: #ced4da;
$gray-500: #adb5bd;
$gray-600: #6c757d;
$gray-700: #495057;
$gray-800: #343a40;
$gray-900: #212529;

// Semánticos - Status
$success: #10b981; // Verde
$warning: #f59e0b; // Amber
$danger: #ef4444; // Rojo
$info: #3b82f6; // Azul

// Backgrounds
$bg-primary: #ffffff;
$bg-secondary: #fafbfc;
$bg-tertiary: #f4f5f7;

// Sidebar
$sidebar-bg: #1e293b; // Slate oscuro
$sidebar-text: #cbd5e1; // Slate claro
$sidebar-text-active: #fff;
$sidebar-hover: #334155;
$sidebar-active: #3f51b5;
```

### Uso de Colores

| Elemento             | Color           | Uso                           |
| -------------------- | --------------- | ----------------------------- |
| **Sidebar**          | `$sidebar-bg`   | Fondo del menú lateral        |
| **Toolbar**          | `#ffffff`       | Barra superior                |
| **Primary Button**   | `$primary-500`  | Acciones principales          |
| **Secondary Button** | `$gray-200`     | Acciones secundarias          |
| **Cards**            | `#ffffff`       | Contenedores de contenido     |
| **Background**       | `$bg-secondary` | Fondo de página               |
| **Text Primary**     | `$gray-900`     | Títulos y texto principal     |
| **Text Secondary**   | `$gray-600`     | Subtítulos y texto secundario |

---

## 🔧 Sistema de Tokens SCSS

### Archivo: `src/styles/_tokens.scss`

```scss
// ============================================
// DESIGN TOKENS - BASE4EMPRESAS
// Sistema de diseño profesional SaaS
// ============================================

// ============ COLORS ============

// Primary
$primary-50: #e8eaf6;
$primary-100: #c5cae9;
$primary-200: #9fa8da;
$primary-300: #7986cb;
$primary-400: #5c6bc0;
$primary-500: #3f51b5;
$primary-600: #3949ab;
$primary-700: #303f9f;
$primary-800: #283593;
$primary-900: #1a237e;

// Secondary
$secondary-50: #ede7f6;
$secondary-100: #d1c4e9;
$secondary-200: #b39ddb;
$secondary-300: #9575cd;
$secondary-400: #7e57c2;
$secondary-500: #673ab7;
$secondary-600: #5e35b1;
$secondary-700: #512da8;
$secondary-800: #4527a0;
$secondary-900: #311b92;

// Neutrals
$gray-50: #fafbfc;
$gray-100: #f4f5f7;
$gray-200: #e9ecef;
$gray-300: #dee2e6;
$gray-400: #ced4da;
$gray-500: #adb5bd;
$gray-600: #6c757d;
$gray-700: #495057;
$gray-800: #343a40;
$gray-900: #212529;

// Status
$success: #10b981;
$success-light: #d1fae5;
$success-dark: #047857;

$warning: #f59e0b;
$warning-light: #fef3c7;
$warning-dark: #d97706;

$danger: #ef4444;
$danger-light: #fee2e2;
$danger-dark: #dc2626;

$info: #3b82f6;
$info-light: #dbeafe;
$info-dark: #1d4ed8;

// Backgrounds
$bg-primary: #ffffff;
$bg-secondary: #fafbfc;
$bg-tertiary: #f4f5f7;

// Sidebar
$sidebar-bg: #1e293b;
$sidebar-text: #cbd5e1;
$sidebar-text-hover: #f1f5f9;
$sidebar-text-active: #ffffff;
$sidebar-hover: #334155;
$sidebar-active: $primary-500;
$sidebar-border: #334155;

// Text
$text-primary: $gray-900;
$text-secondary: $gray-600;
$text-tertiary: $gray-500;
$text-disabled: $gray-400;

// Borders
$border-light: #e9ecef;
$border-medium: #dee2e6;
$border-dark: #ced4da;

// ============ TYPOGRAPHY ============

$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;

$font-family-heading: $font-family-base;
$font-family-mono: "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Roboto Mono", monospace;

// Font Sizes
$font-size-xs: 0.75rem; // 12px
$font-size-sm: 0.875rem; // 14px
$font-size-base: 1rem; // 16px
$font-size-lg: 1.125rem; // 18px
$font-size-xl: 1.25rem; // 20px
$font-size-2xl: 1.5rem; // 24px
$font-size-3xl: 1.875rem; // 30px
$font-size-4xl: 2.25rem; // 36px

// Font Weights
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line Heights
$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;

// ============ SPACING ============

$spacing-0: 0;
$spacing-1: 0.25rem; // 4px
$spacing-2: 0.5rem; // 8px
$spacing-3: 0.75rem; // 12px
$spacing-4: 1rem; // 16px
$spacing-5: 1.25rem; // 20px
$spacing-6: 1.5rem; // 24px
$spacing-8: 2rem; // 32px
$spacing-10: 2.5rem; // 40px
$spacing-12: 3rem; // 48px
$spacing-16: 4rem; // 64px
$spacing-20: 5rem; // 80px

// ============ BORDER RADIUS ============

$radius-none: 0;
$radius-sm: 0.25rem; // 4px
$radius-base: 0.375rem; // 6px
$radius-md: 0.5rem; // 8px
$radius-lg: 0.75rem; // 12px
$radius-xl: 1rem; // 16px
$radius-2xl: 1.5rem; // 24px
$radius-full: 9999px;

// ============ SHADOWS ============

$shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-sm:
  0 1px 3px 0 rgba(0, 0, 0, 0.1),
  0 1px 2px -1px rgba(0, 0, 0, 0.1);
$shadow-base:
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -2px rgba(0, 0, 0, 0.1);
$shadow-md:
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -4px rgba(0, 0, 0, 0.1);
$shadow-lg:
  0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 8px 10px -6px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

// ============ TRANSITIONS ============

$transition-fast: 0.15s ease;
$transition-base: 0.2s ease;
$transition-slow: 0.3s ease;
$transition-slower: 0.5s ease;

// ============ Z-INDEX ============

$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;

// ============ BREAKPOINTS ============

$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

// ============ LAYOUT ============

$sidebar-width: 260px;
$sidebar-collapsed-width: 70px;
$toolbar-height: 64px;
$container-max-width: 1400px;

// ============ COMPONENTS ============

// Buttons
$btn-padding-y: $spacing-2;
$btn-padding-x: $spacing-4;
$btn-font-size: $font-size-sm;
$btn-border-radius: $radius-md;

// Inputs
$input-padding-y: $spacing-3;
$input-padding-x: $spacing-4;
$input-border-radius: $radius-md;
$input-border-color: $border-medium;
$input-focus-border-color: $primary-500;

// Cards
$card-padding: $spacing-6;
$card-border-radius: $radius-lg;
$card-shadow: $shadow-sm;
$card-hover-shadow: $shadow-md;

// Tables
$table-cell-padding-y: $spacing-3;
$table-cell-padding-x: $spacing-4;
$table-border-color: $border-light;
$table-header-bg: $bg-tertiary;
$table-hover-bg: $gray-50;
```

---

## 📁 Estructura de Archivos SCSS

```
src/
├── styles/
│   ├── _tokens.scss              # Design tokens
│   ├── _mixins.scss              # Mixins reutilizables
│   ├── _reset.scss               # Reset CSS
│   ├── _typography.scss          # Estilos tipográficos
│   ├── _utilities.scss           # Clases utilitarias
│   │
│   ├── components/
│   │   ├── _buttons.scss         # Botones
│   │   ├── _cards.scss           # Cards y contenedores
│   │   ├── _tables.scss          # Tablas
│   │   ├── _forms.scss           # Formularios
│   │   ├── _badges.scss          # Badges y etiquetas
│   │   ├── _modals.scss          # Modales y diálogos
│   │   └── _dashboard.scss       # Dashboard específico
│   │
│   ├── layout/
│   │   ├── _layout.scss          # Layout general
│   │   ├── _sidebar.scss         # Sidebar
│   │   ├── _toolbar.scss         # Toolbar
│   │   └── _content.scss         # Área de contenido
│   │
│   └── material/
│       └── _material-theme.scss  # Customización Material
│
└── styles.scss                    # Archivo principal
```

**Orden de importación en `styles.scss`:**

```scss
// 1. Tokens y configuración
@import "styles/tokens";
@import "styles/mixins";

// 2. Reset y base
@import "styles/reset";
@import "styles/typography";

// 3. Layout
@import "styles/layout/layout";
@import "styles/layout/sidebar";
@import "styles/layout/toolbar";
@import "styles/layout/content";

// 4. Componentes
@import "styles/components/buttons";
@import "styles/components/cards";
@import "styles/components/tables";
@import "styles/components/forms";
@import "styles/components/badges";
@import "styles/components/modals";
@import "styles/components/dashboard";

// 5. Material Theme
@import "styles/material/material-theme";

// 6. Utilidades (último)
@import "styles/utilities";
```

---

## 🏗️ Layout Principal

### Sidebar Profesional

**Archivo: `src/styles/layout/_sidebar.scss`**

```scss
@import "../tokens";

.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: $sidebar-width;
  background: $sidebar-bg;
  display: flex;
  flex-direction: column;
  transition: width $transition-base;
  z-index: $z-index-fixed;
  box-shadow: $shadow-lg;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  // Header del sidebar
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-4;
    height: $toolbar-height;
    border-bottom: 1px solid $sidebar-border;
    min-height: $toolbar-height;

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: $spacing-3;
      color: $sidebar-text-active;
      text-decoration: none;
      transition: opacity $transition-base;

      &:hover {
        opacity: 0.9;
      }

      .brand-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $primary-500;
        border-radius: $radius-md;
        font-size: $font-size-lg;
        flex-shrink: 0;
      }

      .brand-text {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        letter-spacing: -0.02em;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: $sidebar-text;
      cursor: pointer;
      border-radius: $radius-base;
      transition: all $transition-base;
      flex-shrink: 0;

      &:hover {
        background: $sidebar-hover;
        color: $sidebar-text-active;
      }
    }
  }

  // Navegación
  .sidebar-nav {
    flex: 1;
    padding: $spacing-4 $spacing-3;
    overflow-y: auto;
    overflow-x: hidden;

    // Grupos de navegación
    .nav-group {
      margin-bottom: $spacing-6;

      .nav-group-title {
        padding: $spacing-2 $spacing-3;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        color: $sidebar-text;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.6;
        white-space: nowrap;
        overflow: hidden;
      }

      .nav-items {
        display: flex;
        flex-direction: column;
        gap: $spacing-1;
      }
    }

    // Items de navegación
    .nav-item {
      display: flex;
      align-items: center;
      gap: $spacing-3;
      padding: $spacing-3 $spacing-3;
      color: $sidebar-text;
      text-decoration: none;
      border-radius: $radius-md;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      transition: all $transition-base;
      cursor: pointer;
      position: relative;
      white-space: nowrap;

      .nav-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 20px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .nav-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 $spacing-2;
        background: $primary-500;
        color: white;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        border-radius: $radius-full;
        flex-shrink: 0;
      }

      // Hover state
      &:hover {
        background: $sidebar-hover;
        color: $sidebar-text-hover;
      }

      // Active state
      &.active {
        background: rgba($primary-500, 0.15);
        color: $sidebar-text-active;
        font-weight: $font-weight-semibold;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background: $primary-500;
          border-radius: 0 $radius-sm $radius-sm 0;
        }

        .nav-icon {
          color: $primary-500;
        }
      }
    }
  }

  // Footer del sidebar
  .sidebar-footer {
    padding: $spacing-4;
    border-top: 1px solid $sidebar-border;

    .user-profile {
      display: flex;
      align-items: center;
      gap: $spacing-3;
      padding: $spacing-3;
      background: $sidebar-hover;
      border-radius: $radius-md;
      cursor: pointer;
      transition: background $transition-base;

      &:hover {
        background: rgba($sidebar-hover, 1.2);
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: $radius-full;
        background: $primary-500;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: $font-weight-semibold;
        font-size: $font-size-sm;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        overflow: hidden;

        .user-name {
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          color: $sidebar-text-active;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: $font-size-xs;
          color: $sidebar-text;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  // Estado colapsado
  &.collapsed {
    .sidebar-header {
      .brand-text {
        display: none;
      }
    }

    .sidebar-nav {
      .nav-group-title {
        display: none;
      }

      .nav-item {
        justify-content: center;

        .nav-label,
        .nav-badge {
          display: none;
        }
      }
    }

    .sidebar-footer {
      .user-info {
        display: none;
      }
    }
  }

  // Scrollbar personalizado
  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-nav::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba($sidebar-text, 0.2);
    border-radius: $radius-full;

    &:hover {
      background: rgba($sidebar-text, 0.3);
    }
  }

  // Responsive
  @media (max-width: $breakpoint-md) {
    transform: translateX(-100%);
    transition: transform $transition-base;

    &.open {
      transform: translateX(0);
    }

    &.collapsed {
      width: $sidebar-width;
    }
  }
}
```

### Toolbar Moderno

**Archivo: `src/styles/layout/_toolbar.scss`**

```scss
@import '../tokens';

.app-toolbar {
  position: fixed;
  top: 0;
  left: $sidebar-width;
  right: 0;
  height: $toolbar-height;
  background: $bg-primary;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-6;
  gap: $spacing-6;
  z-index: $z-index-sticky;
  transition: left $transition-base;
  box-shadow: $shadow-xs;

  &.sidebar-collapsed {
    left: $sidebar-collapsed-width;
  }

  // Sección izquierda
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: $spacing-4;

    .menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      color: $text-secondary;
      cursor: pointer;
      border-radius: $radius-md;
      transition: all $transition-base;

      &:hover {
        background: $bg-tertiary;
        color: $text-primary;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .page-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      font-size: $font-size-sm;
      color: $text-secondary;

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: $spacing-2;

        a {
          color: $text-secondary;
          text-decoration: none;
          transition: color $transition-base;

          &:hover {
            color: $primary-500;
          }
        }

        &:not(:last-child)::after {
          content: '/';
          margin-left: $spacing-2;
          color: $text-tertiary;
        }

        &:last-child {
          color: $text-primary;
          font-weight: $font-weight-medium;
        }
      }
    }
  }

  // Sección central - Búsqueda
  .toolbar-center {
    flex: 1;
    max-width: 500px;

    .search-box {
      position: relative;
      width: 100%;

      .search-input {
        width: 100%;
        height: 40px;
        padding: 0 $spacing-4 0 $spacing-10;
        background: $bg-tertiary;
        border: 1px solid transparent;
        border-radius: $radius-full;
        font-size: $font-size-sm;
        color: $text-primary;
        transition: all $transition-base;

        &::placeholder {
          color: $text-tertiary;
        }

        &:focus {
          outline: none;
          background: $bg-primary;
          border-color: $primary-500;
          box-shadow: 0 0 0 3px rgba($primary-500, 0.1);
        }
      }

      .search-icon {
        position: absolute;
        left: $spacing-4;
        top: 50%;
        transform: translateY(-50%);
        color: $text-tertiary;
        pointer-events: none;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .search-clear {
        position: absolute;
        right: $spacing-2;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: $text-tertiary;
        cursor: pointer;
        border-radius: $radius-full;
        transition: all $transition-base;

        &:hover {
          background: $bg-tertiary;
          color: $text-secondary;
        }
      }
    }
  }

  // Sección derecha
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .toolbar-action {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: $text
```
