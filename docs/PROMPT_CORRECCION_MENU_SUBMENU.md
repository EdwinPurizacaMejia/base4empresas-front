# 🎯 PROMPT: Corrección de Menú/Submenú - Arquitectura Completa FASE 1-5

**Fecha:** 4 de junio de 2026  
**Basado en:** STATUS_MENU_REAL_CORRECCION.md  
**Objetivo:** Eliminar duplicados, centralizar configuración y alinear con todas las FASES

---

## 📋 OBJETIVO

Corregir la estructura de menú/submenú en la aplicación Angular para:

- ✅ Eliminar duplicados (Kardex repetido)
- ✅ Centralizar configuración de menú en `menu.model.ts`
- ✅ Alinear con arquitectura ideal (19 rutas, todas las FASES)
- ✅ Reorganizar maestros (Clientes, Proveedores) en Catálogos
- ✅ Agregar secciones faltantes (Logística, Auditoría, Seguridad)

---

## 🔴 PROBLEMAS IDENTIFICADOS

### CRÍTICO (Resolver YA)

#### 1. **Kardex duplicado** ⚠️

**Ubicación:** `layout.component.ts` línea 90

**Problema:**

```typescript
// Está en Inventario.children (CORRECTO)
{
  label: 'Inventario',
  icon: '📈',
  children: [
    { label: 'Kardex', route: '/inventario/kardex', icon: '📝' }, // ← AQUÍ
    // ...
  ]
},

// Y TAMBIÉN como item simple de nivel 1 (INCORRECTO - DUPLICADO)
{ label: 'Kardex', route: '/inventario/kardex', icon: '📋' } // ← Y AQUÍ
```

**Impacto:**

- Confusión del usuario
- Redundancia innecesaria
- Menú poco profesional

**Solución:**

- Eliminar línea 90 del archivo `layout.component.ts`

---

#### 2. **Dos definiciones de menú conflictivas** 🔀

**Ubicación:** `layout.component.ts` vs `menu.model.ts`

**Problema:**

- `layout.component.ts` → `menuItems[] = [...]` (14 rutas, hardcodeado, con duplicados)
- `menu.model.ts` → `MAIN_MENU[]` (19 rutas, bien organizado, **NO SE USA**)

**Consecuencia:**

- Código muerto
- Confusión en mantenimiento
- Inconsistencia entre definiciones

**Solución:**

- Usar `MAIN_MENU` centralizado desde `menu.model.ts`
- Eliminar hardcoding de `layout.component.ts`

---

### 🟠 ALTA PRIORIDAD (Esta semana)

#### 3. **Organización incorrecta de maestros** 🏪

**Problema:**

- Clientes está en Ventas (debería estar en Catálogos)
- Proveedores está en Compras (debería estar en Catálogos)

**Impacto:**

- Menú confuso y poco intuitivo
- No agrupa todas las entidades maestras

**Solución:**

- Mover Clientes y Proveedores a sección "Catálogos"

---

#### 4. **Rutas faltantes (FASE 1-5)** ❌

**Problema:** Faltan estas rutas importantes:

- ❌ `/catalogos/canales-venta` (FASE 1 - Base4Empresas)
- ❌ `/logistica/envios` (FASE 4 - Logística)
- ❌ `/config/auditoria` (FASE 5 - Auditoría)
- ❌ `/config/seguridad` (FASE 5 - Seguridad y 2FA)

**Impacto:**

- No se cubren todas las FASES del proyecto
- Funcionalidades ocultas del menú

**Solución:**

- Agregar estas 4 rutas a `MAIN_MENU`

---

#### 5. **Sección Logística ausente** 🚚

**Problema:** No existe menú para Logística/Envíos (FASE 4)

**Solución:**

- Crear sección "Logística" con submenú "Envíos"

---

## 📊 ESTRUCTURA OBJETIVO (19 rutas, todas las FASES)

```
┌─ 📊 Dashboard                              (simple)
├─ 📚 Catálogos                              (expandible - 7 items)
│  ├─ Productos                              /catalogos/productos
│  ├─ Categorías                             /catalogos/categorias
│  ├─ Unidades                               /catalogos/unidades
│  ├─ Almacenes                              /catalogos/almacenes
│  ├─ Canales de venta        ← AGREGAR     /catalogos/canales-venta
│  ├─ Clientes                ← MOVER       /catalogos/clientes
│  └─ Proveedores             ← MOVER       /catalogos/proveedores
│
├─ 💰 Ventas                                 (expandible - 2 items)
│  ├─ Órdenes de Venta                       /ventas/pedidos
│  └─ Pagos                                  /ventas/pagos
│
├─ 📦 Inventario                             (expandible - 4 items)
│  ├─ Stock Actual                           /inventario/stock
│  ├─ Kardex                 ← SIN DUPLICAR /inventario/kardex
│  ├─ Ajustes                                /inventario/ajustes
│  └─ Transferencias                         /inventario/transferencias
│
├─ 🚚 Logística              ← AGREGAR SECCIÓN (expandible - 1 item)
│  └─ Envíos                                 /logistica/envios
│
├─ 🛍️ Compras                                (expandible - 1 item)
│  └─ Órdenes de Compra                      /compras/ordenes
│
└─ ⚙️ Configuración                          (expandible - 3 items)
   ├─ Costeo                                 /config/costeo
   ├─ Auditoría                ← AGREGAR     /config/auditoria
   └─ Seguridad y 2FA          ← AGREGAR     /config/seguridad

TOTAL: 1 + 7 + 2 + 4 + 1 + 1 + 3 = 19 rutas ✅
```

