# 🔴 DIAGNÓSTICO: Page Freeze en /ventas/pedidos/crear

## ESTADO

**CAUSA RAÍZ IDENTIFICADA** ✅

---

## 🎯 CAUSA RAÍZ PRINCIPAL

**CHANGE DETECTION INFINITO causado por getters y expresiones en template**

### Archivo afectado

`src/app/components/orders/order-create.component.html`  
Líneas: 10, 140-143, 167-173

---

## 🔍 EVIDENCIA

### 1️⃣ **PROBLEMA CRÍTICO: Getter `totalAmount` en template (Líneas 167-173)**

**HTML:**

```html
<div class="summary-row">
  <span>Total Neto:</span>
  <strong>{{ totalAmount | currency }}</strong>
</div>
```

**TypeScript (order-create.component.ts, líneas 64-69):**

```typescript
get totalAmount(): number {
  return this.items.value.reduce((sum: number, item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const discounted = subtotal - (item.discount || 0);
    return sum + discounted;
  }, 0);
}
```

**¿Por qué causa freeze?**

- Angular ejecuta este getter en **CADA ciclo de change detection**
- El getter recorre **todo el array de items** cada vez
- Como hay bindings bidireccionales en los inputs, cada tecla presionada dispara change detection
- Resultado: **cientos de ejecuciones por segundo** → navegador colapsa

---

### 2️⃣ **PROBLEMA CRÍTICO: DataSource usando `items.value` (Línea 10)**

**HTML (línea 10):**

```html
<table mat-table [dataSource]="items.value" class="items-table"></table>
```

**¿Por qué causa freeze?**

- `items.value` crea un **nuevo array** en cada acceso
- Angular compara referencias, detecta que es "diferente"
- Vuelve a renderizar toda la tabla
- Esto dispara más change detection
- **Loop infinito** de re-renderizado

---

### 3️⃣ **PROBLEMA CRÍTICO: Expresiones complejas en template (Líneas 140-143)**

**HTML:**

```html
<td mat-cell *matCellDef="let item; let i = index" class="subtotal-cell">{{ (getItemControl(i, 'quantity').value || 0) * (getItemControl(i, 'unitPrice').value || 0) - (getItemControl(i, 'discount').value || 0) | currency }}</td>
```

**¿Por qué causa freeze?**

- Angular ejecuta esta expresión **en cada change detection**
- Cada `getItemControl()` accede al FormArray
- Con 3 llamadas por celda × N filas × múltiples ciclos CD
- **Sobrecarga exponencial** de cálculos

---

### 4️⃣ **PROBLEMA MODERADO: Métodos llamados desde template**

**HTML (múltiples líneas):**

```html
{{ customer.full_name || customer.business_name }} {{ product.name }}
```

Llamados dentro de `*ngFor` se ejecutan múltiples veces por ciclo CD.

---

## 📊 FLUJO DEL PROBLEMA

```
Usuario carga /ventas/pedidos/crear
         ↓
ngOnInit ejecuta loadFormData()
         ↓
forkJoin carga datos (customers, channels, products)
         ↓
loadingData = false → template se renderiza
         ↓
Template contiene:
  - [dataSource]="items.value" → nuevo array en cada CD
  - {{ totalAmount }} → getter que recorre array en cada CD
  - Expresiones complejas en cada celda
         ↓
CHANGE DETECTION INFINITO
         ↓
CPU al 100% → "La página no responde"
```

---

## 🎯 SOLUCIÓN MÍNIMA

### **Cambios requeridos en `order-create.component.ts`:**

#### 1. Reemplazar getter `totalAmount` por método memoizado

```typescript
// ANTES (MALO):
get totalAmount(): number {
  return this.items.value.reduce(...);
}

// DESPUÉS (BUENO):
private _cachedTotal: number = 0;

calculateTotal(): number {
  this._cachedTotal = this.items.value.reduce((sum: number, item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const discounted = subtotal - (item.discount || 0);
    return sum + discounted;
  }, 0);
  return this._cachedTotal;
}

// Llamar cuando cambie items, no en cada CD
```

