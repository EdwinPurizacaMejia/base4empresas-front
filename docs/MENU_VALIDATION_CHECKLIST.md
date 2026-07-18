# ✅ Checklist de Validación - Menú Rediseñado

**Propósito**: Verificar que la integración del nuevo menú se completó correctamente  
**Tiempo estimado**: 30 minutos  
**Versión**: 1.0.0

---

## 📋 Fase 1: Validación de Archivos

- [ ] Archivo `src/app/models/menu.model.ts` existe
- [ ] Archivo `src/app/layout/main-menu.component.ts` existe
- [ ] Archivo `src/app/layout/main-menu.component.spec.ts` existe
- [ ] NO hay errores de sintaxis en los 3 archivos
- [ ] `menu.model.ts` exporta `MenuItem` interface
- [ ] `menu.model.ts` exporta `MAIN_MENU` constante
- [ ] `MAIN_MENU` contiene 6 items principales (sin contar children)
- [ ] Todos los items en `MAIN_MENU` tienen `label` e `icon`

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 2: Validación de Estructura del Menú

### Items Principales (6)

- [ ] Dashboard (route: /dashboard, sin children)
- [ ] Catálogos (sin route, 7 children)
- [ ] Ventas (sin route, 2+ children)
- [ ] Inventario (sin route, 4 children)
- [ ] Logística (sin route, 1+ children)
- [ ] Compras (sin route, 1+ children)
- [ ] Configuración (sin route, 3 children)

### Submenús Catálogos (7)

- [ ] Productos → /catalogos/productos
- [ ] Categorías → /catalogos/categorias
- [ ] Unidades → /catalogos/unidades
- [ ] Almacenes → /catalogos/almacenes
- [ ] Canales de venta → /catalogos/canales-venta
- [ ] Clientes → /catalogos/clientes
- [ ] Proveedores → /catalogos/proveedores

### Submenús Ventas (2+)

- [ ] Pedidos → /ventas/pedidos
- [ ] Pagos → /ventas/pagos

### Submenús Inventario (4)

- [ ] Stock actual → /inventario/stock
- [ ] Kardex → /inventario/kardex
- [ ] Ajustes de stock → /inventario/ajustes
- [ ] Transferencias → /inventario/transferencias

### Submenús Logística (1+)

- [ ] Envíos → /logistica/envios

### Submenús Configuración (3)

- [ ] Auditoría → /config/auditoria
- [ ] Seguridad → /config/seguridad
- [ ] Configuración de costeo → /config/costeo

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 3: Validación de Compilación

```bash
# Ejecutar en terminal:
ng build --prod
```

- [ ] Build completada sin errores ❌
- [ ] NO hay advertencias TypeScript
- [ ] NO hay advertencias de linting
- [ ] Archivo bundle generado exitosamente
- [ ] Tamaño bundle razonable (~8-12 KB)

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 4: Validación de Tests

```bash
# Ejecutar en terminal:
ng test --include='**/main-menu.component.spec.ts' --watch=false
```

- [ ] Todos los tests pasan ✅
- [ ] 25+ tests ejecutados
- [ ] Coverage > 90%
- [ ] NO hay skipped tests
- [ ] NO hay failing tests

**Breakdown esperado**:

- [ ] Menu Model suite: 9 tests ✅
- [ ] Renderizado suite: 5 tests ✅
- [ ] Submenú suite: 4 tests ✅
- [ ] Interacción suite: 3 tests ✅
- [ ] Ciclo de vida suite: 1 test ✅
- [ ] Estilos suite: 2 tests ✅

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 5: Validación de Integración en Layout

En `src/app/layout/layout.component.ts`:

- [ ] Import: `import { MainMenuComponent } from './main-menu.component'`
- [ ] Imports array contiene `MainMenuComponent`
- [ ] Template contiene `<app-main-menu></app-main-menu>`
- [ ] `<app-main-menu>` está entre `<app-toolbar>` y `<main>`
- [ ] NO hay errores de compilación

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 6: Validación de Rutas

En `src/app/app.routes.ts`:

- [ ] Rutas están agrupadas por dominio (/catalogos, /ventas, etc.)
- [ ] Todas las rutas en MAIN_MENU tienen componentes correspondientes
- [ ] Redirect inicial: '' → 'dashboard'
- [ ] Components están importados correctamente
- [ ] NO hay conflictos de rutas

**Rutas verificadas**:

- [ ] /dashboard
- [ ] /catalogos/productos, /catalogos/clientes, /catalogos/proveedores
- [ ] /ventas/pedidos, /ventas/pagos
- [ ] /inventario/stock, /inventario/kardex
- [ ] /logistica/envios
- [ ] /compras/ordenes
- [ ] /config/auditoria, /config/seguridad, /config/costeo

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 7: Validación en Navegador - Desktop

```bash
# Ejecutar en terminal:
ng serve --open
```

Esperar hasta que el servidor esté listo, luego:

