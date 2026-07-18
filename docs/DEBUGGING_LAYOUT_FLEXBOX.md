# 🔍 Guía de Debugging - Layout Flexbox

## 📊 Estado Actual

Compilación: ✅ Exitosa
Cambios Aplicados:

- ✅ `.layout-main` con `flex-direction: row`
- ✅ `::ng-deep app-sidebar` con `flex-shrink: 0` + `!important`
- ✅ `.layout-content` con `flex: 1` + `min-width: 0`

---

## 🔧 Checklist de Debugging en DevTools

### 1️⃣ Abre DevTools (F12)

### 2️⃣ Inspecciona `.layout-main` (Padre del Sidebar)

**Ubica el elemento:**

1. Click derecho en el sidebar → **Inspect**
2. Busca en el panel **Elements** el elemento: `<div class="layout-main">`
3. Expande para ver su estructura hijo

**Verifica propiedades CSS:**

```
✓ display: flex
✓ flex-direction: row
✓ flex: 1
✓ width: 100%
✓ overflow: hidden
✓ height: [debe ocupar espacio disponible]
```

**En el panel Styles, busca:**

- `layout.component.css:21` - Debe mostrar todas las propiedades aplicadas
- Si ves conflictos (strikethrough), es que otro CSS las anula

### 3️⃣ Inspecciona `<app-sidebar>` (Componente Custom)

**En el mismo panel Elements:**

1. Localiza: `<app-sidebar [isOpen]="sidebarOpen"...>`
2. Mira su **Computed Styles** en el panel derecho

**Debe mostrar:**

```
✓ display: flex  [si aparece "block", esto es el problema]
✓ flex-shrink: 0
✓ width: 260px  [o 80px si está colapsado]
✓ min-width: 80px
```

**En Styles, debe aparecer:**

- Una regla de `::ng-deep app-sidebar { ... }` desde `layout.component.css`
- Si NO aparece, significa que los selectores CSS no están aplicándose

### 4️⃣ Inspecciona `<main class="layout-content">`

**Ubica el elemento:**

1. Busca: `<main class="layout-content">`
2. Verifica sus Computed Styles

**Debe mostrar:**

```
✓ display: flex
✓ flex: 1  [esto hace que OCUPE TODO el espacio restante]
✓ flex-direction: column
✓ overflow-y: auto
✓ width: [debe ser el ancho RESTANTE después del sidebar]
```

### 5️⃣ Box Model Visualization

En el panel de **Styles**, desplázate hacia abajo hasta encontrar el **Box Model**.

**Para `.layout-main`:**

```
┌──────────────────────────────────────────┐
│ margin                                    │
├──────────────────────────────────────────┤
│ border                                    │
├──────────────────────────────────────────┤
│ ┌─────────────┬───────────────────────┐  │
│ │             │                       │  │
│ │  Sidebar    │  Main Content         │  │
│ │  (260px)    │  (flex: 1)            │  │
│ │             │                       │  │
│ └─────────────┴───────────────────────┘  │
│ padding                                   │
├──────────────────────────────────────────┤
│ content [mostrado arriba]                 │
└──────────────────────────────────────────┘
```

---

## ❌ Señales de Alerta

### Problema 1: `app-sidebar` muestra `display: block`

**Causa:** Los estilos `::ng-deep` no se están aplicando
**Solución:** Ver sección "Solución Alternativa"

### Problema 2: `layout-content` tiene `width: 0` o muy pequeño

**Causa:** `flex: 1` no está trabajando correctamente
**Solución:** Verificar que `.layout-main` sea flex-direction: row

### Problema 3: Sidebar y contenido están UNO ENCIMA DEL OTRO

**Causa:** `.layout-main` está `flex-direction: column` o `display: block`
**Solución:** Verificar CSS en "Styles" tab

### Problema 4: Todo está invisible o cortado

**Causa:** Posiblemente `overflow: hidden` en `.layout-main` está cortando contenido
**Solución:** Cambiar a `overflow: visible` temporalmente

---

## 🧪 Prueba Quick (Console)

Abre la Console en DevTools y ejecuta:

```javascript
// 1. Verificar que .layout-main existe y tiene flex-direction: row
const layoutMain = document.querySelector(".layout-main");
console.log("Layout Main:", {
  display: window.getComputedStyle(layoutMain).display,
  flexDirection: window.getComputedStyle(layoutMain).flexDirection,
  flex: window.getComputedStyle(layoutMain).flex,
  width: window.getComputedStyle(layoutMain).width,
  height: window.getComputedStyle(layoutMain).height,
});

// 2. Verificar que app-sidebar tiene flex-shrink: 0
const appSidebar = document.querySelector("app-sidebar");
console.log("App Sidebar:", {
  display: window.getComputedStyle(appSidebar).display,
  flexShrink: window.getComputedStyle(appSidebar).flexShrink,
  width: window.getComputedStyle(appSidebar).width,
  minWidth: window.getComputedStyle(appSidebar).minWidth,
});

// 3. Verificar que layout-content tiene flex: 1
const layoutContent = document.querySelector(".layout-content");
console.log("Layout Content:", {
  display: window.getComputedStyle(layoutContent).display,
  flex: window.getComputedStyle(layoutContent).flex,
  width: window.getComputedStyle(layoutContent).width,
  minWidth: window.getComputedStyle(layoutContent).minWidth,
});
```

**Resultado esperado:**

```javascript
Layout Main: {
  display: "flex",
  flexDirection: "row",      ← CRÍTICO
  flex: "1 1 auto",
  width: "100%",
  height: "[somevalue]px"
}

App Sidebar: {
  display: "flex",           ← CRÍTICO: debe ser "flex" no "block"
  flexShrink: "0",           ← CRÍTICO
  width: "260px",            ← o "80px" si colapsado
  minWidth: "80px"
}

Layout Content: {
  display: "flex",
  flex: "1 1 auto",          ← CRÍTICO: debe ser "1 1 auto" o similar
  width: "[remaining-width]px",
  minWidth: "0px"
}
```

---

## 🚨 Si el Problema Persiste

### Opción A: Revisar si hay CSS Global interfiriendo

1. En DevTools → **Sources** tab
2. Busca: `styles.css` o `styles.scss`
3. Revisa si hay estilos que estén cambiando `display`, `flex`, `width`, etc.

### Opción B: Verificar Angular Material

1. Si estás usando Material Components, puede que tenga CSS que interfiera
2. En DevTools → **Elements**
3. Busca si hay `<style>` tags adicionales que no reconozcas

### Opción C: Desabilitar Cache

1. DevTools → **Settings** (⚙️)
2. **Network** → Habilita **"Disable cache (while DevTools is open)"**
3. Recarga: **Ctrl+Shift+R** (hard refresh)

### Opción D: Nuclear Option - CSS Debug

Reemplaza temporalmente el archivo `layout.component.css` con esto:

```css
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
  overflow: hidden;
}

.layout-main {
  display: flex;
  flex-direction: row; /* ROW = Horizontal */
  flex: 1;
  overflow: hidden;
  width: 100%;
  background: #00ff00; /* DEBUG: Verde para ver el contenedor */
}

::ng-deep app-sidebar {
  display: flex !important;
  flex-shrink: 0 !important;
  width: 260px !important;
  min-width: 80px !important;
  background: #ff0000; /* DEBUG: Rojo para ver el sidebar */
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  background: #0000ff; /* DEBUG: Azul para ver el contenido */
  min-width: 0;
}
```

**Resultado esperado:**

- Rojo (sidebar) a la IZQUIERDA
- Azul (contenido) a la DERECHA
- Si ves Rojo + Azul UNO ENCIMA DEL OTRO → el problema está en `.layout-main`

### Opción E: Solución Nuclear - Usar ViewEncapsulation.None

Edita `layout.component.ts`:

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [...],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  encapsulation: ViewEncapsulation.None  // ← AGREGAR ESTO
})
export class LayoutComponent implements OnInit {
  // ...
}
```

Esto hace que los estilos del componente NO tengan encapsulación, permitiendo que se aplique CSS externo directamente.

---

## 📸 Captura de Pantalla Esperada

Debería verse así:

```
┌─────────────────────────────────────────┐
│         TOOLBAR (64px)                  │
├────────────┬────────────────────────────┤
│            │                            │
│  SIDEBAR   │  CONTENIDO PRINCIPAL       │
│  (260px)   │  (flex: 1 = ocupa resto)  │
│            │                            │
│  - Items   │  - Inventario              │
│  - Menu    │  - Almacén                 │
│  - etc     │  - SKU                     │
│            │                            │
│            │  scroll aquí →             │
│            │                            │
└────────────┴────────────────────────────┘
```

---

## 🎯 Próximos Pasos

1. **Ejecuta el comando Console** arriba
2. **Comparte los resultados** en el chat
3. **Toma una captura** de la disposición actual
4. Si nada funciona, activamos **Opción E (ViewEncapsulation.None)**

---

## 📞 Support

Si después de todo esto el problema persiste:

1. ✅ Estilos se ven en DevTools pero no funcionan → ViewEncapsulation issue
2. ✅ No ves los estilos en DevTools → CSS Selector problema
3. ✅ Ves estilos pero están strikethrough → CSS Priority problema (usa `!important`)