---

## 🔧 CAMBIOS ESPECÍFICOS REQUERIDOS

### **Cambio 1: Actualizar `src/app/models/menu.model.ts`**

**Verificar/Crear estructura completa MAIN_MENU:**

```typescript
import { MenuItem } from "../layout/sidebar.component";

export const MAIN_MENU: MenuItem[] = [
  // ========== DASHBOARD ==========
  {
    label: "Dashboard",
    route: "/dashboard",
    icon: "📊",
  },

  // ========== CATÁLOGOS (7 items) ==========
  {
    label: "Catálogos",
    icon: "📚",
    children: [
      { label: "Productos", route: "/catalogos/productos", icon: "📋" },
      { label: "Categorías", route: "/catalogos/categorias", icon: "🏷️" },
      { label: "Unidades", route: "/catalogos/unidades", icon: "⚖️" },
      { label: "Almacenes", route: "/catalogos/almacenes", icon: "🏢" },
      { label: "Canales de venta", route: "/catalogos/canales-venta", icon: "🔀" },
      { label: "Clientes", route: "/catalogos/clientes", icon: "👥" },
      { label: "Proveedores", route: "/catalogos/proveedores", icon: "🏭" },
    ],
  },

  // ========== VENTAS (2 items) ==========
  {
    label: "Ventas",
    icon: "💰",
    children: [
      { label: "Órdenes de Venta", route: "/ventas/pedidos", icon: "📑" },
      { label: "Pagos", route: "/ventas/pagos", icon: "💳" },
    ],
  },

  // ========== INVENTARIO (4 items) ==========
  {
    label: "Inventario",
    icon: "📦",
    children: [
      { label: "Stock Actual", route: "/inventario/stock", icon: "📊" },
      { label: "Kardex", route: "/inventario/kardex", icon: "📝" },
      { label: "Ajustes", route: "/inventario/ajustes", icon: "🔧" },
      { label: "Transferencias", route: "/inventario/transferencias", icon: "↔️" },
    ],
  },

  // ========== LOGÍSTICA (1 item) - NUEVA SECCIÓN ==========
  {
    label: "Logística",
    icon: "🚚",
    children: [{ label: "Envíos", route: "/logistica/envios", icon: "📮" }],
  },

  // ========== COMPRAS (1 item) ==========
  {
    label: "Compras",
    icon: "🛍️",
    children: [{ label: "Órdenes de Compra", route: "/compras/ordenes", icon: "📑" }],
  },

  // ========== CONFIGURACIÓN (3 items) ==========
  {
    label: "Configuración",
    icon: "⚙️",
    children: [
      { label: "Costeo", route: "/config/costeo", icon: "💹" },
      { label: "Auditoría", route: "/config/auditoria", icon: "🔍" },
      { label: "Seguridad y 2FA", route: "/config/seguridad", icon: "🔐" },
    ],
  },
];
```

---

### **Cambio 2: Actualizar `src/app/layout/layout.component.ts`**

**De (actual - hardcodeado):**

```typescript
import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { isPlatformBrowser } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { MatSidenavModule, MatSidenav } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ToolbarComponent } from "./toolbar.component";
import { SidebarComponent, MenuItem } from "./sidebar.component";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, ToolbarComponent, SidebarComponent],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit {
  @ViewChild("sidenav") sidenav!: MatSidenav;

  sidebarOpen = true;

  menuItems: MenuItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: "📊" },

    {
      label: "Productos",
      icon: "📦",
      children: [
        { label: "Listado", route: "/catalogos/productos", icon: "📋" },
        { label: "Categorías", route: "/catalogos/categorias", icon: "🏷️" },
        { label: "Unidades", route: "/catalogos/unidades", icon: "⚖️" },
        { label: "Almacenes", route: "/catalogos/almacenes", icon: "🏢" },
      ],
    },

    {
      label: "Inventario",
      icon: "📈",
      children: [
        { label: "Stock Actual", route: "/inventario/stock", icon: "📊" },
        { label: "Kardex", route: "/inventario/kardex", icon: "📝" },
        { label: "Ajustes", route: "/inventario/ajustes", icon: "🔧" },
        { label: "Transferencias", route: "/inventario/transferencias", icon: "↔️" },
      ],
    },

    {
      label: "Compras",
      icon: "🛒",
      children: [
        { label: "Órdenes de Compra", route: "/compras/ordenes", icon: "📑" },
        { label: "Proveedores", route: "/catalogos/proveedores", icon: "🏭" },
      ],
    },

    {
      label: "Ventas",
      icon: "💰",
      children: [
        { label: "Órdenes de Venta", route: "/ventas/pedidos", icon: "📑" },
        { label: "Pagos", route: "/ventas/pagos", icon: "💳" },
        { label: "Clientes", route: "/catalogos/clientes", icon: "👥" },
      ],
    },

    { label: "Kardex", route: "/inventario/kardex", icon: "📋" }, // ← DUPLICADO
    { label: "Configuración", route: "/config/costeo", icon: "⚙️" },
  ];

  ngOnInit(): void {
    // ...
  }
}
```

