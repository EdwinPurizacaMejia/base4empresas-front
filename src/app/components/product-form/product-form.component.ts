import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProductsService } from '../../services/products.service';
import { ProductCreate } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  @Output() productCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService
  ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required]],
      name: ['', [Validators.required]],
      barcode: [''],
      description: [''],
      category_id: [null],
      unit_id: [null],
      sale_price: [0, [Validators.required, Validators.min(0)]],
      purchase_price: [0, [Validators.required, Validators.min(0)]],
      min_stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  getErrorMessage(fieldName: string): string | null {
    const control = this.form.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${fieldName} es requerido`;
    }

    if (control.errors['min']) {
      return `${fieldName} debe ser mayor o igual a ${control.errors['min'].min}`;
    }

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

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

    this.productsService.createProduct(payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.form.reset();
        
        // Emitir evento después de 500ms para mostrar el mensaje de éxito brevemente
        setTimeout(() => {
          this.productCreated.emit();
        }, 500);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.detail || 'Error al crear el producto. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.form.reset();
    this.error = null;
    this.success = false;
    this.formClosed.emit();
  }
}
