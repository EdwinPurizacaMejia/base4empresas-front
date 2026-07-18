# 🔍 DIAGNÓSTICO: Error de Locale "es-PE" en AppCurrencyPipe

## ❌ ERROR REPORTADO

```
ERROR RuntimeError: NG0701: Missing locale data for the locale "es-PE".
    at _AppCurrencyPipe.formatCurrency (app-currency.pipe.ts:66:30)
    at _AppCurrencyPipe.transform (app-currency.pipe.ts:52:17)
    at OrdersListComponent_div_34_table_2_td_15_Template (orders-list.component.html:97:13)
```

---

## 🎯 CAUSA RAÍZ

### Código problemático en `app-currency.pipe.ts`:

```typescript
constructor() {
  this.currencyPipe = new CurrencyPipe('es-PE');  // ❌ Locale no registrado
}
```

### ¿Por qué falla?

Angular **NO incluye automáticamente** todos los locales. Por defecto, solo incluye `en-US`.

Para usar **cualquier otro locale** (como `es-PE`), se requieren **2 pasos obligatorios**:

1. **Importar los datos del locale** desde `@angular/common/locales`
2. **Registrar el locale** con `registerLocaleData()`

**Sin estos pasos, Angular no puede formatear monedas con ese locale.**

---

## 📊 ANÁLISIS DEL PROBLEMA

### Archivo afectado: `src/app/shared/pipes/app-currency.pipe.ts`

**Líneas problemáticas:**

- Línea 28: `this.currencyPipe = new CurrencyPipe('es-PE');`
- Línea 66: `this.currencyPipe.transform(...)` ← Aquí falla al intentar usar el locale

### ¿Qué intentaba hacer el código?

```typescript
private formatCurrency(value: number, code: string): string {
  const currencySymbols: { [key: string]: string } = {
    'PEN': 'S/',
    'USD': '$',
    'EUR': '€'
  };

  const symbol = currencySymbols[code] || 'S/';

  // Línea 66 - AQUÍ FALLA
  return this.currencyPipe.transform(value, code, 'symbol-narrow', '1.2-2') || `${symbol} 0.00`;
}
```

El `CurrencyPipe('es-PE')` intenta usar datos de localización peruanos para formatear números (separadores de miles, decimales, etc.), pero **esos datos no están disponibles** en el bundle de Angular.

---

## ✅ SOLUCIÓN REQUERIDA

### Opción 1: Registrar locale 'es-PE' (RECOMENDADO)

**Archivo:** `src/main.ts` o `src/app/app.config.ts`

**Agregar:**

```typescript
import { registerLocaleData } from "@angular/common";
import localeEsPe from "@angular/common/locales/es-PE";

// Registrar locale peruano
registerLocaleData(localeEsPe, "es-PE");
```

**Ventajas:**

- ✅ Formato correcto para Perú (separadores, decimales)
- ✅ Soporte completo de internacionalización
- ✅ El pipe funcionará como esperado

### Opción 2: Cambiar a locale 'en-US' (QUICK FIX)

**Archivo:** `src/app/shared/pipes/app-currency.pipe.ts`

**Cambiar línea 28:**

```typescript
// ANTES
this.currencyPipe = new CurrencyPipe("es-PE");

// DESPUÉS
this.currencyPipe = new CurrencyPipe("en-US");
```

**Ventajas:**

- ✅ Fix inmediato sin configuración adicional
- ✅ No requiere imports adicionales

**Desventajas:**

- ⚠️ Usará formato americano (coma para miles, punto para decimales)
- ⚠️ Puede no ser ideal para usuarios peruanos

---

## 🔧 IMPLEMENTACIÓN DETALLADA - OPCIÓN 1 (RECOMENDADO)

### Paso 1: Verificar archivo de configuración

Buscar dónde se bootstrapea la aplicación:

- Angular standalone: `src/main.ts`
- Con app.config: `src/app/app.config.ts`

