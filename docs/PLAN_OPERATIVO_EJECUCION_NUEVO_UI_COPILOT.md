# Plan Operativo de Ejecucion Gradual - Nuevo UI Base4Empresas

Fecha: 2026-07-17  
Version: 1.0  
Base tecnica: ESPECIFICACION_TECNICA_IMPLEMENTACION_NUEVO_UI.md

## 1. Objetivo del plan operativo

Convertir la especificacion tecnica en una secuencia ejecutable por fases, con instrucciones listas para copiar y pegar en Copilot, garantizando implementacion incremental, validacion continua y minimo riesgo de regresiones.

## 2. Si, este plan se puede pegar en Copilot

Respuesta corta: si.

Recomendacion de uso:

- Ejecutar una sola fase por vez.
- Esperar resultado y revision antes de pasar a la siguiente fase.
- Pedir siempre al final de cada fase:
  - Resumen de cambios por archivo
  - Resultado de build y pruebas
  - Riesgos detectados
  - Pendientes tecnicos

## 3. Modo de trabajo recomendado

Flujo por iteracion:

1. Crear rama de trabajo de la fase.
2. Ejecutar bloque de prompt de la fase en Copilot.
3. Revisar cambios visuales y funcionales.
4. Ejecutar build y pruebas.
5. Ajustar observaciones.
6. Cerrar fase con checklist de aceptacion.

Convencion de ramas sugerida:

- feat/ui-fase-0-preparacion
- feat/ui-fase-1-fundaciones
- feat/ui-fase-2-layout-menu
- feat/ui-fase-3-listados-filtros
- feat/ui-fase-4-formularios-dialogos
- feat/ui-fase-5-dashboard-cierre

## 4. Plan por fases y prompts copy paste

## Fase 0 - Preparacion tecnica y baseline

Objetivo:

- Dejar listo el entorno para migracion UI controlada.

Salida esperada:

- Inventario de estilos actuales
- Baseline visual de pantallas clave
- Lista de duplicidades y riesgos

Prompt para Copilot:

Actua como arquitecto frontend Angular. Necesito ejecutar Fase 0 del rediseño UI en este workspace.

Tareas:

1. Audita estilos globales y locales para detectar duplicidad, conflictos y sobreescrituras riesgosas.
2. Identifica archivos prioritarios para migracion UI (layout, sidebar, toolbar, tablas, formularios, dialogs, dashboard).
3. Genera un informe tecnico en docs con:
   - Hallazgos por severidad
   - Lista de archivos afectados
   - Riesgos de regresion
   - Orden recomendado de intervencion
4. No cambies logica de negocio.
5. Si haces cambios menores de preparacion, que sean no disruptivos.
6. Al final, dame:
   - Resumen por archivo
   - Build status
   - Siguiente paso recomendado para Fase 1.

## Fase 1 - Fundaciones UI (tokens y base visual)

Objetivo:

- Crear sistema visual base unificado.

Salida esperada:

- Tokens de color, tipografia, spacing, radios, sombras
- Fundaciones para controles base

Prompt para Copilot:

Implementa Fase 1 del nuevo UI en Angular.

Requerimientos:

1. Crear estructura de estilos por capas:
   - tokens
   - foundations
   - componentes base
2. Definir tokens UI oficiales (color, tipografia, spacing, radios, sombras, estados).
3. Unificar estilo base de:
   - botones
   - inputs
   - selects
   - badges
   - cards
4. Mantener compatibilidad con Angular Material MDC.
5. No romper vistas existentes.
6. Reducir duplicidad entre estilos globales.
7. Documentar cambios en un archivo markdown en docs.
8. Ejecutar build y reportar warnings.

Entregame:

- Lista de archivos creados y modificados
- Decisiones de arquitectura de estilos
- Riesgos o deudas pendientes

## Fase 2 - Layout, menu y navegacion

Objetivo:

- Migrar shell principal a la nueva experiencia visual.

Salida esperada:

- Sidebar solido, iconografia unificada, mejor responsive

Prompt para Copilot:

Implementa Fase 2 del rediseño UI enfocada en layout y menu.

Requerimientos:

1. Migrar menu lateral a estilo solido y jerarquia clara.
2. Reemplazar iconos heterogeneos por iconos consistentes de una sola libreria.
3. Estandarizar estados de menu: normal, hover, activo, disabled.
4. Mejorar comportamiento mobile del drawer.
5. Mantener rutas y permisos actuales.
6. No alterar logica de negocio.
7. Actualizar documentacion tecnica con cambios realizados.
8. Ejecutar build y validar sin errores.

Entregame:

- Diff funcional por archivo
- Impacto visual esperado
- Checklist de validacion manual de navegacion

## Fase 3 - Listados y filtros

Objetivo:

- Estandarizar productividad en pantallas de gestion.

Salida esperada:

- Plantilla unificada de encabezado, filtros y tabla

