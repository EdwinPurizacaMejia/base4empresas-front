# 🔍 AUDITORÍA: Formato de moneda en Frontend - Hallazgos completos

## FECHA: 7/6/2026, 00:19

## CONTEXTO

- ✅ AppCurrencyPipe ya existe y funciona
- ✅ Locale es-PE registrado
- ✅ Módulo de órdenes corregido (orders-list, order-detail, order-create, order-payments)

---

## 📊 RESUMEN EJECUTIVO

### Hallazgos:

- **18 usos** de `| currency` encontrados
- **6 componentes** afectados
- **0 componentes** usan AppCurrencyPipe (de los 6 afectados)
- **Prioridad:** ALTA - Afecta productos, compras y ventas

---

## 🔍 HALLAZGOS DETALLADOS

### 1. payments-list.component.ts ⚠️ CRÍTICO

| Línea | Campo              | Formato Actual                              | Formato Recomendado                | Prioridad |
| ----- | ------------------ | ------------------------------------------- | ---------------------------------- | --------- |
| 120   | Total Pendiente    | `\| currency:'PEN':'symbol-narrow':'1.2-2'` | `\| appCurrency: 'PEN'` o dinámico | ALTA      |
| 178   | order.total_amount | `\| currency:'PEN':'symbol-narrow':'1.2-2'` | `\| appCurrency: order.currency`   | ALTA      |
| 186   | order.paid_amount  | `\| currency:'PEN':'symbol-narrow':'1.2-2'` | `\| appCurrency: order.currency`   | ALTA      |
| 194   | Monto Pendiente    | `\| currency:'PEN':'symbol-narrow':'1.2-2'` | `\| appCurrency: order.currency`   | ALTA      |

**Problema:** Template inline en TS, hardcoded a 'PEN'  
**Impacto:** Órdenes USD se muestran incorrectamente  
**Requiere:** Import AppCurrencyPipe + reemplazar 4 usos

---

### 2. product-detail.component.html ⚠️ CRÍTICO

| Línea | Campo                  | Formato Actual                             | Formato Recomendado     | Prioridad |
| ----- | ---------------------- | ------------------------------------------ | ----------------------- | --------- |
| 86    | product.purchase_price | `\| currency : 'USD' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 92    | product.sale_price     | `\| currency : 'USD' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |

**Problema:** Hardcoded a 'USD' (incorrecto, productos son PEN)  
**Impacto:** Precios de productos muestran $ en lugar de S/  
**Requiere:** Import AppCurrencyPipe + reemplazar 2 usos  
**Nota:** Productos NO tienen currency, siempre usar 'PEN'

---

### 3. products-list.component.html ⚠️ CRÍTICO

| Línea | Campo                  | Formato Actual                       | Formato Recomendado     | Prioridad |
| ----- | ---------------------- | ------------------------------------ | ----------------------- | --------- |
| 69    | element.sale_price     | `\| currency:'PEN':'symbol':'1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 77    | element.purchase_price | `\| currency:'PEN':'symbol':'1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |

**Problema:** Usa currency pipe de Angular directo  
**Impacto:** No usa el pipe estandarizado  
**Requiere:** Import AppCurrencyPipe + reemplazar 2 usos  
**Nota:** Productos NO tienen currency, siempre usar 'PEN'

---

### 4. purchase-detail.component.html ⚠️ CRÍTICO

| Línea | Campo          | Formato Actual                             | Formato Recomendado     | Prioridad |
| ----- | -------------- | ------------------------------------------ | ----------------------- | --------- |
| 101   | purchase.total | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 140   | item.unit_cost | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 147   | item.subtotal  | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |

**Problema:** Usa currency pipe de Angular directo  
**Impacto:** No usa el pipe estandarizado  
**Requiere:** Import AppCurrencyPipe + reemplazar 3 usos  
**Nota:** Compras NO tienen currency explícita, usar 'PEN'

---

### 5. purchase-list.component.html ⚠️ MEDIA

| Línea | Campo         | Formato Actual                       | Formato Recomendado     | Prioridad |
| ----- | ------------- | ------------------------------------ | ----------------------- | --------- |
| 80    | element.total | `\| currency:'PEN':'symbol':'1.2-2'` | `\| appCurrency: 'PEN'` | MEDIA     |

**Problema:** Usa currency pipe de Angular directo  
**Impacto:** No usa el pipe estandarizado  
**Requiere:** Import AppCurrencyPipe + reemplazar 1 uso  
**Nota:** Compras NO tienen currency explícita, usar 'PEN'

---

### 6. sale-detail.component.html ⚠️ CRÍTICO

