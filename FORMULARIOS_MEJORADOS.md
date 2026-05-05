# GUÍA DE MEJORA DE FORMULARIOS CON ANGULAR MATERIAL

## Componentes Creados

### 1. **ConfirmationService** (`src/app/services/confirmation.service.ts`)

Servicio reutilizable para diálogos de confirmación en acciones críticas.

**Métodos disponibles:**

- `confirm(data)` - Confirmación personalizada
- `confirmDelete(itemName)` - Para eliminar elementos
- `confirmSave(itemName)` - Para guardar cambios
- `confirmCancel()` - Para cancelar sin guardar

**Uso:**

```typescript
this.confirmationService.confirmDelete("Producto A").subscribe((confirmed) => {
  if (confirmed) {
    // Proceder con eliminación
  }
});
```

### 2. **ConfirmationDialogComponent** (`src/app/components/confirmation-dialog/`)

Componente de diálogo visual con Material Design.

**Características:**

- Soporte para severidad (info, warning, error)
- Textos personalizables
- Iconos automáticos según tipo
- Estilos profesionales

### 3. **ImprovedFormExampleComponent** (`src/app/components/improved-form-example/`)

Formulario ejemplo completamente mejorado con:

- Angular Material Form Fields
- Validaciones reactivas
- Mensajes de error por campo
- Confirmación de acciones
- Snackbars para notificaciones
- Loading states
- Responsive design
- Accesibilidad (aria-invalid, labels)

---

## PASOS PARA ACTUALIZAR FORMULARIOS EXISTENTES

### Paso 1: Importar Angular Material

Actualizar `product-form.component.ts`:

```typescript
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,    // NUEVO
    MatInputModule,        // NUEVO
    MatButtonModule,       // NUEVO
    MatIconModule,         // NUEVO
    MatCardModule,         // NUEVO
    MatSnackBarModule,     // NUEVO
    MatSelectModule        // NUEVO
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
```

### Paso 2: Inyectar Servicios

```typescript
constructor(
  private fb: FormBuilder,
  private productsService: ProductsService,
  private snackBar: MatSnackBar,           // NUEVO
  private confirmationService: ConfirmationService  // NUEVO
) { }
```

### Paso 3: Agregar Confirmación de Guardado

```typescript
onSubmit(): void {
  if (this.form.invalid) {
    this.markAllAsTouched();
    return;
  }

  // NUEVO: Confirmar antes de guardar
  this.confirmationService
    .confirmSave(this.form.get('name')?.value)
    .subscribe(confirmed => {
      if (confirmed) {
        this.submitForm();
      }
    });
}
```

### Paso 4: Actualizar Template HTML

De esto:

```html
<input id="sku" type="text" formControlName="sku" placeholder="Ej: PROD-001" class="form-input" [class.form-input-error]="form.get('sku')?.invalid && form.get('sku')?.touched" /> <span class="error-message">{{ getErrorMessage('sku') }}</span>
```

A esto:

```html
<mat-form-field>
  <mat-label>SKU *</mat-label>
  <input matInput formControlName="sku" placeholder="Ej: PROD-001" [attr.aria-invalid]="hasError('sku')" />
  <mat-icon matPrefix>tag</mat-icon>
  <mat-error *ngIf="hasError('sku')"> {{ getErrorMessage('sku') }} </mat-error>
</mat-form-field>
```

### Paso 5: Usar Snackbars para Notificaciones

```typescript
// Reemplazar alertas genéricas
this.snackBar.open("✓ Producto guardado exitosamente", "Cerrar", {
  duration: 4000,
  horizontalPosition: "end",
  verticalPosition: "top",
  panelClass: ["snackbar-success"],
});
```

### Paso 6: Mejorar CSS

Usar las clases de Material. Adicionar al `product-form.component.css`:

```css
/* Form Container */
form {
  display: grid;
  gap: 16px;
  padding: 20px;
}

/* Grid responsive */
@media (max-width: 600px) {
  form {
    gap: 12px;
    padding: 12px;
  }
}

/* Botones */
button[mat-raised-button] {
  min-width: 120px;
}

button:disabled {
  cursor: not-allowed;
}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

Para cada formulario (product-form, purchase-form, sale-form):

- [ ] Importar módulos de Angular Material
- [ ] Inyectar MatSnackBar
- [ ] Inyectar ConfirmationService
- [ ] Agregar método `hasError(field)`
- [ ] Agregar confirmación en onSubmit()
- [ ] Reemplazar inputs HTML con mat-form-field
- [ ] Reemplazar alertas con snackBars
- [ ] Actualizar CSS para responsive
- [ ] Agregar iconos matPrefix
- [ ] Probar validaciones
- [ ] Probar confirmaciones
- [ ] Verificar en mobile

---

## ESTRUCTURA RECOMENDADA PARA PURCHASE-FORM

```typescript
// purchase-form.component.ts

form: FormGroup;
loading = false;
items: FormArray;
private destroy$ = new Subject<void>();

constructor(
  private fb: FormBuilder,
  private purchaseService: PurchaseService,
  private snackBar: MatSnackBar,
  private confirmationService: ConfirmationService
) {
  this.form = this.createForm();
}

private createForm(): FormGroup {
  return this.fb.group({
    supplier_id: ['', Validators.required],
    warehouse_id: ['', Validators.required],
    notes: [''],
    items: this.fb.array([this.createItemGroup()], Validators.required)
  });
}

private createItemGroup(): FormGroup {
  return this.fb.group({
    product_id: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unit_cost: [0, [Validators.required, Validators.min(0)]]
  });
}

addItem(): void {
  this.items.push(this.createItemGroup());
}

removeItem(index: number): void {
  this.confirmationService
    .confirm({
      title: 'Eliminar ítem',
      message: '¿Deseas eliminar este ítem de la compra?',
      severity: 'warning'
    })
    .subscribe(confirmed => {
      if (confirmed) {
        this.items.removeAt(index);
      }
    });
}

onSubmit(): void {
  if (this.form.invalid) {
    this.snackBar.open('Por favor completa todos los campos', 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
    return;
  }

  this.confirmationService
    .confirmSave('Compra')
    .subscribe(confirmed => {
      if (confirmed) {
        this.submitForm();
      }
    });
}
```

---

## VARIABLES CSS GLOBALES PARA CONSISTENCIA

Agregar a `styles.css`:

```css
:root {
  --primary-color: #1976d2;
  --accent-color: #ff4081;
  --warn-color: #f44336;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --border-radius: 4px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.snackbar-success {
  background-color: #4caf50 !important;
}

.snackbar-error {
  background-color: #f44336 !important;
}

.snackbar-warning {
  background-color: #ff9800 !important;
}

.snackbar-info {
  background-color: #2196f3 !important;
}
```

---

## ARCHIVO DE EJEMPLO COMPLETO

Ver `improved-form-example.component.ts` para referencia completa.

Es un formulario funcional que puedes copiar y adaptar.

---

## PRÓXIMOS PASOS

1. Aplicar cambios a `product-form.component.ts`
2. Aplicar cambios a `purchase-form.component.ts`
3. Aplicar cambios a `sale-form.component.ts`
4. Actualizar templates HTML
5. Actualizar CSS
6. Probar en navegador
7. Hacer commit a rama feature/formularios

---

**Creado:** 4 mayo 2026  
**Rama:** feature/formularios  
**Status:** Listo para implementar
