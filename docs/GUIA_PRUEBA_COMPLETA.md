# GUÍA DE PRUEBA - REDISEÑO SAAS BASE4EMPRESAS

## 🎯 OBJETIVO

Validar que el rediseño completo de la interfaz está funcionando correctamente en desarrollo y listo para producción.

---

## 📋 CHECKLIST DE VERIFICACIÓN

### PARTE 1: LAYOUT HORIZONTAL Y NAVEGACIÓN ✓

**1.1 Navbar Superior (Desktop)**

- [ ] **Logo visible**: "SGI" (avatar circular) + "Base4Empresas" (texto) en esquina superior izquierda
- [ ] **Menú horizontal**: Dashboard, Productos, Compras, Ventas, Inventario, Kardex
- [ ] **Menú items activos**: Tienen fondo claro/resaltado cuando estás en esa página
- [ ] **Buscador global**: Campo de búsqueda con icono de lupa en medio-derecha
- [ ] **Avatar usuario**: Icono de `account_circle` en esquina superior derecha
- [ ] **Color primario**: Toolbar es azul (#3b82f6)
- [ ] **Sombra suave**: La barra tiene sombra elegante

**1.2 Responsivo (Tablet/Móvil < 768px)**

- [ ] **Menú horizontal desaparece**: Se reemplaza por botón hamburguesa
- [ ] **Hamburguesa funciona**: Al hacer clic, abre sidenav con opciones de menú
- [ ] **Sidenav cierra al seleccionar**: Al hacer clic en un item, se cierra automáticamente
- [ ] **Buscador se colapsa**: Muestra solo icono de lupa, se expande al hacer clic
- [ ] **Layout no rompe**: Contenido es legible en pantalla pequeña

**1.3 Menú de Usuario**

- [ ] **Avatar clickeable**: Abre menú dropdown
- [ ] **Opciones visibles**:
  - Mi Perfil (deshabilitada/próximamente)
  - Configuración (deshabilitada/próximamente)
  - Tema (deshabilitada/próximamente)
  - Cerrar Sesión
- [ ] **Estilos correctos**: Avatar tiene gradiente azul, menú tiene separadores

---

### PARTE 2: BÚSQUEDA GLOBAL ✓

**2.1 Dashboard (Verificación general)**

- [ ] Ir a Dashboard
- [ ] Escribir en el buscador: "test" o cualquier término
- [ ] La búsqueda debería generar cambios (si hay datos relevantes)
- [ ] El debounce funciona: Solo busca después de parar de escribir por 300ms

**2.2 Productos**

- [ ] Ir a Productos
- [ ] Usar buscador global del toolbar para buscar por:
  - Nombre de producto: Ej. "manzana", "laptop"
  - SKU: Ej. "SKU001"
- [ ] La tabla se filtra en tiempo real
- [ ] Si no hay resultados: Mensaje "No se encontraron..."

**2.3 Compras**

- [ ] Ir a Compras
- [ ] Buscar por:
  - Número de compra: Ej. "C-001"
  - Proveedor (si aplica)
- [ ] La lista se actualiza
- [ ] Campo de búsqueda es global (desde toolbar)

**2.4 Ventas**

- [ ] Ir a Ventas
- [ ] Buscar por:
  - Número de venta
  - Cliente
- [ ] Filtrado funciona correctamente

**2.5 Inventario/Stock**

- [ ] Ir a Inventario
- [ ] Buscar por SKU o nombre de producto
- [ ] Resultados se filtran

**2.6 Kardex**

- [ ] Ir a Kardex
- [ ] Búsqueda global funciona
- [ ] Movimientos se filtran si es aplicable

---

### PARTE 3: DASHBOARD REDISEÑADO ✓

**3.1 Estructura Visual**

- [ ] **Encabezado**: Título "Dashboard" + subtítulo + fecha actual
- [ ] **4 KPI Cards** (primera fila):
  - Total Compras (con ícono, valor, tendencia %)
  - Total Ventas (con ícono, valor, tendencia %)
  - Total Productos (con ícono, valor)
  - Stock Bajo (con ícono, valor)
- [ ] Las tarjetas tienen:
  - Fondo blanco
  - Border-radius redondeado (12px)
  - Sombra suave
  - Icono coloreado en esquina
  - Valor en grande
  - Tendencia con flecha (↑/↓)

**3.2 Gráficos**

- [ ] **Gráfico de línea** (Ventas vs Compras, últimos 6 meses):
  - Dos líneas: una azul (Ventas), una púrpura/violeta (Compras)
  - Puntos en los datos
  - Leyenda arriba
  - Grid de fondo suave
  - Es responsivo (se ajusta al tamaño)

- [ ] **Doughnut chart** (Distribución de stock):
  - Mostrar 3 segmentos: Ventas, Compras, Otros
  - Colores distintivos
  - Leyenda en la parte inferior

**3.3 Listas**

- [ ] **"Últimas Compras"** (lado derecho):
  - Muestra: Proveedor, Fecha, Total
  - Si no hay compras: Mensaje "No hay compras recientes"
  - Cada item tiene formato claro

- [ ] **"Stock Bajo"** (fila inferior):
  - Muestra cantidad de productos con alerta
  - Icono de warning
  - Estilos claros

**3.4 Estados**

- [ ] **Loading**: Spinner mientras carga datos
- [ ] **Error**: Si hay error, muestra mensaje + botón "Reintentar"
- [ ] **Éxito**: Todos los datos cargan y se muestran correctamente

---

### PARTE 4: COMPONENTES DE LISTAS MEJORADOS ✓

**4.1 Productos**

- [ ] Tabla tiene columnas: SKU, Producto, Precio Venta, Precio Compra, Stock Mín., Estado
- [ ] Las filas son clickeables/tienen acciones
- [ ] Chip/badge de estado (ACTIVO/INACTIVO) con color
- [ ] Botones de acción: Ver, Editar, Eliminar (con iconos)
- [ ] Tabla es responsiva: En móvil hace scroll horizontal

**4.2 Compras**

- [ ] Tabla: Número, Fecha, Proveedor, Almacén, Estado, Total
- [ ] Acciones: Ver detalle, Editar, Eliminar
- [ ] Pagination: Muestra 10 items por página (configurable)

**4.3 Ventas**

- [ ] Tabla: Número, Fecha, Cliente, Almacén, Estado, Pago, Total
- [ ] Badges de estado de pago (Pendiente, Pagado, etc.)
- [ ] Acciones funcionales

**4.4 Inventario**

- [ ] Tabla: SKU, Producto, Stock Actual, Stock Mínimo, Estado
- [ ] Stock bajo se resalta visualmente (color rojo/naranja)
- [ ] Acciones: Ver detalle, Ver Kardex

**4.5 Kardex**

- [ ] Tabla: Tipo movimiento, Cantidad, Costo unitario, Fecha, etc.
- [ ] Totales calculados: Entrada total, Salida total, Balance
- [ ] Búsqueda filtra movimientos

---

### PARTE 5: PALETA DE COLORES ✓

**5.1 Colores Primarios**

- [ ] **Azul primario (#3b82f6)**:
  - Toolbar background: SÍ
  - Botones primarios: SÍ
  - Enlaces activos: SÍ
  - Hover states: SÍ

- [ ] **Verde secundario (#10b981)**:
  - Botones de éxito: SÍ
  - Checkmarks: SÍ
  - Status positivos: SÍ

- [ ] **Rojo de warning (#ef4444)**:
  - Errores: SÍ
  - Botones de eliminar: SÍ
  - Alertas: SÍ

**5.2 Fondos y Contraste**

- [ ] **Fondo página**: Gris muy claro (#f8fafc) - NO blanco puro
- [ ] **Tarjetas**: Fondo blanco con sombra suave
- [ ] **Contraste de texto**: Negro oscuro sobre blanco (legible)
- [ ] **Texto secundario**: Gris medio (#6b7280)
- [ ] **Bordes**: Gris claro (#e5e7eb)

---

### PARTE 6: ESTILOS Y TIPOGRAFÍA ✓

**6.1 Border Radius**

- [ ] Navbar: Square (0px)
- [ ] Tarjetas: 12px (notablemente redondeadas)
- [ ] Botones: 8px (moderado)
- [ ] Inputs: 8px
- [ ] Avatar: 50% (circular)

**6.2 Sombras**

- [ ] Navbar: Sombra suave (1px offset)
- [ ] Tarjetas en reposo: sombra suave (base)
- [ ] Tarjetas on hover: sombra más profunda (elevación)
- [ ] Modales: sombra profunda (xlarge)

**6.3 Espaciado**

- [ ] Márgenes interiores (padding) en tarjetas: ~24px
- [ ] Gap entre elementos: 16px o 20px (generoso)
- [ ] Grid de tarjetas: Gap visual claro (~20px)
- [ ] Página principal: Padding de contenido ~24px

**6.4 Tipografía**

- [ ] Font: Sistema nativo (BlinkMacSystemFont, 'Segoe UI', Roboto)
- [ ] Títulos h1: ~32px, bold (700)
- [ ] Subtítulos: ~14px, medium (500)
- [ ] Cuerpo: ~14px, regular (400)
- [ ] Pequeño: ~12px, regular
- [ ] Todo debe ser legible en cualquier pantalla

---

### PARTE 7: FUNCIONALIDAD (SIN REGRESIONES) ✓

**7.1 CRUD Productos**

- [ ] Crear producto: ¿Funciona?
- [ ] Leer productos: ¿Se cargan?
- [ ] Actualizar producto: ¿Se actualiza?
- [ ] Eliminar producto: ¿Se borra?

**7.2 CRUD Compras**

- [ ] Crear compra: ¿Funciona?
- [ ] Ver compra: ¿Se abre detalle?
- [ ] Eliminar compra: ¿Se borra?

**7.3 CRUD Ventas**

- [ ] Crear venta: ¿Funciona?
- [ ] Ver venta: ¿Se abre detalle?
- [ ] Eliminar venta: ¿Se borra?

**7.4 Stock/Inventario**

- [ ] Ver stock: ¿Carga correctamente?
- [ ] Filtrar por almacén: ¿Funciona?
- [ ] Ver Kardex desde stock: ¿Navega?

**7.5 Kardex**

- [ ] Cargar movimientos: ¿Se muestran?
- [ ] Totales se calculan: ¿Correctamente?
- [ ] Filtrar por rango: ¿Funciona?

---

### PARTE 8: PERFORMANCE Y NAVEGADOR ✓

**8.1 Console**

- [ ] Abrir DevTools (F12 / Cmd+Opt+I)
- [ ] Ir a pestaña Console
- [ ] ¿Hay errores en rojo? → NO
- [ ] ¿Hay warnings esperados (budget)? → Sí, pero no bloquean

**8.2 Network**

- [ ] Main bundle: ~280KB gzipped (aceptable)
- [ ] Tiempo de carga: <3 segundos (en red rápida)
- [ ] Assets se cachean correctamente

**8.3 Performance (Lighthouse)**

- [ ] Abrir DevTools → Lighthouse
- [ ] Performance: >60 (objetivo)
- [ ] Accessibility: >90
- [ ] Best Practices: >90

**8.4 Browser Compatibility**

- [ ] Chrome/Edge: ✓ Funciona
- [ ] Firefox: ✓ Funciona
- [ ] Safari: ✓ Funciona
- [ ] Mobile (iOS Safari, Chrome Android): ✓ Funciona

---

### PARTE 9: SSR (OPCIONAL - Si se ejecuta con ng serve --ssr)\*\*

**9.1 Server-Side Rendering**

- [ ] Build: `npm run build` → Genera dist/ con /server
- [ ] Ejecutar: `node dist/base4empresas/server/server.mjs`
- [ ] Acceder a: http://localhost:4000
- [ ] ¿Carga la página?
- [ ] ¿Se renderiza correctamente el HTML en servidor?
- [ ] ¿Los datos iniciales se cargan en el servidor?

**9.2 Navegación SSR**

- [ ] Clic en Dashboard desde navbar → Navega en servidor
- [ ] Buscador funciona → Busca en servidor
- [ ] Sin JavaScript, ¿navega igualmente? (degradación elegante)

---

### PARTE 10: ACCESIBILIDAD ✓

**10.1 Keyboard Navigation**

- [ ] Tab: Navega a través de elementos interactivos
- [ ] Enter: Activa botones y enlaces
- [ ] Escape: Cierra menús y modales
- [ ] Focus visible: Hay indicador visual (outline/border)

**10.2 Screen Reader**

- [ ] Aria-labels en botones: "Abrir menú", "Buscar", etc.
- [ ] Títulos semánticos: h1, h2, etc.
- [ ] Imágenes/iconos tienen alt text o aria-hidden

**10.3 Color Contrast**

- [ ] Texto oscuro sobre blanco: Ratio >4.5:1 ✓
- [ ] Texto sobre colores: Legible
- [ ] No solo confiar en color para diferencias

---

## 🚀 INSTRUCCIONES PASO A PASO

### Opción A: Desarrollo Local (Recomendado para testing)

```bash
# 1. Ir a directorio del proyecto
cd /ruta/al/base4empresas

# 2. Instalar dependencias (si es primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm start

# 4. Abrir navegador
# Acceder a: http://localhost:4200

# 5. Dejar corriendo y probar todos los checklist anteriores

# 6. Para detener: Ctrl+C en terminal
```

### Opción B: Build de Producción

```bash
# 1. Compilar
npm run build

# 2. Si compila sin errores → Éxito ✓
# Output: dist/base4empresas/

# 3. Para servir localmente (OPCIONAL):
npm install -g http-server  # Si no está instalado
http-server dist/base4empresas/browser -c-1

# 4. Acceder a: http://localhost:8080
```

### Opción C: SSR (Server-Side Rendering)

```bash
# 1. Compilar con SSR
npm run build

# 2. Ejecutar servidor SSR
node dist/base4empresas/server/server.mjs

# 3. Acceder a: http://localhost:4000

# 4. Ver que HTML está renderizado en servidor (Ver código fuente)
```

---

## 📊 RESULTADOS ESPERADOS

### Después de Implementar TODO:

✅ **Interfaz profesional tipo SaaS**

- Navbar horizontal elegante
- Colores modernos y coherentes
- Espaciado y sombras profesionales

✅ **Búsqueda Global Funcional**

- Buscador global en toolbar
- Debounce de 300ms para performance
- Funciona en todos los módulos
- Filtra datos en tiempo real

✅ **Dashboard Ejecutivo**

- 4 KPIs con tendencias
- Gráficos responsivos con datos reales
- Listas de últimos movimientos
- Estados de carga y error

✅ **100% de Funcionalidad Preservada**

- CRUD de productos, compras, ventas, inventario, kardex
- Notificaciones funcionan
- Navegación funciona
- API calls funcionan

✅ **Performance Optimizado**

- Bundle: ~280KB gzipped
- OnPush change detection
- TrackBy en listas
- Debounce en búsqueda

✅ **Compatible con SSR**

- Build con servidor
- Renderiza en servidor
- Degradación elegante

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

| Problema               | Solución                                                        |
| ---------------------- | --------------------------------------------------------------- |
| CSS no se aplica       | Limpiar cache: Ctrl+Shift+R (Chrome) o Cmd+Shift+R (Mac)        |
| Búsqueda no funciona   | Verificar que SearchService está inyectado en componentes       |
| Estilos Material rotos | Verificar que MatModule está importado en component             |
| Build falla            | Ejecutar `npm run build` nuevamente, ver errores en console     |
| Responsive no funciona | Abrir DevTools (F12), cambiar a Device Mode (Ctrl+Shift+M)      |
| Gráficos no muestran   | Verificar que ng2-charts está instalado (`npm list ng2-charts`) |

---

## 📞 SOPORTE

Si algo no funciona:

1. Revisar el archivo: `REDISENO_SAAS_COMPLETO.md` (resumen de todos los cambios)
2. Ver logs en console (F12 → Console)
3. Verificar que todos los archivos están presentes en `src/app/`
4. Hacer `npm run build` para validar que compila sin errores

---

## ✅ SIGN-OFF DE VERIFICACIÓN

Una vez hayas completado TODOS los checklist anteriores:

```
PROYECTO VALIDADO ✓

Componentes: _______________
Funcionalidad: _______________
Performance: _______________
Accesibilidad: _______________
SSR: _______________

Fecha: _______________
Responsable: _______________

LISTO PARA PRODUCCIÓN: ☐ SÍ ☐ NO
```

---

**¡Gracias por usar el rediseño SaaS profesional de Base4Empresas!**

Generado: 2026-05-06 por GitHub Copilot Senior
