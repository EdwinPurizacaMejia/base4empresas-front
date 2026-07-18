# Patrones Comunes - NotificationService & Componentes de Estado

Snippets rápidos para integrar notificaciones en tus componentes.

## 1️⃣ Patrón Básico: Cargar y Mostrar Lista

```typescript
import { NotificationService } from "../../services/notification.service";
import { LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent } from "../shared/...";

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
      error: () => {
        this.error = "Error al cargar. Intenta nuevamente.";
        this.loading = false;
        this.notificationService.error("Error al cargar elementos");
      },
    });
  }
}
```

```html
<div class="container">
  <app-loading-spinner *ngIf="loading && items.length === 0"></app-loading-spinner>
  <app-error-state *ngIf="error && !loading" [message]="error" (onRetry)="loadItems()"></app-error-state>
  <app-empty-state *ngIf="!loading && !error && items.length === 0" [showAction]="true" (onAction)="onCreate()"></app-empty-state>
  <app-table *ngIf="!error && items.length > 0" [data]="items" [loading]="loading"></app-table>
</div>
```

---

## 2️⃣ Crear / Actualizar con Validación

```typescript
onSubmit(formData: MyItem): void {
  if (!formData.name) {
    this.notificationService.warning('El nombre es requerido');
    return;
  }

  this.isLoading = true;

  const operation = formData.id
    ? this.service.update(formData.id, formData)
    : this.service.create(formData);

  operation.subscribe({
    next: () => {
      this.isLoading = false;
      const message = formData.id ? 'actualizado' : 'creado';
      this.notificationService.success(`Elemento ${message} correctamente`);
      this.onClose();
      this.loadItems(); // recarga la lista
    },
    error: (err) => {
      this.isLoading = false;
      const message = formData.id ? 'actualizar' : 'crear';
      this.notificationService.error(`Error al ${message} elemento`);
      console.error(err);
    }
  });
}
```

---

## 3️⃣ Eliminar con Confirmación

```typescript
onDelete(item: MyItem): void {
  if (!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  this.isProcessing = true;

  this.service.delete(item.id).subscribe({
    next: () => {
      this.isProcessing = false;
      this.notificationService.success('Elemento eliminado correctamente');
      this.loadItems();
    },
    error: (err) => {
      this.isProcessing = false;
      this.notificationService.error('Error al eliminar elemento');
      console.error(err);
    }
  });
}
```

Con overlay:

```html
<app-loading-overlay [isLoading]="isProcessing" message="Eliminando..."></app-loading-overlay>
```

---

## 4️⃣ Búsqueda / Filtrado

```typescript
onSearch(term: string): void {
  this.loading = true;
  this.error = null;

  this.service.search(term).subscribe({
    next: (results) => {
      this.items = results;
      this.loading = false;

      if (results.length === 0) {
        this.notificationService.info(`No se encontraron resultados para "${term}"`);
      }
    },
    error: () => {
      this.error = 'Error al buscar';
      this.loading = false;
      this.notificationService.error('Error en la búsqueda');
    }
  });
}
```

---

## 5️⃣ Descarga de Archivos

```typescript
onDownloadReport(): void {
  this.isDownloading = true;

  this.service.generateReport().subscribe({
    next: (blob) => {
      this.isDownloading = false;

      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${new Date().getTime()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.notificationService.success('Archivo descargado correctamente');
    },
    error: () => {
      this.isDownloading = false;
      this.notificationService.error('Error al descargar archivo');
    }
  });
}
```

```html
<button (click)="onDownloadReport()" [disabled]="isDownloading">
  <mat-icon *ngIf="!isDownloading">download</mat-icon>
  <mat-spinner *ngIf="isDownloading" diameter="20"></mat-spinner>
  {{ isDownloading ? 'Descargando...' : 'Descargar' }}
</button>
```

---

## 6️⃣ Importación / Carga de Datos

