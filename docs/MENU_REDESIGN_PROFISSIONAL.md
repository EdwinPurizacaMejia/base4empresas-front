# Rediseño Profesional del Menú Principal - Base4Empresas Frontend

**Fecha:** 26 de mayo de 2026  
**Estado:** ✅ IMPLEMENTADO Y TESTEADO  
**Autor:** GitHub Copilot

---

## 📋 Descripción General

Se ha implementado un **sistema de menú jerárquico profesional de 2 niveles** que agrupa todas las pantallas del frontend según los **dominios de negocio** y las **5 fases implementadas**.

### Cambios Principales

**ANTES (Menú Lineal):**

```
Dashboard | Productos | Compras | Ventas | Inventario | Kardex | Configuración
```

**DESPUÉS (Menú Jerárquico + Submenús):**

```
Dashboard
├── Catálogos (FASE 1)
│   ├── Productos
│   ├── Categorías
│   ├── Unidades
│   ├── Almacenes
│   ├── Canales de venta
│   ├── Clientes
│   └── Proveedores
├── Ventas (FASE 2-3)
│   ├── Pedidos
│   └── Pagos
├── Inventario (FASE 2-4)
│   ├── Stock actual
│   ├── Kardex
│   ├── Ajustes de stock
│   └── Transferencias
├── Logística (FASE 4)
│   └── Envíos
├── Compras
│   └── Órdenes de compra
└── Configuración (FASE 5)
    ├── Auditoría
    ├── Seguridad
    └── Configuración de costeo
```

---

## 🏗️ Arquitectura Técnica

### 1. Modelo Tipado de Menú

**Archivo:** `src/app/models/menu.model.ts`

```typescript
export interface MenuItem {
  label: string; // Etiqueta visible
  icon?: string; // Emoji o icono Material
  route?: string; // Ruta de navegación
  children?: MenuItem[]; // Submenús anidados
  requiredRoles?: string[]; // Control de acceso
  disabled?: boolean; // Item deshabilitado
  tooltip?: string; // Descripción al pasar mouse
}

export const MAIN_MENU: MenuItem[] = [
  // Estructura jerárquica centralizada
];
```

**Ventajas:**

- ✅ Totalmente tipado (TypeScript)
- ✅ Reutilizable en toda la aplicación
- ✅ Única fuente de verdad para la navegación
- ✅ Fácil de mantener y actualizar
- ✅ Soporta control de acceso basado en roles

### 2. Componente de Menú Profesional

**Archivo:** `src/app/layout/main-menu.component.ts`

**Características:**

- ✅ Menú de dos niveles (principal + submenús dinámicos)
- ✅ Navegación con `routerLink` y `routerLinkActive`
- ✅ Detección automática de ruta activa
- ✅ Iconos emoji + estilos Material Design
- ✅ OnPush Change Detection Strategy (performance)
- ✅ Responsive mobile-first design
- ✅ Animaciones suave (transitions)
- ✅ Desuscripción automática en ngOnDestroy

```typescript
export class MainMenuComponent implements OnInit, OnDestroy {
  mainMenu: MenuItem[] = MAIN_MENU;
  activeParent: MenuItem | undefined;

  constructor(
    private router: Router,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.updateActiveParentFromRoute();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.updateActiveParentFromRoute());
  }

  selectMenuItem(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      this.activeParent = this.activeParent?.label === item.label ? item : item;
    }
  }

  private updateActiveParentFromRoute(): void {
    // Lógica para determinar qué parent está activo
  }
}
```

### 3. Integración en Layout

**Archivo:** `src/app/layout/horizontal-layout/horizontal-layout.component.html`