Prompt para Copilot:

Implementa Fase 3 del nuevo UI para listados y filtros.

Requerimientos:

1. Definir patron reutilizable de page header para modulos de lista.
2. Implementar barra de filtros estandar con:
   - busqueda
   - filtros principales
   - aplicar y limpiar
   - chips de filtros activos
3. Evolucionar tabla generica para:
   - mejor legibilidad
   - acciones compactas por icono
   - estados loading, vacio y error consistentes
4. Aplicar primero en modulos de mayor uso.
5. No cambiar contratos API.
6. Ejecutar pruebas y build.

Entregame:

- Modulos migrados en esta fase
- Archivos tocados
- Riesgos de regresion pendientes
- Recomendacion para Fase 4

## Fase 4 - Formularios alta/edicion y dialogos

Objetivo:

- Unificar experiencia de captura y confirmaciones.

Salida esperada:

- Plantilla modal estandar y confirmacion destructiva centralizada

Prompt para Copilot:

Implementa Fase 4 del nuevo UI para formularios y dialogos.

Requerimientos:

1. Crear patron de formulario modal estandar:
   - header con titulo claro
   - body por secciones
   - footer sticky con acciones
2. Unificar validaciones visuales y mensajes de error.
3. Diferenciar campos editables vs read-only visualmente.
4. Reemplazar confirmaciones nativas por dialogo de confirmacion reutilizable.
5. Aplicar primero en formularios de ventas, pedidos, compras y productos.
6. Propagar obligatoriamente el mismo patron visual a todos los formularios de ALTA/EDICION del sistema (catalogos, inventario, logistica, ventas, compras, configuracion).
7. Mantener consistencia de densidad visual:
   - altura de inputs/selects estandar
   - textarea con altura moderada
   - sin spinners en campos numericos de monto/cantidad/precio
8. Optimizar CSS para no exceder presupuestos.
9. Ejecutar build y reportar warnings o mejoras.

Entregame:

- Antes y despues tecnico por componente
- Estado de budget CSS
- Matriz de cobertura de formularios ALTA/EDICION (migrado/pendiente)
- Lista de pendientes para Fase 5

## Fase 5 - Dashboard y cierre de consistencia

Objetivo:

- Cerrar el rediseño con consistencia global.

Salida esperada:

- Dashboard alineado al nuevo sistema visual

Prompt para Copilot:

Implementa Fase 5 del nuevo UI enfocada en dashboard y cierre visual.

Requerimientos:

1. Estandarizar KPI cards, tipografia y jerarquia de informacion.
2. Homogeneizar paleta y estilo de graficos.
3. Revisar layout de secciones complementarias: top productos, stock critico, actividad.
4. Aplicar retoques de consistencia cruzada en toda la app.
5. Ejecutar build final y pruebas de regresion visual/funcional.
6. Generar informe final de cierre en docs.

Entregame:

- Resumen final de implementacion
- Criterios de aceptacion cumplidos
- Lista de mejoras futuras no bloqueantes

## 5. Checklists de cierre por fase

Checklist tecnico minimo:

- Build exitoso
- Sin errores funcionales criticos
- Sin regresiones visuales severas
- Cambios documentados
- QA manual basico ejecutado
- Cobertura de formularios ALTA/EDICION objetivo: 100%

Checklist UX minimo:

- Contraste y legibilidad correctos
- Focus visible en componentes interactivos
- Estados visuales consistentes
- Responsive validado en desktop y mobile

## 6. Comando de control recomendado al final de cada fase

Solicitar siempre a Copilot este bloque de salida:

1. Resumen de archivos creados y modificados.
2. Que decisiones tecnicas tomo y por que.
3. Resultado de build, pruebas y warnings.
4. Riesgos pendientes y mitigacion.
5. Prompt sugerido para la siguiente fase.

## 7. Estrategia de implementacion gradual segura

Reglas:

- No mezclar dos fases en un mismo lote grande.
- Mantener PR pequeno y revisable por fase.
- Bloquear paso a fase siguiente si build o UX critico falla.
- Priorizar consistencia de sistema antes de microdetalle visual.

## 8. Plantilla de solicitud corta para ejecucion diaria

Puedes usar esta plantilla cada dia con Copilot:

Hoy ejecutaremos la fase [X] del plan operativo de UI en este workspace.

Contexto:

- Documento base: docs/ESPECIFICACION_TECNICA_IMPLEMENTACION_NUEVO_UI.md
- Plan operativo: docs/PLAN_OPERATIVO_EJECUCION_NUEVO_UI_COPILOT.md

Instrucciones:

1. Ejecuta solo esta fase.
2. Haz cambios minimos y seguros.
3. No toques logica de negocio.
4. Corre build y reporta estado.
5. Entrega resumen por archivo y riesgos.

## 9. Resultado esperado de este enfoque

