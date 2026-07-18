# 🔧 IMPLEMENTACIÓN: AppCurrencyPipe - Formato correcto de moneda

## ESTADO ACTUAL

El frontend usa `| currency` de Angular sin especificar código, lo que muestra **$** (USD) para todos los montos, incluso cuando son PEN (soles peruanos).

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Pipe Custom Creado

**Archivo:** `src/app/shared/pipes/app-currency.pipe.ts`

**Características:**

- Nombre: `appCurrency`
- Default: PEN (S/)
- Soporta: PEN, USD, EUR
- Maneja null/undefined
- Formato: 2 decimales

**Uso:**

```html
{{ amount | appCurrency }}
<!-- S/ 1,234.56 -->
{{ amount | appCurrency: 'USD' }}
<!-- $ 1,234.56 -->
{{ amount | appCurrency: order.currency }}
<!-- Dinámico -->
```

---

## 📁 ARCHIVOS CON | currency DETECTADOS

### 1. `order-payments/order-payments.component.html` ✅

**Usos encontrados:**

- Línea 9: `{{ orderTotalAmount | currency }}`
- Línea 12: `{{ getTotalPaid() | currency }}`
- Línea 16: `{{ getBalancePending() | currency }}`
- Línea 45: `{{ payment.amount | currency }}`

**Actualización necesaria:**

```html
<!-- Resumen (debe usar currency de orden, pasarlo como @Input) -->
{{ orderTotalAmount | appCurrency: orderCurrency }} {{ getTotalPaid() | appCurrency: orderCurrency }} {{ getBalancePending() | appCurrency: orderCurrency }}

<!-- Tabla pagos (debe usar payment.currency) -->
{{ payment.amount | appCurrency: payment.currency }}
```

---

## 📋 ARCHIVOS A REVISAR Y ACTUALIZAR

### Componentes de Órdenes:

1. ✅ `order-payments.component.html` - DETECTADO
2. [ ] `order-create.component.html` - Revisar
3. [ ] `order-detail.component.html` - Revisar
4. [ ] `orders-list.component.ts` - Template inline
5. [ ] `payments-list.component.ts` - Template inline

### Componentes de Compras:

6. [ ] `purchase-form.component.html` - Revisar
7. [ ] `purchase-detail.component.html` - Revisar
8. [ ] `purchase-list.component.html` - Revisar

### Componentes de Ventas:

9. [ ] `sale-form.component.html` - Revisar
10. [ ] `sale-detail.component.html` - Revisar
11. [ ] `sale-list.component.ts` - Template inline

### Componentes de Productos:

12. [ ] `products-list.component.ts` - Template inline
13. [ ] `product-form.component.html` - Revisar
14. [ ] `product-detail.component.html` - Revisar

---

## 🔧 PATRÓN DE ACTUALIZACIÓN

### Para Órdenes/Pedidos:

```typescript
// Component.ts - Añadir currency como input si falta
@Input() orderCurrency: string = 'PEN';

// Template
{{ order.total_amount | appCurrency: order.currency }}
{{ order.paid_amount | appCurrency: order.currency }}
```

### Para Pagos:

```html
{{ payment.amount | appCurrency: payment.currency }}
```

### Para Productos (sin currency en modelo):

```html
{{ product.sale_price | appCurrency: 'PEN' }} {{ product.purchase_price | appCurrency: 'PEN' }}
```

### Para Formularios con currency en form:

```typescript
// Component.ts
get selectedCurrency() {
  return this.form.get('currency')?.value || 'PEN';
}

// Template
{{ totalAmount | appCurrency: selectedCurrency }}
```

---

## 📊 MODELOS A VERIFICAR

### Order Model:

```typescript
interface Order {
  total_amount: number;
  paid_amount: number;
  currency: string; // ✅ Existe
}
```

### Payment Model:

```typescript
interface Payment {
  amount: number;
  currency: string; // ✅ Debe existir
}
```

### Product Model:

```typescript
interface Product {
  sale_price: number;
  purchase_price: number;
  // currency NO existe - usar 'PEN' por defecto
}
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Actualizar componentes principales

1. ✅ Crear AppCurrencyPipe
2. [ ] Actualizar order-payments.component (TS + HTML)
3. [ ] Actualizar order-create.component
4. [ ] Actualizar payments-list.component

### Fase 2: Actualizar componentes secundarios

5. [ ] Actualizar purchase-form
6. [ ] Actualizar sale-form
7. [ ] Actualizar products-list

### Fase 3: Verificación

8. [ ] npm run build
9. [ ] Pruebas visuales:
   - PEN muestra S/
   - USD muestra $
   - Productos muestran S/
   - Órdenes respetan currency

---

## ⚠️ CONSIDERACIONES

### No cambiar:

- ❌ Backend
- ❌ Modelos (solo verificar)
- ❌ Lógica de negocio

### Sí cambiar:

- ✅ Templates HTML
- ✅ Imports de componentes (añadir AppCurrencyPipe)
- ✅ @Input si falta orderCurrency

---

## 🔍 BÚSQUEDAS NECESARIAS

Para encontrar todos los usos:

```bash
# En templates
grep -r "| currency" src/app/**/*.html

# En templates inline (TypeScript)
grep -r "currency" src/app/**/*.ts

# Campos de montos
grep -r "total_amount\|paid_amount\|amount\|sale_price\|purchase_price" src/app/**/*.html
```

---

## ✅ RESULTADO ESPERADO

### ANTES:

```
Total: $ 390.00  (incorrecto para PEN)
Pagado: $ 0.00
Precio: $ 123.45
```

### DESPUÉS:

```
Total: S/ 390.00  (correcto para PEN)
Pagado: S/ 0.00
Precio: S/ 123.45

Total: $ 390.00  (correcto para USD)
```

---

**Status:** 🟡 EN PROGRESO  
**Archivos creados:** 1  
**Archivos pendientes actualización:** ~14  
**Prioridad:** ALTA (afecta UX de visualización de precios)