### Paso 2: Añadir imports y registro

```typescript
// En main.ts o app.config.ts
import { registerLocaleData } from "@angular/common";
import localeEsPe from "@angular/common/locales/es-PE";

// Antes de bootstrapApplication() o en providers
registerLocaleData(localeEsPe, "es-PE");
```

### Paso 3: Opcional - Definir como locale default

Si quieres que 'es-PE' sea el locale por defecto de toda la app:

```typescript
import { LOCALE_ID } from "@angular/core";

// En providers de app.config.ts
providers: [
  { provide: LOCALE_ID, useValue: "es-PE" },
  // ... otros providers
];
```

### Paso 4: No requiere cambios en app-currency.pipe.ts

El pipe ya está correctamente configurado, solo necesita que el locale esté registrado.

---

## 📝 EJEMPLO COMPLETO

### main.ts (Angular standalone):

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { registerLocaleData } from "@angular/common";
import localeEsPe from "@angular/common/locales/es-PE";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

// Registrar locale peruano
registerLocaleData(localeEsPe, "es-PE");

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

### O en app.config.ts:

```typescript
import { ApplicationConfig } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeEsPe from "@angular/common/locales/es-PE";

// Registrar locale antes de exportar config
registerLocaleData(localeEsPe, "es-PE");

export const appConfig: ApplicationConfig = {
  providers: [
    // ... tus providers
  ],
};
```

---

## 🎯 RESULTADO ESPERADO

### Después de registrar el locale:

```typescript
// El pipe funcionará correctamente
{{ 1234.56 | appCurrency: 'PEN' }}
// Salida: S/ 1,234.56  (con formato peruano)

{{ 1234.56 | appCurrency: 'USD' }}
// Salida: $ 1,234.56  (con formato peruano)
```

### Formato numérico con 'es-PE':

- Miles: `,` (coma)
- Decimales: `.` (punto)
- Ejemplo: `1,234.56`

---

## ⚠️ NOTAS IMPORTANTES

### 1. Tamaño del bundle

Registrar locales adicionales **aumenta ligeramente** el tamaño del bundle (~5-10 KB por locale).

### 2. Múltiples locales

Si necesitas soporte para múltiples países:

```typescript
import localeEsPe from "@angular/common/locales/es-PE";
import localeEs from "@angular/common/locales/es";
import localeEn from "@angular/common/locales/en";

registerLocaleData(localeEsPe, "es-PE");
registerLocaleData(localeEs, "es");
registerLocaleData(localeEn, "en");
```

### 3. Alternativa sin locale

Si NO quieres registrar 'es-PE', puedes usar 'en-US' o hacer un formatter manual:

```typescript
// Formatter manual sin dependencia de locale
private formatCurrency(value: number, code: string): string {
  const symbols = { 'PEN': 'S/', 'USD': '$', 'EUR': '€' };
  const symbol = symbols[code] || 'S/';
  const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol} ${formatted}`;
}
```

---

## ✅ RECOMENDACIÓN FINAL

**Implementar Opción 1: Registrar locale 'es-PE'**

**Razones:**

1. ✅ Solución correcta y robusta
2. ✅ Soporte completo de internacionalización
3. ✅ Formato apropiado para usuarios peruanos
4. ✅ Reutilizable para otros pipes/componentes
5. ✅ No requiere cambios en AppCurrencyPipe

**Archivo a modificar:** `src/main.ts` o `src/app/app.config.ts`

**Líneas a añadir:** ~3 líneas de código

**Impacto:** MUY BAJO - Solo registro de locale

---

**Diagnóstico completado:** 6/6/2026, 23:01  
**Severidad:** 🔴 CRÍTICO (Bloquea funcionalidad)  
**Complejidad fix:** 🟢 MUY BAJA (3 líneas)  
**Prioridad:** ALTA  
**Causa:** Locale 'es-PE' no registrado en la aplicación