#### 2. Usar array cacheado para dataSource

```typescript
// AÑADIR:
itemsDataSource: any[] = [];

// EN loadFormData, después de addItem():
this.updateDataSource();

// MÉTODO NUEVO:
private updateDataSource(): void {
  this.itemsDataSource = [...this.items.value];
}

// Llamar en addItem() y removeItem()
```

#### 3. Cachear cálculos de subtotal por ítem

```typescript
// AÑADIR:
getItemSubtotal(index: number): number {
  const item = this.items.at(index).value;
  return (item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0);
}
```

### **Cambios requeridos en `order-create.component.html`:**

#### 1. Reemplazar `[dataSource]="items.value"`

```html
<!-- ANTES: -->
<table mat-table [dataSource]="items.value">
  <!-- DESPUÉS: -->
  <table mat-table [dataSource]="itemsDataSource"></table>
</table>
```

#### 2. Reemplazar `{{ totalAmount }}` con método

```html
<!-- ANTES: -->
<strong>{{ totalAmount | currency }}</strong>

<!-- DESPUÉS: -->
<strong>{{ calculateTotal() | currency }}</strong>
```

#### 3. Simplificar cálculo de subtotal

```html
<!-- ANTES: -->
{{ (getItemControl(i, 'quantity').value || 0) * (getItemControl(i, 'unitPrice').value || 0) - (getItemControl(i, 'discount').value || 0) | currency }}

<!-- DESPUÉS: -->
{{ getItemSubtotal(i) | currency }}
```

---

## ⚠️ RIESGOS

### Riesgo BAJO ✅

- Los cambios son **aislados** al componente
- No afectan la lógica de negocio
- No cambian la API ni modelos
- Mejoran el rendimiento sin cambiar funcionalidad

### Consideraciones:

1. **Testear** que los cálculos sigan siendo correctos
2. **Verificar** que la tabla se actualice al añadir/quitar items
3. **Validar** que el total se actualice cuando cambien valores

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

```
[ ] 1. Crear propiedad itemsDataSource
[ ] 2. Crear método updateDataSource()
[ ] 3. Convertir getter totalAmount a método calculateTotal()
[ ] 4. Añadir método getItemSubtotal(index)
[ ] 5. Actualizar HTML: cambiar [dataSource]
[ ] 6. Actualizar HTML: cambiar totalAmount por calculateTotal()
[ ] 7. Actualizar HTML: usar getItemSubtotal() en celdas
[ ] 8. Llamar updateDataSource() en addItem()
[ ] 9. Llamar updateDataSource() en removeItem()
[ ] 10. Llamar calculateTotal() cuando cambian valores (opcional: valueChanges)
[ ] 11. Probar: cargar página sin freeze
[ ] 12. Probar: añadir/quitar items
[ ] 13. Probar: cambiar valores y verificar totales
```

---

## 🏁 RESULTADO ESPERADO

- Página carga **instantáneamente**
- No hay freeze del navegador
- Formulario responde **fluido**
- Cálculos siguen siendo **correctos**
- CPU usage **normal** (< 10%)

---

## 📚 REFERENCIAS TÉCNICAS

### Angular Change Detection Best Practices:

1. **NO usar getters en templates** → causa re-ejecución constante
2. **NO crear objetos/arrays nuevos en bindings** → rompe comparación de referencias
3. **NO hacer cálculos complejos en template** → cachear resultados
4. **SÍ usar trackBy en \*ngFor** → mejora rendimiento
5. **SÍ cachear datos calculados** → evita re-cálculos

### Patrones Anti-Pattern detectados:

- ❌ Getter en interpolación: `{{ totalAmount }}`
- ❌ Expresión nueva en binding: `[dataSource]="items.value"`
- ❌ Cálculos en template: `(a * b - c)`
- ❌ Múltiples llamadas a métodos en loops

---

**Diagnóstico completado**: 6/6/2026, 19:49  
**Analista**: Tech Lead Angular  
**Severidad**: 🔴 CRÍTICA  
**Prioridad**: INMEDIATA
