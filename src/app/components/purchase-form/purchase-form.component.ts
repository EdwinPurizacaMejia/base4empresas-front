import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { PurchaseService } from '../../services/purchase.service';
import { PurchaseCreate, PurchaseItemCreate } from '../../models/purchase.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-form.component.html',
  styleUrl: './purchase-form.component.css'
})
export class PurchaseFormComponent {
  @Output() purchaseCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private purchaseService: PurchaseService) {
    this.form = this.fb.group({
      supplier_id: ['', [Validators.required]],
      warehouse_id: ['', [Validators.required]],
      notes: [''],
      items: this.fb.array(
        [this.createItemFormGroup()],
        [Validators.required, Validators.minLength(1)]
      )
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      product_id: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_cost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      // Mostrar alerta o mensaje
      console.warn('Debe tener al menos un item');
    }
  }

  getItemError(itemIndex: number, fieldName: string): string | null {
    const control = this.items.at(itemIndex).get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${fieldName} es requerido`;
    }

    if (control.errors['min']) {
      return `${fieldName} debe ser mayor a ${control.errors['min'].min}`;
    }

    return 'Campo inválido';
  }

  getFormError(fieldName: string): string | null {
    const control = this.form.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${fieldName} es requerido`;
    }

    return 'Campo inválido';
  }

  getItemsError(): string | null {
    const control = this.form.get('items');

    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required'] || control.errors['minlength']) {
      return 'Debe tener al menos 1 item';
    }

    return null;
  }

  calculateTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitCost = item.get('unit_cost')?.value || 0;
      return sum + (quantity * unitCost);
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marcar controles principales como tocados
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          this.form.get(key)?.markAsTouched();
        }
      }
      
      // Marcar items como tocados
      this.items.controls.forEach(item => {
        if (item instanceof FormGroup) {
          for (const key in item.controls) {
            if (item.controls.hasOwnProperty(key)) {
              item.get(key)?.markAsTouched();
            }
          }
        }
      });
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const payload: PurchaseCreate = {
      supplier_id: this.form.get('supplier_id')?.value,
      warehouse_id: this.form.get('warehouse_id')?.value,
      notes: this.form.get('notes')?.value || null,
      items: this.items.value.map((item: any) => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity) || 0,
        unit_cost: parseFloat(item.unit_cost) || 0
      }))
    };

    this.purchaseService.createPurchase(payload).subscribe({
      next: (response) => {
        this.success = true;
        this.successMessage = `✓ Compra ${response.number} registrada exitosamente. Total: $${response.total}`;
        this.loading = false;
        this.form.reset();
        this.items.clear();
        this.items.push(this.createItemFormGroup());

        setTimeout(() => {
          this.purchaseCreated.emit();
        }, 500);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.detail || 'Error al registrar la compra. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.form.reset();
    this.items.clear();
    this.items.push(this.createItemFormGroup());
    this.error = null;
    this.success = false;
    this.formClosed.emit();
  }
}
