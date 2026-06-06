# 🎨 Menú Rediseñado - Vista Visual y Comportamiento

## 📱 Representación Visual del Menú

### Estado 1: Dashboard Activo (Inicial)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [SGI] 📦                    [Buscar...]                 🔔 👤 ⚙️      │
├─────────────────────────────────────────────────────────────────────────┤
│ [📊 Dashboard] [📚 Catálogos] [💰 Ventas] [📦 Inventario] [🚚 Logística]│
│ [🛍️ Compras] [⚙️ Configuración]                                         │
└─────────────────────────────────────────────────────────────────────────┘
│
│ [Espacio de contenido: Dashboard]
│
```

### Estado 2: Catálogos Seleccionado

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [SGI] 📦                    [Buscar...]                 🔔 👤 ⚙️      │
├─────────────────────────────────────────────────────────────────────────┤
│ [📊 Dashboard] [📚 Catálogos▼] [💰 Ventas] [📦 Inventario] [🚚 Logística]
│ [🛍️ Compras] [⚙️ Configuración]                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  📚 CATÁLOGOS                                                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐           │
│  │ 📦 Productos │ 🏷️ Categorías│ ⚖️ Unidades  │ 🏢 Almacenes │           │
│  └──────────────┴──────────────┴──────────────┴──────────────┘           │
│  ┌──────────────┬──────────────┬──────────────┐                          │
│  │ 🛒 Canales   │ 👥 Clientes  │ 🚚 Proveedores
│  └──────────────┴──────────────┴──────────────┘                          │
├─────────────────────────────────────────────────────────────────────────┤
│
│ [Espacio de contenido: Listado de Productos]
│
```

### Estado 3: Ventas > Pedidos Activo

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [SGI] 📦                    [Buscar...]                 🔔 👤 ⚙️      │
├─────────────────────────────────────────────────────────────────────────┤
│ [📊 Dashboard] [📚 Catálogos] [💰 Ventas▼] [📦 Inventario] [🚚 Logística]
│ [🛍️ Compras] [⚙️ Configuración]                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  💰 VENTAS                                                               │
│  ┌──────────────┬──────────────┐                                         │
│  │ 📋 Pedidos   │ 💳 Pagos     │ (ACTIVE: Pedidos)                       │
│  └──────────────┴──────────────┘                                         │
├─────────────────────────────────────────────────────────────────────────┤
│
│ [Espacio de contenido: Listado de Pedidos]
│
```

---

## 🎯 Comportamiento Interactivo

### 1. Click en Item Principal sin children

```
Usuario hace click en: [📊 Dashboard]
                            ↓
MainMenuComponent.selectMenuItem(dashboardItem)
                            ↓
routerLink="/dashboard" se activa
                            ↓
Angular Router navega a /dashboard
                            ↓
DashboardComponent se renderiza
                            ↓
activeParent = undefined (no hay submenú)
```

### 2. Click en Item Principal con children

```
Usuario hace click en: [📚 Catálogos]
                            ↓
MainMenuComponent.selectMenuItem(catalogosItem)
                            ↓
if (item.children) {
    activeParent = catalogosItem
}
                            ↓
Sub-menu se renderiza dinámicamente con children de Catálogos
                            ↓
No navega (es solo para mostrar submenú)
```

### 3. Click en Item Secundario

```
Usuario hace click en: [👥 Clientes] (dentro de submenú)
                            ↓
routerLink="/catalogos/clientes" se activa
                            ↓
Angular Router navega a /catalogos/clientes
                            ↓
CustomersListComponent se renderiza
                            ↓
MainMenuComponent detecta cambio de ruta
                            ↓
updateActiveParentFromRoute()
                            ↓
activeParent = MAIN_MENU.find(item => item.label === 'Catálogos')
```

### 4. Navegación por URL directa

```
Usuario accede: https://app.com/inventario/kardex
                            ↓
ngOnInit de MainMenuComponent
                            ↓
updateActiveParentFromRoute() examina router.url
                            ↓
Encuentra que /inventario/kardex es child de Inventario
                            ↓
activeParent = MAIN_MENU.find(item => item.label === 'Inventario')
                            ↓