**A (centralizado):**

```typescript
import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { isPlatformBrowser } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { MatSidenavModule, MatSidenav } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ToolbarComponent } from "./toolbar.component";
import { SidebarComponent, MenuItem } from "./sidebar.component";
import { MAIN_MENU } from "../models/menu.model"; // ← IMPORTAR

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, ToolbarComponent, SidebarComponent],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit {
  @ViewChild("sidenav") sidenav!: MatSidenav;

  sidebarOpen = true;

  menuItems: MenuItem[] = MAIN_MENU; // ← USA LA CONFIGURACIÓN CENTRALIZADA

  ngOnInit(): void {
    // ...
  }
}
```

---

### **Cambio 3: Actualizar `src/app/layout/sidebar.component.ts`**

**Actualizar imports para usar MenuItem centralizado:**

**De:**

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

export interface MenuItem {
  label: string;
  route?: string;
  icon: string;
  badge?: number;
  children?: MenuItem[];
}

@Component({
  // ... resto del componente
```

**A:**

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MenuItem } from '../models/menu.model'; // ← IMPORTAR DESDE CENTRALIZADO

@Component({
  // ... resto del componente SIN definir MenuItem aquí
```

---

## ✅ VALIDACIÓN FINAL

Después de implementar los cambios, verifica:

- [ ] **Kardex NO aparece duplicado** - Solo en Inventario > Kardex
- [ ] **layout.component.ts NO tiene menuItems[] hardcodeado**
- [ ] **sidebar.component.ts importa MenuItem desde menu.model.ts**
- [ ] **Todos los items de Catálogos juntos:**
  - Productos, Categorías, Unidades, Almacenes
  - Canales de venta (NUEVA)
  - Clientes (MOVIDA desde Ventas)
  - Proveedores (MOVIDA desde Compras)
- [ ] **Sección Logística visible** con submenú Envíos
- [ ] **Sección Configuración completa** - Costeo, Auditoría, Seguridad
- [ ] **Total de rutas navegables: 19** (sin duplicados)
- [ ] **Todas las FASES representadas:**
  - FASE 1: Catálogos ✅
  - FASE 2: Ventas + Inventario ✅
  - FASE 3: Pagos (en Ventas) ✅
  - FASE 4: Logística ✅
  - FASE 5: Configuración ✅
- [ ] **Compilación sin errores TypeScript**
- [ ] **Menú se renderiza correctamente en navegador**
- [ ] **Navegación funciona desde todos los submenús**

---

## 🎯 BENEFICIOS ESPERADOS

✅ **Código centralizado** - Una única fuente de verdad para el menú  
✅ **Sin duplicados** - Kardex aparece solo una vez  
✅ **Arquitectura limpia** - Separación de responsabilidades  
✅ **Fácil de mantener** - Cambios en un solo archivo (menu.model.ts)  
✅ **Todas las FASES cubiertas** - Proyecto completo representado  
✅ **Menú profesional y lógico** - Agrupa elementos por dominio  
✅ **Escalable** - Fácil agregar nuevas rutas o secciones

---

## 📝 NOTAS IMPORTANTES

1. **Interfaz MenuItem** debe ser consistente en:
   - `menu.model.ts` (definición centralizada)
   - `sidebar.component.ts` (importa desde menu.model.ts)
   - `layout.component.ts` (usa el tipo importado)

2. **Rutas de app.routes.ts** deben coincidir con las rutas en MAIN_MENU

3. **Emojis** usados son consistentes con el diseño actual

4. **Orden** respeta la jerarquía de negocio:
   - Dashboard primero
   - Catálogos (maestros)
   - Operaciones (Ventas, Inventario, Logística, Compras)
   - Configuración

---

## 🚀 EJECUCIÓN

1. **Crear/Actualizar `menu.model.ts`** con MAIN_MENU completo
2. **Actualizar `layout.component.ts`** para importar MAIN_MENU
3. **Actualizar `sidebar.component.ts`** para importar MenuItem

---