| Línea | Campo                | Formato Actual                             | Formato Recomendado     | Prioridad |
| ----- | -------------------- | ------------------------------------------ | ----------------------- | --------- |
| 91    | sale.total           | `\| currency : 'USD' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 98    | sale.cost_total      | `\| currency : 'USD' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 105   | sale.gross_profit    | `\| currency : 'USD' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 169   | item unit_price/cost | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 179   | item.total_cost      | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |
| 188   | item subtotal        | `\| currency : 'PEN' : 'symbol' : '1.2-2'` | `\| appCurrency: 'PEN'` | ALTA      |

**Problema:** Mezcla 'USD' y 'PEN' inconsistentemente  
**Impacto:** Ventas muestran $ en lugar de S/  
**Requiere:** Import AppCurrencyPipe + reemplazar 6 usos  
**Nota:** Ventas NO tienen currency explícita, usar 'PEN'

---

## 📋 TABLA CONSOLIDADA DE HALLAZGOS

| #   | Componente                     | Línea | Campo              | Actual           | Recomendado                    | Prioridad |
| --- | ------------------------------ | ----- | ------------------ | ---------------- | ------------------------------ | --------- |
| 1   | payments-list.component.ts     | 120   | Total Pendiente    | `currency:'PEN'` | `appCurrency:'PEN'` o dinámico | ALTA      |
| 2   | payments-list.component.ts     | 178   | order.total_amount | `currency:'PEN'` | `appCurrency:order.currency`   | ALTA      |
| 3   | payments-list.component.ts     | 186   | order.paid_amount  | `currency:'PEN'` | `appCurrency:order.currency`   | ALTA      |
| 4   | payments-list.component.ts     | 194   | Pending Amount     | `currency:'PEN'` | `appCurrency:order.currency`   | ALTA      |
| 5   | product-detail.component.html  | 86    | purchase_price     | `currency:'USD'` | `appCurrency:'PEN'`            | ALTA      |
| 6   | product-detail.component.html  | 92    | sale_price         | `currency:'USD'` | `appCurrency:'PEN'`            | ALTA      |
| 7   | products-list.component.html   | 69    | sale_price         | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 8   | products-list.component.html   | 77    | purchase_price     | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 9   | purchase-detail.component.html | 101   | total              | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 10  | purchase-detail.component.html | 140   | unit_cost          | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 11  | purchase-detail.component.html | 147   | subtotal           | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 12  | purchase-list.component.html   | 80    | total              | `currency:'PEN'` | `appCurrency:'PEN'`            | MEDIA     |
| 13  | sale-detail.component.html     | 91    | total              | `currency:'USD'` | `appCurrency:'PEN'`            | ALTA      |
| 14  | sale-detail.component.html     | 98    | cost_total         | `currency:'USD'` | `appCurrency:'PEN'`            | ALTA      |
| 15  | sale-detail.component.html     | 105   | gross_profit       | `currency:'USD'` | `appCurrency:'PEN'`            | ALTA      |
| 16  | sale-detail.component.html     | 169   | unit_price         | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 17  | sale-detail.component.html     | 179   | total_cost         | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |
| 18  | sale-detail.component.html     | 188   | subtotal           | `currency:'PEN'` | `appCurrency:'PEN'`            | ALTA      |

**Total hallazgos:** 18  
**Prioridad ALTA:** 17  
**Prioridad MEDIA:** 1

---

## ❌ COMPONENTES SIN AppCurrencyPipe

Los siguientes componentes usan `| currency` pero **NO tienen AppCurrencyPipe importado**:

1. ❌ **payments-list.component.ts** (template inline)
2. ❌ **product-detail.component** (.ts + .html)
3. ❌ **products-list.component** (.ts + .html)
4. ❌ **purchase-detail.component** (.ts + .html)
5. ❌ **purchase-list.component** (.ts + .html)
6. ❌ **sale-detail.component** (.ts + .html)

**Todos requieren:**

1. Import `AppCurrencyPipe` en el .ts
2. Añadir a `imports:[]` del componente standalone
3. Reemplazar usos de `| currency` por `| appCurrency`

---

## ✅ COMPONENTES YA CORREGIDOS

1. ✅ **orders-list.component** - usa appCurrency
2. ✅ **order-detail.component** - usa appCurrency
3. ✅ **order-create.component** - usa appCurrency
4. ✅ **order-payments.component** - usa appCurrency

---

## 🔍 MÓDULOS NO REVISADOS (Posibles hallazgos adicionales)

### Dashboard/Reportes:

- [ ] `dashboard.component.html`
- [ ] `dashboard-new.component.html`

### Inventario:

- [ ] `stock-list.component.html`
- [ ] `stock-detail.component` (si existe)

### Kardex:

- [ ] `kardex.component.html` (si muestra valores)

### Ajustes/Transferencias:

- [ ] `adjustments-list.component` (si muestra valores)
- [ ] `transfers-list.component` (si muestra valores)

**Nota:** Estos componentes pueden NO mostrar montos, pero deben ser verificados.

---

## 📊 ANÁLISIS POR MÓDULO

### Módulo de Productos: ⚠️ CRÍTICO

- **Archivos afectados:** 2
- **Usos encontrados:** 4
- **Currency incorrecta:** Sí (usa 'USD' en lugar de 'PEN')
- **Impacto:** Alto - Usuarios ven precios incorrectos

### Módulo de Compras: ⚠️ CRÍTICO

- **Archivos afectados:** 2
- **Usos encontrados:** 4
- **Currency incorrecta:** No (usa 'PEN' correctamente)
- **Impacto:** Medio - Solo estandarización

### Módulo de Ventas: ⚠️ CRÍTICO

- **Archivos afectados:** 1
- **Usos encontrados:** 6
- **Currency incorrecta:** Sí (mezcla 'USD' y 'PEN')
- **Impacto:** Alto - Inconsistencia visual

### Módulo de Pagos: ⚠️ CRÍTICO

- **Archivos afectados:** 1
- **Usos encontrados:** 4
- **Currency incorrecta:** Parcial (hardcoded a 'PEN')
- **Impacto:** Alto - No respeta currency de orden

---

## 🎯 PLAN DE CORRECCIÓN POR FASES

### FASE 1: CRÍTICOS - Productos (2 archivos, 4 usos)

**Prioridad:** 🔴 MÁXIMA  
**Razón:** Muestra $ en lugar de S/, confunde a usuarios  
**Archivos:**

- `product-detail.component` (.ts + .html) - 2 usos
- `products-list.component` (.ts + .html) - 2 usos

**Acciones:**

1. Import AppCurrencyPipe
2. Reemplazar `currency:'USD'` → `appCurrency:'PEN'`
3. Reemplazar `currency:'PEN'` → `appCurrency:'PEN'`

**Estimación:** 15 minutos

---

### FASE 2: CRÍTICOS - Ventas (1 archivo, 6 usos)

**Prioridad:** 🔴 ALTA  
**Razón:** Inconsistencia USD/PEN en mismo componente  
**Archivos:**

- `sale-detail.component` (.ts + .html) - 6 usos

**Acciones:**

1. Import AppCurrencyPipe
2. Unificar todos los montos a `appCurrency:'PEN'`

**Estimación:** 15 minutos

---

### FASE 3: CRÍTICOS - Pagos (1 archivo, 4 usos)

**Prioridad:** 🔴 ALTA  
**Razón:** No respeta currency de orden padre  
**Archivos:**

- `payments-list.component.ts` (template inline) - 4 usos

**Acciones:**

1. Import AppCurrencyPipe
2. Revisar si tiene acceso a `order.currency`
3. Si SÍ: usar `appCurrency:order.currency`
4. Si NO: mantener `appCurrency:'PEN'` como default

**Estimación:** 20 minutos (requiere análisis de contexto)

---

### FASE 4: MEDIOS - Compras (2 archivos, 4 usos)

**Prioridad:** 🟡 MEDIA  
**Razón:** Ya usa 'PEN' correctamente, solo estandarización  
**Archivos:**

- `purchase-detail.component` (.ts + .html) - 3 usos
- `purchase-list.component` (.ts + .html) - 1 uso

**Acciones:**

1. Import AppCurrencyPipe en ambos
2. Reemplazar `currency:'PEN'` → `appCurrency:'PEN'`

**Estimación:** 15 minutos

---

## 🎯 RESUMEN DEL PLAN

| Fase      | Módulo        | Archivos          | Usos        | Prioridad | Tiempo     |
| --------- | ------------- | ----------------- | ----------- | --------- | ---------- |
| 1         | Productos     | 2                 | 4           | 🔴 MÁXIMA | 15 min     |
| 2         | Ventas        | 1                 | 6           | 🔴 ALTA   | 15 min     |
| 3         | Pagos         | 1                 | 4           | 🔴 ALTA   | 20 min     |
| 4         | Compras       | 2                 | 4           | 🟡 MEDIA  | 15 min     |
| **TOTAL** | **4 módulos** | **6 componentes** | **18 usos** | -         | **65 min** |

---

## 📋 RESPUESTAS A PREGUNTAS CLAVE

### 1. ¿Cuántos usos incorrectos quedan?

**18 usos** de `| currency` en **6 componentes** diferentes.

### 2. ¿Cuáles son críticos?

**17 de 18** son prioridad ALTA:

- **product-detail:** Muestra USD en lugar de PEN ⚠️
- **sale-detail:** Mezcla USD y PEN inconsistentemente ⚠️
- **payments-list:** No respeta currency de orden ⚠️
- **products-list:** No usa pipe estandarizado
- **purchase-detail:** No usa pipe estandarizado

Solo **1 de 18** es prioridad MEDIA:

- **purchase-list:** Ya usa PEN correctamente

### 3. ¿Qué archivos deben corregirse primero?

**Orden recomendado:**

1. **product-detail.component** - Muestra $ cuando debe ser S/
2. **products-list.component** - Lista de productos con currency incorrecta
3. **sale-detail.component** - Inconsistencia USD/PEN
4. **payments-list.component** - No respeta currency de orden
5. **purchase-detail.component** - Solo estandarización
6. **purchase-list.component** - Solo estandarización

### 4. ¿Hay componentes que aún no importan AppCurrencyPipe?

**SÍ - Los 6 componentes afectados:**

| Componente                | Tiene AppCurrencyPipe | Requiere Acción             |
| ------------------------- | --------------------- | --------------------------- |
| payments-list.component   | ❌ NO                 | Import + añadir a imports[] |
| product-detail.component  | ❌ NO                 | Import + añadir a imports[] |
| products-list.component   | ❌ NO                 | Import + añadir a imports[] |
| purchase-detail.component | ❌ NO                 | Import + añadir a imports[] |
| purchase-list.component   | ❌ NO                 | Import + añadir a imports[] |
| sale-detail.component     | ❌ NO                 | Import + añadir a imports[] |

**Patrón a aplicar en cada .ts:**

```typescript
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  // ...
  standalone: true,
  imports: [
    // ... otros imports
    AppCurrencyPipe  // ← Añadir aquí
  ]
})
```

### 5. Plan de corrección por fases.

Ver sección **🎯 PLAN DE CORRECCIÓN POR FASES** arriba.

---

## 📝 PATRÓN DE REEMPLAZO

### Para productos (sin currency en modelo):

```html
<!-- ANTES -->
{{ product.sale_price | currency:'USD':'symbol':'1.2-2' }} {{ product.purchase_price | currency:'PEN':'symbol':'1.2-2' }}

