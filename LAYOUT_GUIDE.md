# 📐 Guía de Arquitectura - Layout Mejorado Base4Empresas

## 🎯 Descripción General

El nuevo layout de Base4Empresas proporciona una estructura shell moderna, responsive y profesional basada en Angular 17 standalone components.

**Versión:** 1.0  
**Rama:** `feature/layout-general`  
**Stack:** Angular 17.3 + TypeScript 5.4 + Angular Material 17

---

## 📦 Estructura de Componentes

```
src/app/layout/
├── layout.component.ts          (Shell principal - orquestador)
├── layout.component.html        (Template shell)
├── layout.component.css         (Estilos shell)
├── toolbar.component.ts         (Barra superior con búsqueda)
├── sidebar.component.ts         (Navegación lateral)
└── shell.component.ts           (Alternativa: componente shell separado)

src/app/
├── app.config.ts                (Configuración actualizada con animaciones)
├── app.routes.ts                (Rutas SIN cambios)
└── ...

src/
└── styles.css                   (Estilos globales renovados)
```

---

## 🏗️ Componentes Principales

### 1. **LayoutComponent** (Shell Principal)

**Archivo:** `layout.component.ts`

**Responsabilidades:**

- Orquestar Toolbar + Sidebar + Content
- Gestionar estado de apertura/cierre del sidebar
- Detectar viewport (móvil/desktop)
- Manejar búsqueda global

**Propiedades:**

```typescript
sidebarOpen: boolean = true;        // Estado del sidebar
isMobileView: boolean = false;       // Detecta si es móvil
menuItems: MenuItem[] = [...];       // Items del menú
```

**Métodos:**

```typescript
toggleSidebar(): void               // Alterna visibilidad
closeSidebar(): void                // Cierra en móvil
checkViewport(): void               // Detecta cambio de tamaño
onGlobalSearch(query: string): void // Busca global
```

---

### 2. **ToolbarComponent** (Barra Superior)

**Archivo:** `toolbar.component.ts`

**Características:**

- ✅ Logo + Menú toggle
- ✅ Búsqueda global con autocompletado
- ✅ Información del usuario
- ✅ Responsive (se ajusta en móvil)

**Template Sections:**

```html
<header class="toolbar">
  <!-- Left: Menu toggle + Logo -->
  <div class="toolbar-left">
    <button (click)="onMenuToggle()">☰</button>
    <div class="logo">Logo SGI</div>
  </div>

  <!-- Center: Search -->
  <div class="toolbar-center">
    <input placeholder="Buscar..." (keyup.enter)="onSearch()" />
  </div>

  <!-- Right: User Menu -->
  <div class="toolbar-right">
    <span>Admin 👤</span>
  </div>
</header>
```

**Output Events:**

```typescript
@Output() menuToggle = new EventEmitter<void>();
@Output() search = new EventEmitter<string>();
```

---

### 3. **SidebarComponent** (Navegación)

**Archivo:** `sidebar.component.ts`

**Características:**

- ✅ Menú colapsable
- ✅ Indicadores de estado (badges)
- ✅ Navegación con Material icons
- ✅ Activo/hover states

**Interfaz:**

```typescript
export interface MenuItem {
  label: string;
  route: string;
  icon: string; // "📊", "📦", etc.
  badge?: number; // Opcional: mostrar contador
}
```

**Input/Output:**

```typescript
@Input() isOpen: boolean = true;
@Input() menuItems: MenuItem[] = [];
@Output() toggleSidebar = new EventEmitter<void>();
```

---

## 🎨 Estructura Visual

```
┌─────────────────────────────────────┐
│    TOOLBAR (altura: 64px)           │
│  [☰] [Logo] [Búsqueda]  [Usuario]   │
├──────────┬─────────────────────────┤
│          │                         │
│ SIDEBAR  │    CONTENT AREA         │
│ (260px)  │  (flex: 1)              │
│          │                         │
│  - Dashboard                        │
│  - Productos                        │
│  - Inventario                       │
│  - Kardex                           │
│  - Compras                          │
│  - Ventas                           │
│          │                         │
│          │ <router-outlet>        │
│          │                         │
└──────────┴─────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (≥769px)

- Toolbar visible
- Sidebar visible (260px)
- Contenido fluye libremente

### Tablet (769px - 1024px)

- Toolbar visible
- Sidebar visible pero colapsable (80px)
- Contenido se ajusta

### Mobile (<769px)

- Toolbar visible (64px)
- Sidebar: overlay flotante (oculto por defecto)
- Overlay semi-transparente cuando sidebar abierto
- Botón hamburguesa en toolbar

```css
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%); /* Oculto */
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0); /* Visible */
  }
}
```

---

## 🔄 Flujo de Datos

```
LayoutComponent (Smart Component)
    ↓
    ├── ToolbarComponent (Presentational)
    │   └── Emite: menuToggle, search
    │
    ├── SidebarComponent (Presentational)
    │   ├── Input: isOpen, menuItems
    │   └── Emite: toggleSidebar
    │
    └── Content Area
        └── <router-outlet>
            (Componentes de página)