```html
<!-- TOOLBAR CON LOGO Y BÚSQUEDA -->
<mat-toolbar color="primary" class="main-toolbar">
  <div class="logo-section">Base4Empresas</div>
  <span class="spacer"></span>
  <mat-form-field class="search-field">
    <input matInput [(ngModel)]="searchTerm" placeholder="Buscar..." />
  </mat-form-field>
  <button mat-icon-button>
    <mat-icon>account_circle</mat-icon>
  </button>
</mat-toolbar>

<!-- MENÚ JERÁRQUICO (2 NIVELES) -->
<app-main-menu></app-main-menu>

<!-- CONTENIDO PRINCIPAL -->
<div class="content-container">
  <router-outlet></router-outlet>
</div>
```

---

## 🛣️ Estructura de Rutas Reorganizadas

### Antes (Rutas Dispersas)

```
/dashboard
/productos
/productos/:id
/inventario
/inventario/:id
/kardex
/configuracion/costeo
/catalogos/canales
/clientes
/proveedores
/pedidos
/pedidos/:id
/compras
/compras/:id
/ventas
/ventas/:id
```

### Después (Rutas Organizadas por Dominio)

```
/dashboard

/catalogos/*
  /productos
  /productos/:id
  /categorias
  /unidades
  /almacenes
  /canales-venta
  /clientes
  /proveedores

/ventas/*
  /pedidos
  /pedidos/crear
  /pedidos/:id
  /pagos

/inventario/*
  /stock
  /stock/:id
  /kardex
  /ajustes
  /transferencias

/logistica/*
  /envios

/compras/*
  /ordenes
  /ordenes/:id

/config/*
  /costeo
  /auditoria
  /seguridad
```

**Ventajas:**

- ✅ Rutas semánticamente correctas
- ✅ Fácil de mantener y predecible
- ✅ Agrupa funcionalidades relacionadas
- ✅ Redireccionamientos legacy para compatibilidad

---

## 📱 Diseño Responsive

### Desktop (1024px+)

- Menú principal horizontal con scroll
- Submenú en grid de 4 columnas
- Iconos y etiquetas visibles
- Tooltips en hover

### Tablet (768px - 1023px)

- Menú principal con wrap
- Submenú en grid de 2 columnas
- Solo iconos en menú principal
- Etiquetas en submenú

### Mobile (<768px)

- Menú principal horizontal scrollable
- Solo iconos (etiquetas ocultas)
- Submenú en 1 columna
- Tap-friendly (40px+ altura)

```css
/* Estilos principales */
.main-menu {
  display: flex;
  background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 3px solid #3b82f6;
  overflow-x: auto;
  position: sticky;
  top: 0;
  z-index: 100;
}

.sub-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .menu-label {
    display: none;
  }
  .sub-menu {
    grid-template-columns: 1fr;
  }
}
```

---

## 🧪 Tests Unitarios

**Archivo:** `src/app/layout/main-menu.component.spec.ts`

### Cobertura de Tests

#### Estructura del Menú (10 tests)

✅ Items principales esperados  
✅ Todos los items tienen iconos  
✅ Dashboard sin children  
✅ Catálogos con submenús correctos  
✅ Ventas con Pedidos + Pagos (FASE 2-3)  
✅ Inventario con Stock + Kardex + Ajustes (FASE 2-4)  
✅ Logística con Envíos (FASE 4)  
✅ Configuración con Auditoría + Seguridad (FASE 5)  
✅ Todas las rutas válidas (no vacías)  
✅ Rutas organizadas por dominio (prefijo correcto)

#### Renderizado de Menú (5 tests)

✅ Renderiza items principales  
✅ Items con children tienen clase `parent-menu`  
✅ Dashboard sin clase `parent-menu`  
✅ Sin renderizar submenú cuando `activeParent` undefined  
✅ Renderiza submenú cuando `activeParent` tiene children

#### Navegación (6 tests)

✅ `selectMenuItem` actualiza `activeParent`  
✅ Actualiza `activeParent` en NavigationEnd  
✅ Determina `activeParent` para `/logistica/envios`  
✅ Determina `activeParent` para `/inventario/kardex`  
✅ Determina `activeParent` para `/config/auditoria`  
✅ Determina `activeParent` para `/compras/ordenes`

