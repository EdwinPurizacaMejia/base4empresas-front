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
import { ConfirmationService } from '../../services/confirmation.service';

/**
 * EJEMPLO DE FORMULARIO MEJORADO CON ANGULAR MATERIAL
 * 
 * Este componente demuestra:
 * - Uso de Angular Material para campos consistentes
 * - Validaciones reactivas con mensajes de error por campo
 * - Confirmación de acciones críticas (guardar, cancelar)
 * - Mejor UX con snackbars y loading state
 * - Estructura escalable y limpia
 */

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  minStock: number;
}

@Component({
  selector: 'app-improved-form-example',
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
  templateUrl: './improved-form-example.component.html',
  styleUrl: './improved-form-example.component.css'
})
export class ImprovedFormExampleComponent implements OnDestroy {
  @Output() formSubmitted = new EventEmitter<ProductFormData>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  categories = [
    { value: 'electronics', label: 'Electrónica' },
    { value: 'furniture', label: 'Muebles' },
    { value: 'software', label: 'Software' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
      category: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      minStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Obtiene mensaje de error específico para cada campo
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
   * Obtiene la etiqueta legible del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sku: 'SKU',
      name: 'Nombre',
      description: 'Descripción',
      category: 'Categoría',
      price: 'Precio',
      minStock: 'Stock mínimo'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Verifica si un campo tiene error y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Maneja el envío del formulario
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

    // Confirmar antes de guardar
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
   * Envía el formulario (simula API call)
   */
  private submitForm(): void {
    this.loading = true;

    // Simular llamada a API
    setTimeout(() => {
      const formData: ProductFormData = {
        sku: this.form.get('sku')?.value,
        name: this.form.get('name')?.value,
        description: this.form.get('description')?.value,
        category: this.form.get('category')?.value,
        price: parseFloat(this.form.get('price')?.value),
        minStock: parseInt(this.form.get('minStock')?.value)
      };

      this.loading = false;
      this.form.reset();

      this.snackBar.open('✓ Producto guardado exitosamente', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });

      this.formSubmitted.emit(formData);
    }, 1500);
  }

  /**
   * Maneja el cancelar del formulario
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

  /**
   * Limpia recursos
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