### Layout General

- [ ] Toolbar está visible en la parte superior
- [ ] Menú principal está visible debajo del toolbar
- [ ] Menú horizontal está bien formado (iconos + labels)
- [ ] NO hay errores en consola de browser (F12 → Console)

### Menú Principal - Renderizado

- [ ] Dashboard icon (📊) visible
- [ ] Catálogos icon (📚) visible
- [ ] Ventas icon (💰) visible
- [ ] Inventario icon (📦) visible
- [ ] Logística icon (🚚) visible
- [ ] Compras icon (🛍️) visible
- [ ] Configuración icon (⚙️) visible

### Menú Principal - Styling

- [ ] Background es degradado azul oscuro
- [ ] Border inferior es azul (#3b82f6)
- [ ] Labels son blancos/grises
- [ ] Iconos son visibles y legibles
- [ ] Hover efecto funciona (cambia color)

### Menú Principal - Comportamiento (Interactivo)

- [ ] Hover en Dashboard: color cambia ✓
- [ ] Click en Dashboard: navega a /dashboard ✓
- [ ] Dashboard activo: aplica estilo active (color diferente, borde) ✓
- [ ] Dashboard label visible: "Dashboard" ✓

### Submenú - Initial (Vacío)

- [ ] NO hay submenú visible cuando app carga
- [ ] Submenú solo aparece cuando se selecciona item con children ✓

### Submenú - Catálogos

- [ ] Click en Catálogos expande submenú
- [ ] Header muestra: "📚 CATÁLOGOS"
- [ ] 7 items visibles: Productos, Categorías, Unidades, Almacenes, Canales, Clientes, Proveedores
- [ ] Items en grid layout (no lista)
- [ ] Hover en item de submenú: color cambia ✓
- [ ] Click en "Productos": navega a /catalogos/productos ✓
- [ ] URL cambia a /catalogos/productos ✓

### Submenú - Ventas

- [ ] Click en Ventas expande submenú
- [ ] 2+ items visibles: Pedidos, Pagos
- [ ] Click en "Pedidos": navega a /ventas/pedidos ✓
- [ ] URL cambia a /ventas/pedidos ✓

### Submenú - Inventario

- [ ] Click en Inventario expande submenú
- [ ] 4 items visibles: Stock actual, Kardex, Ajustes, Transferencias
- [ ] Click en "Stock actual": navega a /inventario/stock ✓

### Active State Tracking

- [ ] Cuando estás en /catalogos/productos:
  - [ ] "Catálogos" está activo en menú principal (estilo diferente)
  - [ ] Submenú de Catálogos está visible
  - [ ] "Productos" en submenú está activo
- [ ] Cuando cambias a /ventas/pedidos:
  - [ ] "Ventas" ahora está activo en menú principal
  - [ ] Submenú de Catálogos desaparece
  - [ ] Submenú de Ventas aparece
  - [ ] "Pedidos" en submenú está activo

### Content Area

- [ ] Componente correcto renderiza en area de contenido
- [ ] NO hay errores HTTP 404
- [ ] Data carga correctamente (si hay datos)

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 8: Validación en Navegador - Mobile

```bash
# Usar Chrome DevTools Mobile (F12 → Toggle device toolbar)
# O acceder desde dispositivo real
```

### Layout Responsive

- [ ] Menú se adapta a pantalla pequeña
- [ ] Labels del menú principal están ocultos (solo iconos)
- [ ] Iconos sigue visible y legible
- [ ] NO hay overflow horizontal
- [ ] Submenú en grid de 1 columna (no multi-columna)

### Interacción Mobile

- [ ] Touch en Dashboard navega a /dashboard ✓
- [ ] Touch en Catálogos expande submenú ✓
- [ ] Touch en item de submenú navega correctamente ✓
- [ ] NO hay elementos que requieran scroll horizontal

### Performance Mobile

- [ ] Menú carga rápidamente
- [ ] Transiciones son suaves
- [ ] NO hay lag en interacciones

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 9: Validación de Casos Especiales

### Navegación por URL Directa

- [ ] Acceder a http://localhost:4200/catalogos/clientes
  - [ ] Catálogos está activo ✓
  - [ ] Submenú de Catálogos se muestra ✓
  - [ ] "Clientes" está activo en submenú ✓
- [ ] Acceder a http://localhost:4200/config/auditoria
  - [ ] Configuración está activo ✓
  - [ ] Submenú de Configuración se muestra ✓
  - [ ] "Auditoría" está activo ✓

### Back Button del Browser

- [ ] Usuario en /catalogos/productos
- [ ] Click en Ventas → navega a /ventas/pedidos
- [ ] Click botón back del navegador → vuelve a /catalogos/productos
- [ ] Menú se actualiza correctamente ✓
- [ ] Catálogos está activo nuevamente ✓

### Reload de Página

- [ ] Usuario en /inventario/kardex
- [ ] F5 para recargar
- [ ] Menú se mantiene en estado correcto ✓
- [ ] Inventario sigue siendo activo ✓
- [ ] Submenú de Inventario visible ✓
- [ ] "Kardex" sigue activo ✓

### Error Handling

- [ ] Acceder a ruta inexistente: /ruta/invalida
- [ ] APP NO se rompe
- [ ] Menú sigue funcional
- [ ] Mensaje de error aparece si componente no existe

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 10: Validación de Performance

### Bundle Size

```bash
# Ejecutar:
ng build --prod --stats-json

# Analizar:
npm run webpack-bundle-analyzer
```

- [ ] main.js < 500 KB
- [ ] MainMenuComponent contribuye < 10 KB
- [ ] NO hay bundle bloat inesperado

### Runtime Performance

- [ ] Menú interacciones < 100ms
- [ ] Navegación entre items < 200ms
- [ ] NO hay janky animations
- [ ] NO hay CPU spikes en DevTools

### Memory Leaks

```bash
# En Chrome DevTools:
# Detach + Attach multiple times
# Take heap snapshots
# Verificar que no hay crecimiento de memoria
```

- [ ] NO hay memory leaks detectables
- [ ] Subscriptions se limpian en ngOnDestroy
- [ ] takeUntil funciona correctamente

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 11: Validación de Accesibilidad (WCAG)

### Keyboard Navigation

- [ ] Tab navega a través de items del menú
- [ ] Enter activa items (navegación)
- [ ] Keyboard focus es visible

### Screen Reader

- [ ] Labels son legibles por screen reader
- [ ] Iconos tienen aria-labels
- [ ] Estructura semántica correcta (<nav>, <a>)

### Color Contrast

- [ ] Texto contrasta suficientemente con background
- [ ] Elementos activos son claramente distinguibles
- [ ] NO depende solo de color para indicar estado

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Fase 12: Validación de Documentación

- [ ] MENU_REDESIGN_GUIDE.md existe y es leíble
- [ ] MENU_INTEGRATION_EXAMPLE.ts existe con código de ejemplo
- [ ] MENU_IMPLEMENTATION_SUMMARY.md existe con resumen
- [ ] MENU_VISUAL_REFERENCE.md existe con visuales
- [ ] JSDoc en código es exhaustivo
- [ ] Instrucciones de integración son claras

**Resultado**: ✅ PASS / ❌ FAIL

---

## 📋 Resumen Final

| Fase                  | Items   | Resultado   |
| --------------------- | ------- | ----------- |
| 1: Archivos           | 8       | ✅ / ❌     |
| 2: Estructura         | 21      | ✅ / ❌     |
| 3: Compilación        | 5       | ✅ / ❌     |
| 4: Tests              | 6       | ✅ / ❌     |
| 5: Layout Integration | 5       | ✅ / ❌     |
| 6: Rutas              | 8       | ✅ / ❌     |
| 7: Desktop Browser    | 28      | ✅ / ❌     |
| 8: Mobile Browser     | 6       | ✅ / ❌     |
| 9: Casos Especiales   | 11      | ✅ / ❌     |
| 10: Performance       | 6       | ✅ / ❌     |
| 11: Accesibilidad     | 7       | ✅ / ❌     |
| 12: Documentación     | 6       | ✅ / ❌     |
| **TOTAL**             | **117** | **✅ / ❌** |

---

## 🎯 Criterio de Aceptación

- ✅ **GREEN**: Todas las fases PASS
- 🟡 **YELLOW**: 1-2 fases con pequeños issues (fácil de arreglar)
- 🔴 **RED**: 3+ fases con issues o no compila

**Objetivo**: Alcanzar status ✅ GREEN

---

## 📝 Notas para QA

Si algo falla:

1. **Compilación falla**: Revisar syntax en archivos TS
2. **Tests fallan**: Ejecutar `npm ci` y volver a correr tests
3. **Menú no aparece**: Verificar que `<app-main-menu>` está en layout template
4. **Navegación no funciona**: Verificar que rutas en MAIN_MENU coinciden con app.routes.ts
5. **Estilos raros**: Limpiar cache del navegador (Ctrl+Shift+Delete)
6. **Performance lenta**: Revisar DevTools Performance tab

---

## ✍️ Sign-Off

| Rol           | Nombre       | Fecha        | Firma        |
| ------------- | ------------ | ------------ | ------------ |
| QA Lead       | ****\_\_**** | ****\_\_**** | ****\_\_**** |
| Tech Lead     | ****\_\_**** | ****\_\_**** | ****\_\_**** |
| Product Owner | ****\_\_**** | ****\_\_**** | ****\_\_**** |

---

**Una vez completado**: Proceder con deploy a producción ✅

---

**Documento versión**: 1.0.0  
**Última actualización**: 26 de mayo de 2026  
**Aplicable a**: base4empresas Frontend v1.0+