<!-- DESPUÉS -->
{{ product.sale_price | appCurrency:'PEN' }} {{ product.purchase_price | appCurrency:'PEN' }}
```

### Para compras (sin currency en modelo):

```html
<!-- ANTES -->
{{ purchase.total | currency:'PEN':'symbol':'1.2-2' }}

<!-- DESPUÉS -->
{{ purchase.total | appCurrency:'PEN' }}
```

### Para ventas (sin currency en modelo):

```html
<!-- ANTES -->
{{ sale.total | currency:'USD':'symbol':'1.2-2' }}

<!-- DESPUÉS -->
{{ sale.total | appCurrency:'PEN' }}
```

### Para pagos (con currency de orden):

```html
<!-- ANTES -->
{{ order.total_amount | currency:'PEN':'symbol-narrow':'1.2-2' }}

<!-- DESPUÉS -->
{{ order.total_amount | appCurrency:order.currency }}
```

---

## ⚠️ NOTAS IMPORTANTES

### 1. Productos NO tienen currency

Los productos en el modelo NO tienen campo `currency`. Siempre usar `'PEN'` como default.

### 2. Compras NO tienen currency

Las compras en el modelo NO tienen campo `currency`. Siempre usar `'PEN'` como default.

### 3. Ventas NO tienen currency

Las ventas en el modelo NO tienen campo `currency`. Siempre usar `'PEN'` como default.

### 4. Órdenes SÍ tienen currency

Las órdenes tienen campo `currency` ('PEN' o 'USD'). Usar `order.currency` dinámicamente.

### 5. Pagos heredan currency

Los pagos individuales tienen `currency`, pero el resumen debe usar `order.currency`.

---

## ✅ CONCLUSIONES

### Estado actual:

- ✅ AppCurrencyPipe implementado y funcional
- ✅ Locale es-PE registrado
- ✅ Módulo de órdenes 100% corregido
- ❌ 6 componentes adicionales requieren corrección
- ❌ 18 usos de `| currency` deben reemplazarse

### Impacto:

- 🔴 **CRÍTICO:** Productos muestran $ en lugar de S/
- 🔴 **ALTO:** Ventas mezclan USD y PEN
- 🔴 **ALTO:** Pagos no respetan currency de orden
- 🟡 **MEDIO:** Compras solo requieren estandarización

### Tiempo estimado total:

**65 minutos** para completar todas las correcciones

### Riesgo:

**BAJO** - Patrón ya probado en módulo de órdenes

### Recomendación:

**Ejecutar correcciones en orden de prioridad (FASE 1 → FASE 4)**

---

**Auditoría completada:** 7/6/2026, 00:19  
**Total hallazgos:** 18 usos de `| currency`  
**Componentes afectados:** 6  
**Prioridad ALTA:** 17 hallazgos  
**Prioridad MEDIA:** 1 hallazgo  
**Status:** ⚠️ REQUIERE CORRECCIÓN URGENTE