#### Estilos (2 tests)

✅ Aplica clase `active` a item actual  
✅ Renderiza iconos en items

**Total:** 23+ tests con alta cobertura

### Ejecutar Tests

```bash
ng test --include='**/main-menu.component.spec.ts'
```

---

## 🔄 Relación con las 5 Fases

### FASE 1: Catálogos + Validación

- **Menú:** `Catálogos > Canales de venta`, `Catálogos > Clientes`, `Catálogos > Proveedores`
- **Rutas:** `/catalogos/canales-venta`, `/catalogos/clientes`, `/catalogos/proveedores`
- **Componentes:** `SalesChannelsListComponent`, `CustomersListComponent`, `SuppliersListComponent`

### FASE 2: Órdenes y Estados

- **Menú:** `Ventas > Pedidos`
- **Rutas:** `/ventas/pedidos`, `/ventas/pedidos/:id`
- **Componentes:** `OrdersListComponent`, `OrderDetailComponent`

### FASE 3: Pagos

- **Menú:** `Ventas > Pagos`
- **Rutas:** `/ventas/pagos`
- **Componentes:** Integrado en `OrderDetailComponent`

### FASE 4: Logística + Envíos

- **Menú:** `Logística > Envíos`
- **Rutas:** `/logistica/envios`
- **Componentes:** Integrado en `OrderDetailComponent`

### FASE 5: Auditoría + Seguridad

- **Menú:** `Configuración > Auditoría`, `Configuración > Seguridad`
- **Rutas:** `/config/auditoria`, `/config/seguridad`
- **Componentes:** TBD (placeholders implementados)

---

## 📚 Guía de Uso para Desarrolladores

### 1. Agregar un nuevo item al menú

**Editar:** `src/app/models/menu.model.ts`

```typescript
export const MAIN_MENU: MenuItem[] = [
  // ... items existentes
  {
    label: "Mi Nueva Sección",
    icon: "🆕",
    children: [
      {
        label: "Opción 1",
        icon: "1️⃣",
        route: "/mi-seccion/opcion1",
        tooltip: "Descripción de opción 1",
      },
      // ... más opciones
    ],
  },
];
```

### 2. Crear ruta correspondiente

**Editar:** `src/app/app.routes.ts`

```typescript
{
  path: 'mi-seccion',
  children: [
    {
      path: 'opcion1',
      component: MiComponente,
      data: { title: 'Opción 1' }
    },
  ]
}
```

### 3. Actualizar tests

**Editar:** `src/app/layout/main-menu.component.spec.ts`

```typescript
it("Mi Nueva Sección debe tener submenús correctos", () => {
  const miSeccion = MAIN_MENU.find((item) => item.label === "Mi Nueva Sección");
  const childLabels = miSeccion?.children?.map((child) => child.label) || [];

  expect(childLabels).toContain("Opción 1");
});
```

### 4. Ejecutar tests para validar

```bash
ng test
```

---

## 🎨 Personalización de Estilos

### Cambiar colores del menú

**Editar:** `src/app/layout/main-menu.component.ts` (en la sección `styles`)

```typescript
// Antes
background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
border-bottom: 3px solid #3b82f6;

// Después (ejemplo)
background: linear-gradient(90deg, #2d3748 0%, #1a202c 100%);
border-bottom: 3px solid #4299e1;
```

### Cambiar tamaño de fuente

```typescript
.menu-label {
  font-size: 0.95rem; // Cambiar aquí
}
```

### Cambiar animaciones

```typescript
.main-menu a {
  transition: all 0.3s ease; // Ajustar duración
}
```

---

## 📊 Performance Optimizations

### 1. OnPush Change Detection

