# Propuesta de Mejora UX/UI - Base4Empresas

Fecha: 2026-07-17  
Estado: Propuesta (sin cambios implementados)

## 1) Objetivo

Mejorar la experiencia de uso en menu, listados, filtros, formularios de alta/edicion, popup de eliminacion y dashboard, con una linea visual consistente, moderna y orientada a productividad operativa.

## 2) Diagnostico General

Situacion actual observada:

- Existen patrones visuales mezclados (gradientes, colores distintos, controles con estilos diferentes segun modulo).
- Se usan emojis e iconografia heterogenea en navegacion.
- Formularios y tablas tienen buena base funcional, pero con inconsistencias de jerarquia visual.
- El popup de eliminacion usa confirmacion nativa del navegador (inconsistente con la UI global).

Impacto:

- Mayor carga cognitiva para el usuario.
- Menor sensacion de producto unificado.
- Friccion en tareas recurrentes (buscar, filtrar, crear, editar, eliminar).

## 3) Direccion Visual Propuesta (Design System v2)

### 3.1 Principios

- Colores solidos, sin gradientes en estructuras base (menu, botones primarios, contenedores principales).
- Iconos de un solo color.
- Tipografia consistente en toda la aplicacion.
- Jerarquia visual clara: encabezado, herramientas, contenido, acciones.
- Accesibilidad y legibilidad como criterio central.

### 3.2 Tipografia

- Titulos, navegacion, labels: Manrope
- Texto de contenido y tablas: Inter
- Escala recomendada: 12, 14, 16, 20, 24, 32
- Peso recomendado:
  - Titulos: 700
  - Labels y menu: 600
  - Texto normal: 400/500

### 3.3 Paleta de color (solida)

- Primario: #2563EB
- Primario hover: #1D4ED8
- Fondo aplicacion: #F4F6FA
- Superficie (cards/modales/tablas): #FFFFFF
- Texto principal: #0F172A
- Texto secundario: #64748B
- Bordes: #E2E8F0
- Exito: #16A34A
- Advertencia: #D97706
- Error: #DC2626
- Info: #0284C7

### 3.4 Iconografia

- Libreria: Material Symbols Rounded
- Monocolor por contexto:
  - Navegacion: gris claro/blanco segun fondo
  - Acciones normales: gris medio
  - Accion primaria: azul
  - Accion destructiva: rojo
- Tamano base:
  - Sidebar: 18px
  - Botones de accion en tablas: 18px
  - Titulos de seccion: 16px

### 3.5 Espaciado, bordes y sombras

- Escala de spacing: 4, 8, 12, 16, 20, 24, 32
- Altura de controles: 40px
- Radius:
  - Inputs/selects: 10px
  - Cards: 12px
  - Modales: 14px
- Sombra base: 0 1px 2px rgba(15, 23, 42, .06)
- Sombra hover: 0 8px 20px rgba(15, 23, 42, .10)

### 3.6 Estados e interacciones

- Hover y focus con transicion de 150ms
- Focus ring visible de 2px (accesibilidad)
- Estados consistentes para error/disabled/read-only/loading

## 4) Propuesta por Pantalla

### 4.1 Menu lateral

Problemas actuales:

- Ruido visual por degradado + emojis.
- Jerarquia de niveles mejorable en mobile.
- Estado activo/hover no totalmente uniforme.

Propuesta:

- Sidebar color solido #0F172A.
- Reemplazar emojis por iconos monocolor.
- Nivel 1: 44px alto, semibold.
- Nivel 2: 38px alto, indentado 16px.
- Item activo:
  - Fondo #1E293B
  - Borde izquierdo 3px #2563EB
  - Texto/icono en blanco
- Hover suave: rgba(255,255,255,.06)
- Mobile: drawer sobre contenido (ancho 280px) con cierre automatico al navegar.
- Agregar buscador rapido de modulos en menu ("Ir a...").

Resultado esperado:

- Navegacion mas rapida, menos fatiga visual y mayor claridad estructural.

### 4.2 Pantallas de listados

Problemas actuales:

- Densidad visual alta en filas/acciones.
- Jerarquia entre encabezado, filtros y tabla puede mejorar.

Propuesta:

- Estructura fija por vista:
  1.  Encabezado (titulo + descripcion corta + boton principal)
  2.  Barra de herramientas (busqueda + filtros + acciones)
  3.  Tabla en card
- Tabla:
  - Encabezado sticky
  - Altura de fila 48px
  - Hover de fila sutil
  - Acciones compactas en iconos monocolor
- Estados UX:
  - Empty state con CTA
  - Loading con skeleton rows
  - Error inline recuperable
- Paginacion con total visible y selector de densidad (comodo/compacto).

Resultado esperado:

- Mejor escaneo visual y productividad en operacion diaria.

### 4.3 Barra de filtros

Problemas actuales:

- Poca visibilidad de filtros activos.
- Acciones de limpiar/aplicar sin una jerarquia clara.

Propuesta:

- Filter bar estandar:
  - Izquierda: busqueda global
  - Centro: filtros principales (selects)
  - Derecha: botones Aplicar, Limpiar, Mas filtros
- Mostrar chips de filtros activos debajo de la barra.
- Mostrar Limpiar todo solo cuando haya filtros aplicados.
- Atajos:
  - Enter aplica
  - Escape limpia busqueda
- Persistir filtros por vista para continuidad del usuario.

Resultado esperado:

- Menos pasos para filtrar y mayor contexto sobre el estado de la vista.

