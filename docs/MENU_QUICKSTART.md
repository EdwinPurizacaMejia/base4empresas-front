# Guía Rápida - Menú Jerárquico Base4Empresas

**Estado:** ✅ IMPLEMENTADO Y LISTO PARA USAR  
**Última actualización:** 26 de mayo de 2026

---

## 🎯 Quick Start

### Ver el menú en acción

```bash
npm start
# Abre http://localhost:4200
# Verás menú superior + submenús dinámicos
```

### Ejecutar tests

```bash
ng test --include='**/main-menu.component.spec.ts'
# 23+ tests pasando ✅
```

---

## 📐 Estructura de Archivos

```
src/app/
├── models/
│   └── menu.model.ts                 ← Modelo + MAIN_MENU
├── layout/
│   ├── main-menu.component.ts        ← Componente menú
│   ├── main-menu.component.spec.ts   ← Tests (23+ casos)
│   └── horizontal-layout/
│       ├── horizontal-layout.component.ts
│       └── horizontal-layout.component.html ← Usa <app-main-menu>
└── app.routes.ts                     ← Rutas por dominio
```

---

## 📊 Menú Jerárquico (2 Niveles)

```
NIVEL 1 (Principal)          NIVEL 2 (Submenú - dinámico)
─────────────────────        ────────────────────────────
Dashboard                    (sin submenú)

Catálogos ▼                  Productos
                             Categorías
                             Clientes
                             Proveedores
                             Canales de venta
                             ...

Ventas ▼                     Pedidos
                             Pagos

Inventario ▼                 Stock actual
                             Kardex
                             Ajustes
                             Transferencias

... y más
```

---

## 🔄 Flujo de Navegación

```
Usuario hace click en "Catálogos" (NIVEL 1)
    ↓
MainMenuComponent.selectMenuItem()
    ↓
activeParent = Catálogos
    ↓
Sub-menú renderiza todos los children de Catálogos
    ↓
Usuario hace click en "Productos" (NIVEL 2)
    ↓
routerLink="/catalogos/productos"
    ↓
NavigationEnd event
    ↓
updateActiveParentFromRoute()
    ↓
activeParent sigue siendo Catálogos (mantiene coherencia)
```

---

## 🛣️ Rutas Actuales

```
/dashboard

/catalogos/
  productos
  categorias
  clientes
  proveedores
  canales-venta

/ventas/
  pedidos
  pagos

/inventario/
  stock
  kardex
  ajustes
  transferencias

/logistica/
  envios

/compras/
  ordenes

/config/
  costeo
  auditoria
  seguridad
```

---

## ✅ Tests (23+ casos)

### Verificar estructura

```typescript
it("Debe contener items principales esperados", () => {
  expect(MAIN_MENU.map((i) => i.label)).toContain("Dashboard");
  expect(MAIN_MENU.map((i) => i.label)).toContain("Catálogos");
});
```

### Verificar renderizado

```typescript
it("Debe renderizar todos los items principales", () => {
  const links = fixture.debugElement.queryAll(By.css(".main-menu a"));
  expect(links.length).toBeGreaterThan(0);
});
```

### Verificar navegación

```typescript
it("Debe determinar activeParent para /inventario/kardex", () => {
  (router as any).url = "/inventario/kardex";
  component.ngOnInit();
  expect(component.activeParent?.label).toBe("Inventario");
});
```

**Ejecutar todos:**

```bash
ng test
```

---

## 🎨 Personalización Rápida

### Cambiar color principal

**Editar:** `src/app/layout/main-menu.component.ts`

```typescript
// Busca en styles:
background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
border-bottom: 3px solid #3b82f6;  ← Color de borde

// Reemplaza #3b82f6 con tu color
```

### Cambiar iconos

**Editar:** `src/app/models/menu.model.ts`

```typescript
// Antes
icon: "📚";

// Después (usar emoji diferente o Material Icon name)
icon: "library_books"; // Material icon
```

### Agregar tooltip

```typescript
{
  label: 'Productos',
  icon: '📦',
  route: '/catalogos/productos',
  tooltip: 'Gestión de productos del catálogo'  ← Aquí
}
```

---

## 📱 Responsive Breakpoints

| Ancho      | Cambio                              |
| ---------- | ----------------------------------- |
| 1024px+    | Grid submenú 4 columnas             |
| 768-1023px | Grid submenú 2 columnas             |
| <768px     | Grid submenú 1 columna, solo iconos |

**Probar:** DevTools → F12 → Responsive mode

---

## 🚀 Próximos Pasos (Optional)

### Agregar nueva sección al menú

1. **Editar** `menu.model.ts`: Añade nuevo item a `MAIN_MENU`
2. **Editar** `app.routes.ts`: Añade ruta con path y componente
3. **Editar** `main-menu.component.spec.ts`: Añade test de verificación
4. **Ejecutar** `ng test` → Validar que pasa

### Agregar control de acceso por roles

```typescript
{
  label: 'Admin Panel',
  icon: '🔐',
  route: '/admin',
  requiredRoles: ['ADMIN']  ← Solo admins ven esto
}
```

### Habilitar Lazy Loading (future)

```typescript
{
  path: 'catalogos',
  loadChildren: () => import('./modules/catalogos/catalogos.module')
    .then(m => m.CatalogosModule)
}
```

---

## 🐛 Troubleshooting

### P: El menú no aparece

**R:** Verifica que `<app-main-menu>` esté en `horizontal-layout.component.html`

### P: Los submenús no se muestran

**R:** Haz click en un item con ▼. Si no aparece, verifica `activeParent` en DevTools.

### P: Las rutas no funcionan

**R:** Confirma que la ruta en `menu.model.ts` coincida con `app.routes.ts`

### P: Los tests fallan

**R:** Ejecuta `ng test --watch` y revisa los errores específicos

---

## 📞 Soporte

- **Modelo:** `src/app/models/menu.model.ts`
- **Componente:** `src/app/layout/main-menu.component.ts`
- **Tests:** `src/app/layout/main-menu.component.spec.ts`
- **Rutas:** `src/app/app.routes.ts`

---

**¡Ready to go!** 🚀