```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

✅ Reduce ciclos de detección de cambios
✅ Mejora performance en apps grandes

### 2. Desuscripción con takeUntil

```typescript
this.router.events
  .pipe(
    filter((event) => event instanceof NavigationEnd),
    takeUntil(this.destroy$)
  )
  .subscribe(...);
```

✅ Evita memory leaks
✅ Limpieza automática en ngOnDestroy

### 3. Lazy Loading de Módulos (Future)

```typescript
{
  path: 'catalogos',
  loadChildren: () => import('./modules/catalogos/catalogos.module')
    .then(m => m.CatalogosModule)
}
```

---

## 🚀 Deployment Checklist

- [x] Modelo de menú definido y tipado
- [x] Componente de menú implementado
- [x] Rutas reorganizadas por dominio
- [x] Layout actualizado para usar componente
- [x] 23+ tests unitarios pasando
- [x] Estilos responsive
- [x] Documentación completa
- [ ] Testeo manual end-to-end
- [ ] Deploy a staging
- [ ] Validación con producto/PO

---

## 📝 Cambios Previos (Compatibilidad)

Se mantienen redireccionamientos legacy para compatibilidad:

```typescript
{
  path: 'productos',
  redirectTo: 'catalogos/productos',
  pathMatch: 'full'
},
{
  path: 'kardex',
  redirectTo: 'inventario/kardex',
  pathMatch: 'full'
},
// ... más redireccionamientos
```

**¿Por qué?** Cualquier enlace directo antiguo seguirá funcionando sin problemas.

---

## 🔗 Links Relacionados

- [Menu Model](src/app/models/menu.model.ts)
- [Main Menu Component](src/app/layout/main-menu.component.ts)
- [Main Menu Tests](src/app/layout/main-menu.component.spec.ts)
- [App Routes](src/app/app.routes.ts)
- [Horizontal Layout](src/app/layout/horizontal-layout/horizontal-layout.component.html)

---

## 📞 Preguntas Frecuentes

### P: ¿Cómo agrego un nuevo dominio al menú?

**R:** Edita `MAIN_MENU` en `menu.model.ts`, agrega rutas en `app.routes.ts` y actualiza tests en `main-menu.component.spec.ts`.

### P: ¿Cómo control acceso por roles?

**R:** Usa `requiredRoles?: string[]` en `MenuItem`. El `PermissionService` valida el acceso.

### P: ¿Cómo personalizo los iconos?

**R:** Reemplaza emojis con iconos Material: `icon: 'dashboard'` (Material Icon name).

### P: ¿Cómo agrego más niveles de submenús?

**R:** Actualiza `MenuItem` para soportar `children` anidados y expande la lógica de renderizado.

### P: ¿Está optimizado para mobile?

**R:** Sí, con breakpoint 768px y grid responsivo. Prueba en DevTools.

---

## 📋 Resumen de Archivos Modificados

| Archivo                                                             | Cambio                             | Estado           |
| ------------------------------------------------------------------- | ---------------------------------- | ---------------- |
| `src/app/models/menu.model.ts`                                      | ✅ Ya existía, modelo completo     | ✅ Validado      |
| `src/app/layout/main-menu.component.ts`                             | ✅ Ya existía, componente completo | ✅ Validado      |
| `src/app/layout/main-menu.component.spec.ts`                        | ✅ Tests actualizados + nuevos     | ✅ +5 tests      |
| `src/app/layout/horizontal-layout/horizontal-layout.component.ts`   | ✅ Importa `MainMenuComponent`     | ✅ Actualizado   |
| `src/app/layout/horizontal-layout/horizontal-layout.component.html` | ✅ Usa `<app-main-menu>`           | ✅ Actualizado   |
| `src/app/app.routes.ts`                                             | ✅ Rutas reorganizadas por dominio | ✅ Refactorizado |

---

**Versión:** 1.0  
**Última actualización:** 26 de mayo de 2026  
**Próximo review:** Después de testeo manual end-to-end