### 4.4 Pantalla de alta (ejemplo: Nueva Venta)

Problemas actuales:

- Base funcional buena, pero con oportunidad de ordenar mejor la jerarquia.

Propuesta:

- Modal estructurado por bloques:
  1.  Datos generales
  2.  Items
  3.  Resumen total
- Header de modal:
  - Titulo claro
  - Subtitulo breve
  - Cierre discreto
- Campos:
  - Label siempre visible
  - Ayuda contextual breve
  - Validacion inline al blur
- Items:
  - Tarjeta compacta por item
  - Subtotal visible por item
  - Boton Agregar item consistente
- Footer sticky:
  - Cancelar (terciario)
  - Guardar (primario)

Resultado esperado:

- Menos errores en captura y mayor confianza al guardar.

### 4.5 Pantalla de edicion (ejemplo: Editar Pedido)

Problemas actuales:

- Falta reforzar visualmente modo edicion y campos bloqueados.

Propuesta:

- Badge visible junto al codigo del documento/orden.
- Diferenciar editable vs solo lectura:
  - Editable: fondo blanco
  - Solo lectura: fondo #F8FAFC + icono lock
- Mostrar metadatos de edicion (ultima actualizacion, usuario) cuando aplique.
- Confirmar salida si hay cambios sin guardar.
- Boton principal contextual: Guardar cambios / Actualizar pedido.

Resultado esperado:

- Disminuye edicion accidental y mejora entendimiento del estado.

### 4.6 Popup de eliminacion

Problemas actuales:

- Confirmacion nativa del navegador, fuera del lenguaje visual de la app.

Propuesta:

- Reemplazar por dialog estandar (MatDialog) de confirmacion.
- Estructura:
  - Icono alerta (monocolor rojo)
  - Titulo: Eliminar [entidad]
  - Texto de impacto (accion irreversible)
- Botones:
  - Cancelar (secundario)
  - Eliminar (destructivo)
- Teclado:
  - Foco inicial en Cancelar
  - Enter no debe ejecutar accion destructiva por defecto

Resultado esperado:

- Consistencia visual y menor riesgo de eliminaciones por error.

### 4.7 Dashboard

Problemas actuales:

- Buen nivel visual, pero puede reforzar consistencia y lectura ejecutiva.

Propuesta:

- Encabezado:
  - Rango temporal segmentado
  - Busqueda y accesos rapidos
- KPI cards:
  - Altura uniforme
  - Menos saturacion de color
  - Icono monocolor + tendencia clara
- Graficos:
  - Paleta corporativa fija (3-5 colores)
  - Gridlines suaves
  - Tooltip limpio y consistente
- Bloques complementarios:
  - Top productos
  - Stock critico
  - Actividad reciente

Resultado esperado:

- Mayor claridad para toma de decisiones en pocos segundos.

## 5) Estandares UI por Componente

### 5.1 Botones

- Primario: fondo azul, texto blanco
- Secundario: fondo blanco, borde gris
- Destructivo: fondo rojo, texto blanco
- Altura: 36px o 40px segun contexto

### 5.2 Campos de texto

- Label arriba
- Placeholder de ejemplo
- Mensaje de error inline
- Estado focus con ring visible

### 5.3 Campos desplegables

- Misma altura que input
- Icono flecha consistente
- Opciones con hover suave y seleccion destacada

### 5.4 Busquedas

- Icono lupa a la izquierda
- Boton clear a la derecha
- Enter para buscar / Escape para limpiar

### 5.5 Badges de estado

- Activo: verde suave
- Pendiente: ambar suave
- Anulado/Error: rojo suave

### 5.6 Listados

- Encabezado sticky
- Acciones compactas por iconos
- Estado vacio estandar

## 6) Accesibilidad (A11y)

- Contraste minimo AA en textos y controles.
- Target de clic minimo 40x40.
- Focus visible en todos los componentes interactivos.
- Navegacion por teclado funcional en menu, filtros, tabla y modales.
- Mensajes de error claros y asociados al campo.

## 7) Plan de Implementacion Recomendado

### Fase A - Fundaciones UI

- Definir tokens globales (color, tipografia, spacing, radios, sombras).
- Estandarizar iconografia monocolor.
- Unificar botones, inputs, selects y estados.

### Fase B - Layout y Navegacion

- Actualizar sidebar y topbar.
- Homogeneizar responsive mobile/tablet.
- Estandarizar dialog de confirmacion.

### Fase C - Listados y Filtros

- Crear plantilla unica de listados.
- Integrar filter bar con chips de filtros activos.
- Uniformar acciones de fila y paginacion.

### Fase D - Formularios Alta/Edicion

- Implementar plantilla unica de formularios en modal.
- Estandarizar validaciones, ayudas y estados read-only.

### Fase E - Dashboard

- Ajustar tarjetas KPI, graficos y paneles secundarios.
- Revisar consistencia visual final en todo el sistema.

## 8) Criterios de Exito

- Consistencia visual en el 100% de vistas principales.
- Reduccion de tiempo promedio en tareas repetitivas (buscar, filtrar, crear).
- Reduccion de errores de accion (edicion/eliminacion involuntaria).
- Mayor satisfaccion percibida por usuarios internos.

## 9) Entregables Posteriores (si se aprueba esta propuesta)

1. UI Kit detallado (tokens + componentes + estados).
2. Mock textual antes/despues por pantalla.
3. Plan tecnico archivo por archivo para implementar sin romper flujos actuales.
