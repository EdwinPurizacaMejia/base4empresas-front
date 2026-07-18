# 🚀 INICIO RÁPIDO - Notificaciones y Estados

Estás en la rama `feature/notificaciones-estados`. Aquí están todas las mejoras de UX listos para usar.

---

## 📖 Documentación (Lee primero)

| Documento                          | Contenido                                  |
| ---------------------------------- | ------------------------------------------ |
| **RESUMEN_MEJORAS_UX.md**          | Visión general completa (⭐ COMIENZA AQUÍ) |
| **GUIA_NOTIFICACIONES_ESTADOS.md** | Referencia técnica detallada               |
| **PATRONES_COMUNES.md**            | 10+ ejemplos listos para copiar            |

---

## ⚡ 5 Minutos de Setup

### 1. Importar en tu componente

```typescript
import { NotificationService } from "../../services/notification.service";
import { LoadingSpinnerComponent } from "../shared/loading-spinner.component";
import { EmptyStateComponent } from "../shared/empty-state.component";
import { ErrorStateComponent } from "../shared/error-state.component";
```

### 2. Agregar a imports

```typescript
@Component({
  imports: [
    // ... otros
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ]
})
```

### 3. Inyectar servicio

```typescript
constructor(
  private service: MyService,
  private notificationService: NotificationService
) {}
```

### 4. Copiar template base

```html
<!-- Cargando -->
<app-loading-spinner *ngIf="loading && items.length === 0"></app-loading-spinner>

<!-- Error -->
<app-error-state *ngIf="error && !loading" [message]="error" (onRetry)="load()"></app-error-state>

<!-- Sin datos -->
<app-empty-state *ngIf="!loading && !error && items.length === 0"></app-empty-state>

<!-- Datos -->
<app-table *ngIf="!error && items.length > 0" [data]="items"></app-table>
```

### 5. Usar notificaciones

```typescript
this.notificationService.success("¡Listo!");
this.notificationService.error("Ocurrió un error");
this.notificationService.warning("Advertencia");
this.notificationService.info("Información");
```

✅ **¡Listo!** Tu componente ahora tiene notificaciones y estados visuales.

---

## 📚 Recursos

| Recurso         | Ubicación                                                   |
| --------------- | ----------------------------------------------------------- |
| **Servicio**    | `src/app/services/notification.service.ts`                  |
| **Componentes** | `src/app/components/shared/`                                |
| **Estilos**     | `src/styles-notifications.css`                              |
| **Ejemplos**    | `src/app/components/products-list/`                         |
| **Demo**        | `src/app/components/shared/notifications-demo.component.ts` |

---

## 🎯 Siguientes Pasos

1. ✅ Lee `RESUMEN_MEJORAS_UX.md` (visión general)
2. ✅ Copia ejemplos de `PATRONES_COMUNES.md`
3. ✅ Integra en tus componentes
4. ✅ Prueba en diferentes estados (carga, error, vacío)
5. ✅ Verifica en mobile (responsive)

---

## 💡 Ejemplos Rápidos

### Notificación de éxito

```typescript
this.notificationService.success("✓ Producto creado");
```

### Loading mientras carga datos

```html
<app-loading-spinner *ngIf="loading" message="Cargando productos..."></app-loading-spinner>
```

### Sin datos

```html
<app-empty-state icon="inbox" title="Sin productos" [showAction]="true" (onAction)="onCreate()"></app-empty-state>
```

### Error con reintentos

```html
<app-error-state [message]="error" (onRetry)="loadProducts()"></app-error-state>
```

---

## ✅ Componentes Actualizados (Ejemplos)

- ✅ `products-list` - Patrón completo implementado
- ✅ `purchase-list` - Patrón completo implementado

Usa estos como referencia para otros componentes.

---

## 🐛 Ayuda Rápida

**¿Cómo mostrar notificación?**

```typescript
this.notificationService.success("Mensaje");
```

**¿Cómo mostrar loading?**

```html
<app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
```

**¿Cómo mostrar error?**

```html
<app-error-state [message]="error"></app-error-state>
```

**¿Cómo mostrar sin datos?**

```html
<app-empty-state *ngIf="items.length === 0"></app-empty-state>
```

---

## 🔗 Links Útiles

- **Rama actual:** `feature/notificaciones-estados`
- **Base de commits:** [Ver en leeme.txt]
- **Estado:** ✅ Listo para Pull Request

---

## 🎓 Aprendizaje Progresivo

**Principiante:**

1. Lee `RESUMEN_MEJORAS_UX.md`
2. Copia un patrón de `PATRONES_COMUNES.md`
3. Cambia los textos para tu caso

**Intermedio:**

1. Lee `GUIA_NOTIFICACIONES_ESTADOS.md`
2. Comprende las props de cada componente
3. Personaliza colores y mensajes

**Avanzado:**

1. Lee el código fuente de los componentes
2. Crea tus propios componentes personalizados
3. Contribuye mejoras

---

## 🚀 Próximo: Integración en Otros Componentes

Una vez que entiendas los patrones, integra en:

- `kardex-list`
- `sale-list`
- `stock-list`
- `dashboard`

Todos siguen el mismo patrón de 3 estados: cargando → error/vacío → datos.

---

**¡Que disfrutes las mejoras de UX! 🎉**

Para dudas o preguntas, consulta la documentación o revisa los ejemplos en `products-list` y `purchase-list`.
