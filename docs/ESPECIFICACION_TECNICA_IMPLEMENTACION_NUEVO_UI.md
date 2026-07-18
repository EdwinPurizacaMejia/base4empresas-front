# Especificacion Tecnica y Estrategia de Implementacion - Nuevo UI Base4Empresas

Fecha: 2026-07-17  
Version: 1.0  
Estado: Aprobacion tecnica previa a implementacion

## 1. Proposito

Definir la especificacion tecnica de los cambios UX/UI y la estrategia de implementacion incremental para modernizar menu, listados, filtros, formularios, popup de eliminacion y dashboard sin interrumpir operacion ni romper funcionalidades existentes.

## 2. Alcance

Incluye:

- Sistema visual base (tokens, tipografia, colores, espaciado, estados).
- Layout principal (topbar, sidebar, contenedor de contenido).
- Componentes compartidos de UI para listados, filtros, formularios y dialogos.
- Propagacion transversal del rediseño a todos los formularios de ALTA/EDICION.
- Estandarizacion visual y de comportamiento en dashboard.
- Pruebas funcionales, visuales y de accesibilidad.

Excluye:

- Cambios de negocio en backend.
- Nuevas reglas funcionales fuera de UX/UI.
- Reescritura completa de modulos no priorizados en esta fase.

## 3. Objetivos tecnicos

- Unificar la UI con una sola fuente de verdad de estilos.
- Reducir deuda visual por estilos duplicados o inconsistentes.
- Mantener compatibilidad con Angular Material (MDC).
- Mejorar mantenibilidad con componentes reutilizables.
- Evitar regresiones funcionales durante migracion.

## 4. Arquitectura objetivo de UI

### 4.1 Capa de estilos

Se adoptara arquitectura por capas:

- Capa 1 Tokens: colores, tipografias, espaciado, radios, sombras, z-index, transiciones.
- Capa 2 Fundaciones: reset, tipografia base, utilidades de layout y estados.
- Capa 3 Componentes base: boton, input, select, chip, badge, card, dialog, tabla.
- Capa 4 Patrones de pantalla: page-header, filter-bar, form-dialog, dashboard-sections.
- Capa 5 Overrides controlados de Angular Material.

### 4.2 Criterios de implementacion CSS

- Prioridad a SCSS modular en carpeta styles.
- Evitar estilos inline extensos en componentes.
- Reducir uso de selectores profundos excepto para MDC cuando sea estrictamente necesario.
- Consolidar estilos globales para eliminar duplicidad entre archivos globales.

### 4.3 Capa de componentes

Se definiran componentes reutilizables para estandarizar UI:

- UiPageHeaderComponent
- UiFilterBarComponent
- UiDataTableComponent
- UiFormDialogComponent
- UiConfirmDialogComponent
- UiKpiCardComponent

Estos componentes encapsularan estructura, estados y comportamiento visual comun.

## 5. Especificacion de cambios por area

### 5.1 Menu y layout

Objetivo:

- Reemplazar lenguaje visual actual por version solida y monocolor.

Cambios:

- Sidebar solido oscuro con jerarquia de niveles.
- Iconos unificados Material Symbols Rounded.
- Estado activo consistente (fondo + barra lateral primaria).
- Modo mobile tipo drawer overlay con cierre en navegacion.
- Busqueda rapida de modulos dentro del menu.

Impacto tecnico esperado:

- Ajustes en layout principal, sidebar, modelo de menu e iconos.
- Eliminacion progresiva de emojis como fuente de iconos.

### 5.2 Listados y tabla

Objetivo:

- Estandarizar lectura y acciones de datos.

Cambios:

- Plantilla unica de listado.
- Header de tabla sticky.
- Densidad controlada de filas.
- Acciones por icono monocolor con tooltip.
- Estados vacio, loading y error unificados.

Impacto tecnico esperado:

- Evolucion del componente de tabla generica y su contrato de configuracion.

### 5.3 Filtros

Objetivo:

