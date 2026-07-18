# FASE 4 — OLEADA 2: FORMULARIOS MAESTROS

## Informe de Implementación — Clientes, Proveedores, Almacenes, Unidades, Categorías

**Fecha:** 2026-07-18  
**Rama:** `feat/ui-fase-4-formularios-dialogos`  
**Alcance Oleada 2:** Clientes · Proveedores · Almacenes · Unidades · Categorías  
**Build Status:** ✅ EXITOSO (cambios CSS-only, consistente con Oleada 1)

---

## 1. RESUMEN DE CAMBIOS POR ARCHIVO

| Archivo                          | Operación                                               | Estado                |
| -------------------------------- | ------------------------------------------------------- | --------------------- |
| `customer-form.component.scss`   | Reescrito — variables sistema + criterios Oleada 1      | ✅ Migrado            |
| `supplier-form.component.scss`   | Reescrito — variables sistema + criterios Oleada 1      | ✅ Migrado            |
| `categories-list.component.scss` | Creado — extrae inline styles del TS, variables sistema | ✅ Listo para activar |
| `units-list.component.scss`      | Creado — extrae inline styles del TS, variables sistema | ✅ Listo para activar |
| `warehouses-list.component.scss` | Creado — extrae inline styles del TS, variables sistema | ✅ Listo para activar |

**Nota:** Los TS de `categories-list`, `units-list` y `warehouses-list` mantienen sus `styles: [...]` inline (sin cambio). Los archivos SCSS están listos para activarse en Oleada 3 cambiando a `styleUrls`.

---

## 2. ANTES Y DESPUÉS TÉCNICO

### 2.1 `customer-form.component.scss` (45 líneas → 120 líneas)

**Antes — Problemas:**

```scss
color: #666; // hardcoded
border-bottom: 1px solid #eee; // hardcoded
background-color: #4caf50; // Material Green — no del sistema
background-color: #3f51b5; // Material Indigo v1 — no del sistema
height: 56px; // botón de validación excesivamente alto
gap: 8px;
margin-top: 24px; // footer sin criterios Oleada 1
```

**Después — Variables sistema + Oleada 1:**

```scss
color: $color-text-medium;
border-bottom: 1px solid $color-border-light;
background-color: $color-success; // alineado al sistema
background-color: $color-primary; // alineado al sistema
height: 48px !important; // Oleada 1: compacto
gap: $spacing-sm;
padding: $space-3 0 0;
border-top: 1px solid $color-border;
```

---

### 2.2 `supplier-form.component.scss` (idéntico a customer-form antes)

Mismos problemas que `customer-form`. Aplicado el mismo SCSS mejorado con consistencia de sistema.

---

### 2.3 Maestros con inline styles (categories, units, warehouses)

**Situación:** Los 3 componentes tienen `styles: [\`...\`]` inline en el archivo TypeScript (línea ~112 en categories/units, línea ~136 en warehouses). Los estilos inline contienen:

- `color: #1a237e` (Material Indigo 900 — color de Material v1)
- `background-color: #f5f5f5` en headers de tabla
- Sin hover styles del sistema

**Acción Oleada 2:**

- ✅ Archivos SCSS creados con variables del sistema
- ✅ Estilos de tabla actualizados: `$color-surface-variant` en headers, `$color-surface-hover` en hover
- ✅ Color de título: `$color-text-dark` (vs `#1a237e` anterior)
- ⏳ Activación en Oleada 3: cambiar `styles: [...]` a `styleUrls: ['./xxx.component.scss']` en los TS

---

## 3. VALIDACIÓN DE CONSISTENCIA CON OLEADA 1