- Implementacion ordenada y progresiva.
- Menor riesgo de roturas globales.
- Mejor trazabilidad de cambios.
- Posibilidad real de copy paste fase por fase en Copilot hasta completar el nuevo UI.
- Experiencia consistente en todos los formularios de ALTA/EDICION (sin excepciones visuales).

## 9.1 Criterios visuales obligatorios para todos los formularios ALTA/EDICION

Aplicar estos criterios como estandar transversal:

- Campos mas compactos y limpios (evitar altura excesiva).
- Inputs numericos de cantidad/precio/monto sin controles spinner.
- Selects con altura equivalente a inputs.
- Textareas con altura moderada (no dominante).
- Espaciado consistente entre filas y columnas.
- Footer de acciones compacto y uniforme.

Nota:

- Si un formulario no cumple estos criterios, la fase se considera incompleta.

## 9.2 Estrategia de propagacion por oleadas (formularios)

Oleada 1 (criticos de negocio):

- Productos
- Pedidos
- Ventas
- Compras

Oleada 2 (operacion extendida):

- Clientes
- Proveedores
- Almacenes
- Unidades
- Categorias

Oleada 3 (resto de modulos):

- Inventario
- Logistica
- Configuracion y formularios administrativos

Salida obligatoria al final de cada oleada:

- Lista de formularios migrados
- Lista de formularios pendientes
- Evidencia de build y validacion visual

## 10. Flujo Git sugerido (paso a paso)

Objetivo:

- Ejecutar el rediseño UI con control de riesgo y capacidad de rollback por fase.

### 10.1 Estrategia de ramas

Modelo recomendado:

1. Rama base estable: main (o develop, segun flujo del equipo).
2. Rama epica de UI: feat/ui-redesign.
3. Rama por fase desde la epica:
   - feat/ui-fase-0-preparacion
   - feat/ui-fase-1-fundaciones
   - feat/ui-fase-2-layout-menu
   - feat/ui-fase-3-listados-filtros
   - feat/ui-fase-4-formularios-dialogos
   - feat/ui-fase-5-dashboard-cierre

Regla:

- No iniciar una fase nueva sin cerrar la fase anterior (build + QA + PR).

### 10.2 Comandos sugeridos

Crear rama epica:

```bash
git checkout main
git pull origin main
git checkout -b feat/ui-redesign
git push -u origin feat/ui-redesign
```

Crear rama de fase (ejemplo Fase 1):

```bash
git checkout feat/ui-redesign
git pull origin feat/ui-redesign
git checkout -b feat/ui-fase-1-fundaciones
git push -u origin feat/ui-fase-1-fundaciones
```

Ciclo diario de trabajo en la fase:

```bash
git add .
git commit -m "feat(ui): fase 1 - tokens y fundaciones base"
git push
```

Sincronizar cambios recientes de la epica a la fase:

```bash
git checkout feat/ui-redesign
git pull origin feat/ui-redesign
git checkout feat/ui-fase-1-fundaciones
git merge feat/ui-redesign
```

Cerrar fase y fusionar a epica:

```bash
git checkout feat/ui-redesign
git pull origin feat/ui-redesign
git merge --no-ff feat/ui-fase-1-fundaciones
git push origin feat/ui-redesign
```

Al finalizar todas las fases, fusionar epica a main:

```bash
git checkout main
git pull origin main
git merge --no-ff feat/ui-redesign
git push origin main
```

### 10.3 Convencion de commits sugerida

Formato:

- feat(ui): fase X - descripcion corta
- refactor(ui): unificacion de estilos de [modulo]
- fix(ui): correccion visual en [componente]
- docs(ui): actualizacion plan/guia de implementacion

Ejemplos:

- feat(ui): fase 2 - nuevo sidebar y topbar responsive
- refactor(ui): tabla generica con estados unificados
- fix(ui): dialogo confirmacion con foco seguro

### 10.4 Politica de PR por fase

Cada PR de fase debe incluir:

1. Alcance exacto de fase.
2. Lista de archivos modificados.
3. Evidencia de build y pruebas.
4. Capturas antes/despues de pantallas impactadas.
5. Riesgos y pendientes para siguiente fase.

Regla de tamano:

- PR pequeno o mediano, nunca mega PR multi-fase.

### 10.5 Rollback seguro

Si una fase falla en QA o produce regresion:

1. No mergear a la epica.
2. Corregir en la misma rama de fase.
3. Si el merge ya ocurrio, revertir commit de merge en epica.

Comando de revert de merge (ejemplo):

```bash
git checkout feat/ui-redesign
git log --oneline
git revert -m 1 <merge_commit_sha>
git push origin feat/ui-redesign
```

### 10.6 Checklist Git antes de pasar de fase

- Rama de fase actualizada con epica.
- Commits claros y trazables.
- PR aprobado.
- Build y QA de fase en verde.
- Documentacion de fase actualizada en docs.
