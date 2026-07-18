# Guía de Notificaciones y Estados - Feature/notificaciones-estados

## 📋 Resumen

Esta rama agrega mejoras de UX integradas sin rehacer la arquitectura:

✅ **NotificationService** - Notificaciones toast reutilizables
✅ **LoadingSpinnerComponent** - Spinner de carga elegante
✅ **LoadingOverlayComponent** - Overlay de carga para operaciones críticas
✅ **EmptyStateComponent** - Mensaje amigable cuando no hay datos
✅ **ErrorStateComponent** - Gestión visual de errores con reintentos

## 🚀 Cómo Usar

### 1. NotificationService (Para cualquier componente)

Inyecta el servicio y úsalo en tus métodos:

```typescript
import { NotificationService } from '../../services/notification.service';

constructor(private notificationService: NotificationService) {}

// Notificación de éxito
this.notificationService.success('¡Operación exitosa!');

// Notificación de error
this.notificationService.error('Algo salió mal. Intenta nuevamente.');

// Notificación de advertencia
this.notificationService.warning('Acción no reversible');

// Notificación informativa
this.notificationService.info('Información importante');

// Personalizada (tipo, duración)
this.notificationService.show(
  'Mensaje personalizado',
  'success',
  3000,  // duración en ms
  'Descartar'  // label del botón
);
```

### 2. LoadingSpinnerComponent (Estado de carga inicial)

Usa cuando los datos están cargando desde el inicio:

```html
<!-- En el template -->
<app-loading-spinner *ngIf="isLoading" message="Cargando datos..." [diameter]="50" [strokeWidth]="4"></app-loading-spinner>
```

**Props:**

- `message`: string - Texto a mostrar (default: "Cargando...")
- `diameter`: number - Tamaño del spinner (default: 50)
- `strokeWidth`: number - Grosor de la línea (default: 4)

### 3. LoadingOverlayComponent (Operaciones críticas)

Usa para operaciones que requieren bloqueo visual total:

```typescript
export class MyComponent {
  isProcessing = false;

  handleDelete() {
    this.isProcessing = true;

    this.service.delete(id).subscribe({
      next: () => {
        this.notificationService.success("Eliminado");
        this.isProcessing = false;
      },
      error: () => {
        this.notificationService.error("Error al eliminar");
        this.isProcessing = false;
      },
    });
  }
}
```

```html
<app-loading-overlay [isLoading]="isProcessing" message="Procesando operación..."></app-loading-overlay>
```

### 4. EmptyStateComponent (Sin datos)

Usa cuando no hay datos disponibles:

```html
<app-empty-state *ngIf="!loading && !error && items.length === 0" icon="inbox" title="Sin elementos" description="No hay elementos para mostrar" [showAction]="true" actionLabel="Crear primero" (onAction)="onCreate()"></app-empty-state>
```

**Props:**

- `icon`: string - Ícono Material (default: "inbox")
- `iconClass`: string - Clases CSS adicionales
- `title`: string - Título (default: "Sin datos")
- `description`: string - Descripción
- `showAction`: boolean - Mostrar botón de acción (default: false)
- `actionLabel`: string - Texto del botón
- `onAction()`: evento al hacer clic

**Iconos útiles:**

- `inventory_2` - Para productos
- `shopping_cart` - Para compras/ventas
- `people` - Para clientes/proveedores
- `assessment` - Para reportes
- `inbox` - Genérico

### 5. ErrorStateComponent (Gestión de errores)

Usa para mostrar errores de forma amigable:

```html
<app-error-state *ngIf="error && !loading" icon="error_outline" title="Error al cargar" [message]="error" [details]="errorDetails" (onRetry)="loadData()" (onGoBack)="navigateBack()" retryLabel="Intentar nuevamente" backLabel="Volver"></app-error-state>
```

**Props:**

- `icon`: string - Ícono a mostrar (default: "error_outline")
- `title`: string - Título del error
- `message`: string - Mensaje principal
- `details`: string - Detalles técnicos (opcional)
- `retryLabel`: string - Texto del botón reintentar
- `backLabel`: string - Texto del botón atrás
- `onRetry`: EventEmitter - Al hacer clic en reintentar
- `onGoBack`: EventEmitter - Al hacer clic en volver

## 📱 Patrón Completo (Recomendado)

Este es el patrón que ya implementamos en products-list y purchase-list:

```typescript
export class MyListComponent implements OnInit {
  items: MyItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private service: MyService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;

    this.service.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al cargar. Intenta nuevamente.";
        this.loading = false;
        this.notificationService.error("Error al cargar elementos");
      },
    });
  }

  onSuccess(): void {
    this.notificationService.success("Operación completada");
    this.loadItems();
  }

  onDelete(item: MyItem): void {
    if (confirm("¿Estás seguro?")) {
      this.service.delete(item.id).subscribe({
        next: () => {
          this.notificationService.success("Elemento eliminado");
          this.loadItems();
        },
        error: () => {
          this.notificationService.error("Error al eliminar");
        },
      });
    }
  }
}
```

```html
<div class="container">
  <!-- Loading -->
  <app-loading-spinner *ngIf="loading && items.length === 0" message="Cargando..."></app-loading-spinner>

  <!-- Error -->
  <app-error-state *ngIf="error && !loading" [message]="error" (onRetry)="loadItems()"></app-error-state>

  <!-- Empty -->
  <app-empty-state *ngIf="!loading && !error && items.length === 0" title="Sin elementos" [showAction]="true" (onAction)="onCreate()"></app-empty-state>

  <!-- Data -->
  <app-table *ngIf="!error && items.length > 0" [data]="items" [loading]="loading"></app-table>
</div>
```

## 🎨 Estilos Consistentes

Todos los componentes respetan:

- **Variables CSS** globales del proyecto
- **Angular Material** para iconos y botones
- **Responsive design** (mobile, tablet, desktop)
- **Paleta de colores** consistente
- **Tipografía** unificada

## 📦 Importaciones Necesarias

Para usar los componentes en tu archivo standalone:

```typescript
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { LoadingOverlayComponent } from '../shared/loading-overlay.component';

@Component({
  imports: [
    // ... otros imports
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingOverlayComponent
  ]
})
```

## ✅ Componentes Actualizados

Ya incluyen estas mejoras:

- ✅ `products-list` - Ejemplo completo
- ✅ `purchase-list` - Ejemplo completo

## 🔄 Cómo Añadir a Otros Componentes

1. **Importa el servicio y componentes**
2. **Añade propiedades** loading, error, items
3. **Actualiza métodos** para usar notificationService
4. **Reemplaza template** con el patrón completo arriba
5. **Prueba los 3 estados**: cargando, error, sin datos

## 📝 Notas Importantes

- El NotificationService usa **MatSnackBar** (Material)
- Todos los componentes son **standalone**
- Responden automáticamente a cambios de tamaño
- Los tiempos de notificación son configurables
- Los colores vienen de variables CSS globales

## 🚀 Próximas Mejoras (Fase 3)

- Dialog de confirmación mejorado
- Notificaciones de descarga de archivos
- Progress bar para cargas largas
- Tooltips informativos
- Animaciones de transición entre estados

---

**Rama:** `feature/notificaciones-estados`
**Estado:** ✅ Listo para integración
**Última actualización:** 5 de mayo de 2026