- Mejorar velocidad de filtrado y visibilidad de contexto.

Cambios:

- Barra de filtros estandar con bloques definidos.
- Chips de filtros activos.
- Boton limpiar todo condicional.
- Atajos de teclado Enter y Escape.
- Persistencia local por vista.

Impacto tecnico esperado:

- Nuevo componente de filter bar reutilizable y contrato de filtros tipado.

### 5.4 Formularios alta y edicion

Objetivo:

- Reducir errores de captura y elevar claridad de estados.

Cambios:

- Estructura uniforme de modal con header, body por secciones y footer sticky.
- Diferenciacion visual de campos editables y read-only.
- Validaciones inline consistentes.
- Mensajeria de ayuda y error estandar.
- Estandar de densidad visual transversal:
  - inputs/selects compactos
  - textarea con altura moderada
  - campos numericos sin spinner visual

Impacto tecnico esperado:

- Refactor de todos los formularios de ALTA/EDICION para consumir plantilla base.

### 5.5 Popup de eliminacion

Objetivo:

- Eliminar confirmaciones nativas y estandarizar UX de accion destructiva.

Cambios:

- Dialog centralizado de confirmacion destructiva con foco seguro.
- Texto de impacto y CTA destructivo explicito.

Impacto tecnico esperado:

- Reemplazo de llamadas nativas por servicio/dialogo unico.

### 5.6 Dashboard

Objetivo:

- Mejorar lectura ejecutiva y consistencia visual.

Cambios:

- Tarjetas KPI con altura y jerarquia homogenea.
- Paleta fija para graficos.
- Tooltips y leyendas uniformes.
- Secciones de prioridad operativa (top productos, stock critico, actividad).

Impacto tecnico esperado:

- Ajustes de estilos y estructura de widgets actuales sin alterar fuentes de datos.

## 6. Matriz tecnica de archivos y accion

Archivos actuales prioritarios y tratamiento:

- src/styles.scss: Consolidar como entrada global principal.
- src/styles.css: Evaluar desactivacion o absorcion de reglas para evitar duplicidad.
- src/app/layout/layout.component.css: Refactor de shell visual.
- src/app/layout/sidebar.component.ts: Migrar iconografia y estados de menu.
- src/app/layout/toolbar.component.ts: Unificar topbar con nuevo patron.
- src/app/models/menu.model.ts: Reemplazar emojis por catalogo de iconos.
- src/app/components/generic-data-table/generic-data-table.component.css: Evolucion a tabla estandar.
- src/app/components/purchase-form/purchase-form.component.css: Reducir complejidad, dividir estilos y cumplir presupuesto.
- src/app/components/product-form/product-form.component.scss: Alinear con plantilla de dialogo estandar.

Nuevos archivos propuestos:

- src/styles/tokens/\_colors.scss
- src/styles/tokens/\_typography.scss
- src/styles/tokens/\_spacing.scss
- src/styles/tokens/\_elevation.scss
- src/styles/foundations/\_forms.scss
- src/styles/foundations/\_tables.scss
- src/styles/foundations/\_dialogs.scss
- src/app/components/shared/ui-filter-bar/
- src/app/components/shared/ui-confirm-dialog/
- src/app/components/shared/ui-page-header/

## 7. Estrategia de implementacion

### 7.1 Enfoque incremental por fases

Fase 0 - Preparacion tecnica

- Auditoria de estilos globales.
- Definicion de tokens y convenciones.
- Baseline de capturas visuales por pantalla clave.

Fase 1 - Fundaciones UI

- Incorporar tokens y estilos base.
- Estandarizar botones, inputs, selects y estados.
- Mantener compatibilidad total con vistas actuales.

Fase 2 - Shell de navegacion

- Implementar nuevo sidebar/topbar.
- Migrar iconografia de menu.
- Validar responsive desktop, tablet y mobile.

Fase 3 - Listados y filtros

- Introducir filter bar y tabla estandar en modulos de mayor uso.
- Activar chips de filtros y estados de tabla.