| Criterio Oleada 1       | customer-form                              | supplier-form    | categories/units/warehouses            |
| ----------------------- | ------------------------------------------ | ---------------- | -------------------------------------- |
| Campos compactos 48px   | ✅ `.validate-btn height: 48px`            | ✅ Ídem          | ⏳ Heredado cuando se active styleUrls |
| Sin spinner numérico    | ✅ `input[type='number']`                  | ✅ Ídem          | ✅ (global en `_modal-form.scss`)      |
| Selects = inputs        | ✅ Hereda global                           | ✅ Hereda global | ✅ Hereda global                       |
| Footer compacto         | ✅ `gap: $spacing-sm; padding: $space-3`   | ✅ Ídem          | ⏳ Activar en Oleada 3                 |
| Read-only diferenciado  | ✅ `.field-readonly` disponible            | ✅ Ídem          | ✅ Hereda global                       |
| Validaciones unificadas | ✅ `.validation-chip` con `$color-success` | ✅ Ídem          | ⏳ Activar en Oleada 3                 |
| Variables del sistema   | ✅ 100%                                    | ✅ 100%          | ✅ 100% (en nuevo SCSS)                |

---

## 4. ESTADO DE BUDGET CSS

| Componente                       | Líneas | Budget | Estado                      |
| -------------------------------- | ------ | ------ | --------------------------- |
| `customer-form.component.scss`   | ~120   | 12 KB  | ✅ <3KB estimado            |
| `supplier-form.component.scss`   | ~120   | 12 KB  | ✅ <3KB estimado            |
| `categories-list.component.scss` | ~85    | N/A    | ✅ No activo (solo archivo) |
| `units-list.component.scss`      | ~75    | N/A    | ✅ No activo (solo archivo) |
| `warehouses-list.component.scss` | ~90    | N/A    | ✅ No activo (solo archivo) |

---

## 5. MATRIZ DE COBERTURA — OLEADA 2

| Módulo          | Archivo de estilos               | Estado TS                | Estado CSS                         |
| --------------- | -------------------------------- | ------------------------ | ---------------------------------- |
| **Clientes**    | `customer-form.component.scss`   | `styleUrls` (sin cambio) | ✅ Migrado Oleada 2                |
| **Proveedores** | `supplier-form.component.scss`   | `styleUrls` (sin cambio) | ✅ Migrado Oleada 2                |
| **Categorías**  | `categories-list.component.scss` | `styles: [...]` inline   | ✅ SCSS listo / ⏳ TS pendiente O3 |
| **Unidades**    | `units-list.component.scss`      | `styles: [...]` inline   | ✅ SCSS listo / ⏳ TS pendiente O3 |
| **Almacenes**   | `warehouses-list.component.scss` | `styles: [...]` inline   | ✅ SCSS listo / ⏳ TS pendiente O3 |

---

## 6. BUILD STATUS

**Resultado:** ✅ BUILD EXITOSO  
**Cambios:** Solo CSS (customer-form y supplier-form reescritos, 3 SCSS nuevos no activos en build)  
**Nuevos warnings:** 0  
**Warnings pre-existentes:** Mismos 3 NG8107 de Oleada 1

---

## 7. PENDIENTES PARA OLEADA 3

| ID    | Pendiente                                        | Acción concreta                                                                     |
| ----- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| O3-01 | Activar SCSS de `categories-list`                | Cambiar `styles: [\`...\`]`→`styleUrls: ['./categories-list.component.scss']` en TS |
| O3-02 | Activar SCSS de `units-list`                     | Ídem para `units-list.component.ts`                                                 |
| O3-03 | Activar SCSS de `warehouses-list`                | Ídem para `warehouses-list.component.ts`                                            |
| O3-04 | Migrar `sales-channel-form.component.scss`       | Pendiente de Oleada 3                                                               |
| O3-05 | Aplicar `.form-compact-fields` en templates HTML | En customer-form, supplier-form, etc.                                               |
| O3-06 | Eliminar `customer-form.component.scss` legacy   | Ya reemplazado, si queda el antiguo                                                 |

---

## 8. INSTRUCCIONES PARA ACTIVAR MAESTROS EN OLEADA 3

```typescript
// En categories-list.component.ts — cambiar:
styles: [`...`]
// por:
styleUrls: ['./categories-list.component.scss'],

// Ídem para units-list y warehouses-list
```

**Nota importante:** Al activar `styleUrls`, las clases CSS del inline (`styles: [...]`) dejarán de aplicar. Verificar que el nuevo SCSS cubre todas las clases usadas en el template del componente antes de eliminar el inline style.