Sub-menu se renderiza automáticamente
```

---

## 🎨 Estilos en Detalle

### Menú Principal (Nivel 1)

```css
Background:  Degradado azul oscuro (Tailwind indigo)
              Linear-gradient(90deg, #1e293b 0%, #0f172a 100%)

Border-bottom: 3px #3b82f6 (azul vivo)

Items:       Color: #cbd5e1 (gris claro)
             Padding: 0.75rem 1rem
             Gap: 0.5rem (entre icon y label)

Hover:       Background: rgba(59, 130, 246, 0.1)
             Color: #60a5fa (azul más claro)
             Border-bottom: #60a5fa

Active:      Background: rgba(59, 130, 246, 0.2)
             Color: #93c5fd (azul muy claro)
             Border-bottom: #3b82f6
             Font-weight: 600

Parent menu: Agregado "▼" después del label
             Indica que tiene submenú
```

### Submenú (Nivel 2)

```css
Background:  Degradado azul más oscuro
              Linear-gradient(180deg, #0f172a 0%, #1e293b 100%)

Layout:      Grid multi-columna (auto-fit, minmax 180px)
             Responsive: 1 columna en mobile

Header:      Borde azul #3b82f6
             Color: #93c5fd
             Font-weight: 600

Items:       Color: #cbd5e1
             Border-left: 3px transparent

Hover:       Background: rgba(59, 130, 246, 0.15)
             Color: #60a5fa
             Border-left: #60a5fa
             Transform: translateX(4px) (slide right)

Active:      Background: rgba(59, 130, 246, 0.25)
             Color: #93c5fd
             Border-left: #3b82f6
             Font-weight: 600
```

---

## 📊 Flujo de Cambios de Detección

```
┌─────────────────────────────────────┐
│ Router.events (NavigationEnd)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ takeUntil(destroy$) + filter()       │ (Evita memory leaks)
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ updateActiveParentFromRoute()        │ (Private method)
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Itera MAIN_MENU items               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Busca si ruta coincide con children │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ activeParent = parent encontrado    │
│ (o undefined si no hay match)       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ markForCheck() (OnPush optimization)│
└─────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida del Componente

```
Constructor
    ↓
OnInit
├─ this.mainMenu = MAIN_MENU (copia del modelo)
├─ updateActiveParentFromRoute() (determina parent activo)
└─ this.router.events.pipe(...).subscribe(...) (escucha cambios de ruta)
    ↓
OnAfterViewInit (si aplica)
    ↓
Cambios en ruta (NavigationEnd)
├─ updateActiveParentFromRoute() vuelve a ejecutarse
├─ activeParent se actualiza
└─ Template se redibuja (solo cambios necesarios)
    ↓
OnDestroy
├─ this.destroy$.next()
├─ this.destroy$.complete()
└─ Subscription se desuscribe automáticamente (takeUntil)
```

---

## 📱 Comportamiento Responsivo

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────────┐
│ [SGI] 📦    [Buscar...] [Botones de acción]    │
├─────────────────────────────────────────────────┤
│ [📊 Dash] [📚 Cat] [💰 Ventas] [📦 Inv] [🚚 Log]│
│ [🛍️ Compras] [⚙️ Config]                        │
├─────────────────────────────────────────────────┤
│  Catálogo Items en GRID: 4 columnas              │
│  ┌──────┬──────┬──────┬──────┐                   │
│  │Item1 │Item2 │Item3 │Item4 │                   │
│  ├──────┼──────┼──────┼──────┤                   │
│  │Item5 │Item6 │Item7 │      │                   │
│  └──────┴──────┴──────┴──────┘                   │
└─────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌────────────────────────────────────────┐
│ [SGI] 📦    [Buscar...] [Acciones]    │
├────────────────────────────────────────┤
│ [📊 D] [📚 C] [💰 V] [📦 I] [🚚 L]    │
│ [🛍️ CP] [⚙️ CF]                        │
├────────────────────────────────────────┤
│  Items en GRID: 2-3 columnas            │
│  ┌────────────┬────────────┐            │
│  │Item1       │Item2       │            │
│  ├────────────┼────────────┤            │
│  │Item3       │Item4       │            │
│  ├────────────┴────────────┤            │
│  │Item5                    │            │
│  └────────────────────────┘            │
└────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌──────────────────────────┐
│ [SGI] [Buscar] [☰ 🔔 👤]│
├──────────────────────────┤
│ [📊] [📚] [💰] [📦] [🚚]│
│ [🛍️] [⚙️]                │
├──────────────────────────┤
│  Items en GRID: 1 columna │
│  ┌──────────────────────┐ │
│  │📦 Productos          │ │
│  ├──────────────────────┤ │
│  │🏷️ Categorías         │ │
│  ├──────────────────────┤ │
│  │⚖️ Unidades           │ │
│  ├──────────────────────┤ │
│  │🏢 Almacenes          │ │
│  └──────────────────────┘ │
└──────────────────────────┘

Labels: Ocultos en mobile (solo iconos)
Main menu labels también ocultos
```

---

## 🧪 Casos de Uso Visibles en UI

### Caso 1: Usuario navega por primera vez

```
1. App carga
2. Redirect a /dashboard
3. DashboardComponent se renderiza
4. activeParent = undefined (no hay submenú visible)
5. MainMenuComponent muestra solo nivel 1 de menú
```

### Caso 2: Usuario hace click en Catálogos

```
1. Usuario ve menú principal normal
2. Hace click en [📚 Catálogos]
3. Submenú se expande dinámicamente
4. Muestra 7 items de catálogos en grid
5. No navega (solo expande submenú)
```

### Caso 3: Usuario hace click en Productos dentro de Catálogos

```
1. Submenú está visible
2. Usuario hace click en [📦 Productos]
3. Navega a /catalogos/productos
4. ProductsListComponent se renderiza
5. "Productos" del submenú se marca activo (estilo diferente)
6. MainMenuComponent detecta ruta y mantiene Catálogos como activeParent
```

### Caso 4: Usuario accede por URL directa

```
1. Usuario accede a https://app.com/inventario/kardex
2. App carga MainMenuComponent
3. ngOnInit examina router.url
4. Detecta que /inventario/kardex es child de Inventario
5. activeParent = Inventario
6. Submenú se renderiza automáticamente mostrando items de Inventario
```

### Caso 5: Usuario en mobile, hace click en hamburguesa

```
1. En mobile, solo iconos visibles
2. Usuario hace click en [🚚] (Logística)
3. Submenú se expande (1 columna en mobile)
4. Muestra [📮 Envíos]
5. Usuario hace click en [📮 Envíos]
6. Navega a /logistica/envios
7. ShipmentsListComponent se renderiza
```

---

## 💾 Estado Persistente

**Nota**: El menú NO persiste estado entre reloads. Esto es correcto porque:

1. El estado se determina por la ruta actual (router.url)
2. Cuando el usuario recarga, la ruta sigue siendo la misma
3. updateActiveParentFromRoute() actualiza activeParent automáticamente
4. Esto evita state management complejo y sincronización

**Ejemplo**:

```
Usuario en: /catalogos/clientes
Recarga página (F5)
    ↓
App recarga
MainMenuComponent.ngOnInit()
    ↓
updateActiveParentFromRoute() examina router.url
    ↓
Detecta /catalogos/clientes
    ↓
activeParent = Catálogos
    ↓
Submenú de Catálogos se renderiza automáticamente
    ↓
"Clientes" está marcado como active
```

---

## 📊 Comparación: Antes vs Después

| Aspecto            | Antes                 | Después                  |
| ------------------ | --------------------- | ------------------------ |
| Visual             | Flat tabs             | Jerárquico con submenús  |
| Items              | ~12 items planos      | 6 dominios + 15 subitems |
| Escalabilidad      | Difícil agregar items | Trivial (edit MAIN_MENU) |
| Mobile             | Poco optimizado       | Fully responsive         |
| Estado             | Indeterminado         | Automático por ruta      |
| Performance        | Standard              | OnPush optimizado        |
| Profundidad visual | 1 nivel               | 2 niveles dinámicos      |
| Usabilidad         | Básica                | Profesional + intuitiva  |

---

**Visualización y comportamiento completamente especificados ✅**

Este documento muestra exactamente cómo se verá y comportará el menú en todas las situaciones.