Fase 4 - Formularios y confirmaciones

- Aplicar plantilla de modal de alta/edicion.
- Reemplazar confirmaciones de eliminacion por dialogo centralizado.

Fase 5 - Dashboard y cierre visual

- Ajustar KPI cards, graficos y layout final.
- Correcciones de consistencia cruzada.

### 7.2 Orden de migracion por impacto

Prioridad alta:

- Menu/layout
- Listados y filtros
- Popup eliminacion

Prioridad media:

- Formularios de alta/edicion
- Dashboard

### 7.3 Estrategia de despliegue

- Implementacion por lotes pequenos y verificables.
- Merge por fase con validacion funcional y visual.
- Uso de feature toggle de UI cuando aplique en vistas criticas.
- Plan de rollback por fase (reversion de estilos/componentes afectados).

## 8. Calidad y validacion

### 8.1 Calidad funcional

- Pruebas de navegacion, CRUD y flujos de filtrado.
- Validacion de formularios (errores, confirmaciones, guardado).
- Verificacion de acciones destructivas.

### 8.2 Calidad visual

- Comparacion antes/despues por pantalla objetivo.
- Reglas de consistencia tipografica, espaciado y color.
- Validacion responsive en anchos clave: 1440, 1024, 768, 390.

### 8.3 Accesibilidad

- Contraste minimo AA.
- Focus visible y orden de tabulacion correcto.
- Etiquetas y errores asociados semantica y visualmente.

### 8.4 Performance UI

- Control de peso de CSS por componente.
- Seguimiento de budget de estilos para evitar sobrepasos.
- Reduccion de reglas duplicadas y especificidad excesiva.

## 9. Riesgos y mitigacion

Riesgo 1: Regresiones visuales por mezcla de estilos antiguos y nuevos.

- Mitigacion: migracion por capas, tokens comunes y limpieza progresiva.

Riesgo 2: Incremento de CSS y warnings de presupuesto.

- Mitigacion: modularizar estilos, eliminar duplicados, medir por fase.

Riesgo 3: Inconsistencias por coexistencia de layouts alternos.

- Mitigacion: definir layout canonico y plan de deprecacion de variantes.

Riesgo 4: Impacto en productividad durante transicion.

- Mitigacion: mantener patrones funcionales y cambiar primero capas visuales.

## 10. Criterios de aceptacion

- Menu, listados, filtros, formularios, popup eliminacion y dashboard migrados al nuevo sistema visual.
- Componentes compartidos reutilizables documentados y adoptados.
- Sin regresiones funcionales criticas en flujos CRUD principales.
- Cumplimiento de accesibilidad AA en vistas priorizadas.
- Sin warnings de presupuesto de estilos en componentes intervenidos.
- Cobertura 100% de formularios ALTA/EDICION con estandar visual unificado.

## 11. Entregables tecnicos

- Documento de tokens y reglas de UI.
- Libreria base de componentes compartidos.
- Guia de migracion por pantalla y por componente.
- Evidencia de pruebas funcionales, visuales y accesibilidad.
- Informe de cierre de fase con estado y pendientes.

## 12. Gobierno de implementacion

Roles recomendados:

- Lider tecnico UI: define arquitectura y revisa consistencia.
- Frontend implementador: ejecuta cambios por fase.
- QA funcional y visual: valida regresiones y criterios de aceptacion.
- Product owner: aprueba look and feel y prioridades por iteracion.

Cadencia sugerida:

- Revision tecnica semanal por fase.
- Demo visual al cierre de cada fase.
- Retro de ajustes antes de pasar a siguiente bloque.

## 13. Proximo paso sugerido

Una vez aprobada esta especificacion:

1. Generar checklist tecnico por fase con tareas de archivo a archivo.
2. Definir layout canonico y desactivar variantes no objetivo.
3. Iniciar Fase 0 y Fase 1 en rama de trabajo dedicada al nuevo UI.