```typescript
onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (!file) {
    return;
  }

  if (!file.name.endsWith('.csv')) {
    this.notificationService.warning('Solo se permiten archivos CSV');
    return;
  }

  this.isImporting = true;
  const formData = new FormData();
  formData.append('file', file);

  this.service.importData(formData).subscribe({
    next: (result) => {
      this.isImporting = false;
      this.notificationService.success(
        `${result.imported} elementos importados correctamente`
      );
      this.loadItems();
    },
    error: (err) => {
      this.isImporting = false;
      const errorMsg = err.error?.message || 'Error al importar archivo';
      this.notificationService.error(errorMsg);
    }
  });
}
```

```html
<app-loading-overlay [isLoading]="isImporting" message="Importando datos..."></app-loading-overlay>

<input type="file" accept=".csv" (change)="onFileSelected($event)" #fileInput />
```

---

## 7️⃣ Operaciones en Lote

```typescript
onDeleteSelected(selectedIds: string[]): void {
  const count = selectedIds.length;

  if (!confirm(`¿Eliminar ${count} elemento(s)? Esta acción no se puede deshacer.`)) {
    return;
  }

  this.isProcessing = true;

  this.service.deleteMultiple(selectedIds).subscribe({
    next: (result) => {
      this.isProcessing = false;
      this.notificationService.success(
        `${result.deleted} elemento(s) eliminado(s) correctamente`
      );
      this.selectedIds = [];
      this.loadItems();
    },
    error: () => {
      this.isProcessing = false;
      this.notificationService.error('Error al eliminar elementos');
    }
  });
}
```

---

## 8️⃣ Validación de Permisos

```typescript
onEditItem(item: MyItem): void {
  if (!this.hasEditPermission(item)) {
    this.notificationService.warning('No tienes permiso para editar este elemento');
    return;
  }

  this.openEditForm(item);
}

private hasEditPermission(item: MyItem): boolean {
  // tu lógica de permisos
  return true;
}
```

---

## 9️⃣ Manejo de Errores Específicos

```typescript
private handleError(error: any): void {
  if (error.status === 400) {
    this.notificationService.warning('Datos inválidos');
  } else if (error.status === 401) {
    this.notificationService.error('Sesión expirada. Por favor, inicia sesión nuevamente');
    // Redirect to login
  } else if (error.status === 403) {
    this.notificationService.warning('No tienes permiso para esta acción');
  } else if (error.status === 404) {
    this.notificationService.warning('Elemento no encontrado');
  } else if (error.status === 409) {
    this.notificationService.warning('El elemento ya existe');
  } else if (error.status === 500) {
    this.notificationService.error('Error del servidor. Intenta más tarde');
  } else {
    this.notificationService.error('Error inesperado. Intenta nuevamente');
  }
}
```

---

## 🔟 Estados Parciales (Actualización sin recarga)

```typescript
onToggleStatus(item: MyItem): void {
  const newStatus = !item.active;
  const oldStatus = item.active;

  // Optimistic update
  item.active = newStatus;

  this.service.updateStatus(item.id, newStatus).subscribe({
    next: () => {
      this.notificationService.success(
        `Estado actualizado a ${newStatus ? 'Activo' : 'Inactivo'}`
      );
    },
    error: () => {
      // Revertir
      item.active = oldStatus;
      this.notificationService.error('Error al actualizar estado');
    }
  });
}
```

---

## 📝 Atajos Útiles

```typescript
// Limpiar todas las notificaciones
this.notificationService.closeAll();

// Notificación rápida de éxito
this.onSuccess("¡Listo!"); // usa el método helper

// Notificación con duración personalizada
this.notificationService.show(
  "Mensaje personalizado",
  "warning",
  5000, // 5 segundos
  "Cerrar",
);
```

---

## ✅ Checklist para Integración

- [ ] Inyectar `NotificationService` en el componente
- [ ] Agregar propiedades `loading`, `error`, `items`
- [ ] Implementar método `loadData()`
- [ ] Usar notificaciones en éxito/error
- [ ] Agregar componentes de estado en el template
- [ ] Probar los 3 estados: cargando, error, sin datos
- [ ] Probar en mobile (responsive)
- [ ] Revisar mensajes de error para usuarios

---

**Rama:** `feature/notificaciones-estados`
**Última actualización:** 5 de mayo de 2026
