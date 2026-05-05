import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductsService } from '../../services/products.service';
import { ProductCreate } from '../../models/product.model';
import { ConfirmationService } from '../../services/confirmation.service';

/**
 * EJEMPLO DE PRODUCT-FORM MEJORADO
 * 
 * Cambios principales:
 * 1. Imports de Angular Material
 * 2. Inyección de ConfirmationService y MatSnackBar
 * 3. Confirmación antes de guardar
 * 4. Snackbars para notificaciones
 * 5. Método hasError() para validación visual
 * 6. Subject para unsubscribe
 * 7. Loading state mejorado
 */

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './product-form-improved.component.html',
  styleUrl: './product-form-improved.component.css'
})
export class ProductFormImprovedComponent implements OnDestroy {
  @Output() productCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  categories = [
    { value: 1, label: 'Electrónica' },
    { value: 2, label: 'Muebles' },
    { value: 3, label: 'Software' }
  ];

  units = [
    { value: 1, label: 'Unidad' },
    { value: 2, label: 'Caja' },
    { value: 3, label: 'Paquete' }
  ];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      barcode: [''],
      description: ['', [Validators.maxLength(500)]],
      category_id: [null, [Validators.required]],
      unit_id: [null, [Validators.required]],
      sale_price: [0, [Validators.required, Validators.min(0.01)]],
      purchase_price: [0, [Validators.required, Validators.min(0.01)]],
      min_stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Obtiene mensaje de error específico
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (errors['minLength']) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${errors['minLength'].requiredLength} caracteres`;
    }

    if (errors['maxLength']) {
      return `${this.getFieldLabel(fieldName)} no puede exceder ${errors['maxLength'].requiredLength} caracteres`;
    }

    if (errors['min']) {
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${errors['min'].min}`;
    }

    return 'Campo inválido';
  }

  /**
   * Etiqueta legible del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sku: 'SKU',
      name: 'Nombre',
      barcode: 'Código de Barras',
      description: 'Descripción',
      category_id: 'Categoría',
      unit_id: 'Unidad',
      sale_price: 'Precio Venta',
      purchase_price: 'Precio Compra',
      min_stock: 'Stock Mínimo'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Verifica si hay error
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Marca todos como tocados
   */
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Manejo del envío
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Confirmación de guardado
    this.confirmationService
      .confirmSave(this.form.get('name')?.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.submitForm();
        }
      });
  }

  /**
   * Envío efectivo del formulario
   */
  private submitForm(): void {
    this.loading = true;

    const payload: ProductCreate = {
      sku: this.form.get('sku')?.value,
      name: this.form.get('name')?.value,
      barcode: this.form.get('barcode')?.value || null,
      description: this.form.get('description')?.value || null,
      category_id: this.form.get('category_id')?.value || null,
      unit_id: this.form.get('unit_id')?.value || null,
      sale_price: parseFloat(this.form.get('sale_price')?.value) || 0,
      purchase_price: parseFloat(this.form.get('purchase_price')?.value) || 0,
      min_stock: parseInt(this.form.get('min_stock')?.value) || 0
    };

    this.productsService.createProduct(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.reset();

          this.snackBar.open('✓ Producto guardado exitosamente', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          setTimeout(() => {
            this.productCreated.emit();
          }, 300);
        },
        error: (err) => {
          this.loading = false;
          const errorMsg = err.error?.detail || 'Error al guardar el producto';

          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });

          console.error('Error:', err);
        }
      });
  }

  /**
   * Cancelar con confirmación si hay cambios
   */
  onCancel(): void {
    if (this.form.dirty) {
      this.confirmationService
        .confirmCancel()
        .pipe(takeUntil(this.destroy$))
        .subscribe(confirmed => {
          if (confirmed) {
            this.form.reset();
            this.formClosed.emit();
          }
        });
    } else {
      this.formClosed.emit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