```

---

## 🎯 Casos de Uso

### 1. Cambiar Menú Items

En `layout.component.ts`:

```typescript
menuItems: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: '📊' },
  { label: 'Nuevas Módulos', route: '/newmodule', icon: '🆕' },
  // ... más items
];
```

### 2. Agregar Búsqueda Global

En `layout.component.ts`:

```typescript
onGlobalSearch(query: string): void {
  // Implementar búsqueda
  this.router.navigate(['/search'], {
    queryParams: { q: query }
  });
}
```

### 3. Personalizar Colores

En `src/styles.css`:

```css
:root {
  --primary-color: #667eea;
  --primary-dark: #764ba2;
  /* ... más variables */
}
```

### 4. Agregar Badges al Menú

```typescript
menuItems: MenuItem[] = [
  { label: 'Compras', route: '/purchases', icon: '🛒', badge: 5 },
  { label: 'Ventas', route: '/sales', icon: '💰', badge: 12 }
];
```

---

## 🚀 Instalación y Configuración

### Paso 1: Instalar Angular Material

```bash
npm install @angular/material@17 @angular/cdk@17
```

### Paso 2: Actualizar app.config.ts

```typescript
import { provideAnimations } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // ← Agregar esto
    // ... otros providers
  ],
};
```

### Paso 3: Componentes están listos

Los componentes de layout ya están creados:

- `toolbar.component.ts`
- `sidebar.component.ts`
- `layout.component.ts` (actualizado)

### Paso 4: Verificar Routing

El routing en `app.routes.ts` se mantiene igual, sin cambios.

---

## 🎨 Variables CSS Globales

Se han definido variables CSS para facilitar personalización:

```css
/* Colores */
--primary-color: #667eea;
--primary-dark: #764ba2;
--success-color: #28a745;
--warning-color: #ffc107;
--danger-color: #dc3545;

/* Espaciado */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;

/* Sombras */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Transiciones */
--transition-fast: 0.2s ease-out;
--transition-normal: 0.3s ease-out;
```

---

## ✨ Características Implementadas

### ✅ Toolbar

- Logo con icono SGI
- Botón hamburguesa (móvil)
- Búsqueda global funcional
- User menu
- Responsive

### ✅ Sidebar

- Menú de navegación (6 items)
- Colapsable en desktop
- Drawer en móvil
- Badges de notificaciones
- Scroll interno
- Hover states

### ✅ Content Area

- Scroll independiente
- Padding responsivo
- Background consistente
- Integración con router-outlet

### ✅ Responsive

- Mobile first approach
- Breakpoints: 480px, 768px, 1024px
- Overlay en móvil
- Hamburger menu
- Búsqueda oculta en móvil small

---

## 🔮 Mejoras Futuras

1. **Material Icons**
   - Reemplazar emojis con Material Icons
   - `npm install @angular/material:// ya viene con Material`

2. **Notificaciones**
   - Badge contador en tiempo real
   - Toast notifications

3. **Tema Oscuro**
   - Toggle dark/light mode
   - Persistencia en localStorage

4. **Búsqueda Avanzada**
   - Autocompletado
   - Histórico de búsquedas
   - Filtros rápidos

5. **Perfil de Usuario**
   - Menú desplegable
   - Logout
   - Preferencias

---

## 🧪 Testing

### Componentes a Testar:

```typescript
// toolbar.component.spec.ts
describe("ToolbarComponent", () => {
  it("should emit search on enter key", () => {
    // Test
  });

  it("should toggle menu", () => {
    // Test
  });
});

// sidebar.component.spec.ts
describe("SidebarComponent", () => {
  it("should display menu items", () => {
    // Test
  });

  it("should emit toggleSidebar event", () => {
    // Test
  });
});

// layout.component.spec.ts
describe("LayoutComponent", () => {
  it("should close sidebar on mobile by default", () => {
    // Test
  });

  it("should call onGlobalSearch", () => {
    // Test
  });
});
```

---

## 📋 Checklist de Verificación

- [ ] Rama `feature/layout-general` creada
- [ ] Angular Material 17 instalado
- [ ] `app.config.ts` actualizado con `provideAnimations()`
- [ ] `layout.component.ts` importa toolbar y sidebar
- [ ] `layout.component.html` usa los componentes
- [ ] `styles.css` tiene variables globales
- [ ] Toolbar visible y funcional
- [ ] Sidebar abre/cierra
- [ ] Búsqueda tiene input funcional
- [ ] Responsive en móvil
- [ ] Router-outlet muestra contenido
- [ ] Sin errores de compilación

---

## 🚀 Próximos Pasos

1. Compilar y verificar:

```bash
ng build
ng serve
```

2. Verificar en navegador:
   - Desktop: http://localhost:4200
   - Móvil: Abrir DevTools > Mobile view

3. Cambiar a rama principal y hacer PR:

```bash
git add .
git commit -m "feat: layout renovado con toolbar y sidebar mejorado"
git push origin feature/layout-general
```

4. Implementar mejoras Fase 2:
   - Agregar gráficos al dashboard
   - Mejorar tablas con paginación
   - Agregar formularios avanzados

---

## 📚 Referencias

- [Angular Material Docs](https://material.angular.io)
- [Angular 17 Standalone Components](https://angular.io/guide/standalone-components)
- [Material Design Guidelines](https://material.io)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Documento creado:** 30 de abril de 2026  
**Versión:** 1.0  
**Última actualización:** Rama feature/layout-general
