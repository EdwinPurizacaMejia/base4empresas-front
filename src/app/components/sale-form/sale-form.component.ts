import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SalesService } from '../../services/sales.service';
import { SaleCreate } from '../../models/sale.model';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {
  @Output() saleCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  warehouses: string[] = []; // Simulated warehouse list

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private dialogRef: MatDialogRef<SaleFormComponent>
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private initForm(): void {
    this.form = this.fb.group({
      customer_id: ['', []],
      warehouse_id: ['', [Validators.required]],
      notes: ['', []],
      items: this.fb.array([this.createItemControl()], [Validators.required, Validators.minLength(1)])
    });
  }

  private createItemControl(): FormGroup {
    return this.fb.group({
      product_id: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadWarehouses(): void {
    // Simulated warehouse loading
    // In a real app, this would come from a service
    this.warehouses = [
      'warehouse-1',
      'warehouse-2',
      'warehouse-3'
    ];
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemControl());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  get calculateTotal(): number {
    return this.items.controls.reduce((total, control) => {
      if (control instanceof FormGroup) {
        const quantity = control.get('quantity')?.value || 0;
        const unitPrice = control.get('unit_price')?.value || 0;
        return total + (quantity * unitPrice);
      }
      return total;
    }, 0);
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index) as FormGroup;
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unit_price')?.value || 0;
    return quantity * unitPrice;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: SaleCreate = {
      customer_id: this.form.get('customer_id')?.value || null,
      warehouse_id: this.form.get('warehouse_id')?.value,
      notes: this.form.get('notes')?.value || null,
      items: this.items.value
    };

    this.salesService.createSale(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = `Venta ${response.number} registrada exitosamente. Total: S/${response.total.toFixed(2)}`;
        this.form.reset();
        this.items.clear();
        this.items.push(this.createItemControl());
        this.saleCreated.emit();
        this.dialogRef.close(true);

        // Auto-hide success message
        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (error) => {
        this.loading = false;

        const status = error?.status;
        const detail = error?.error?.detail;

        if (status === 409) {
          // recomendado: stock insuficiente / saldo negativo
          this.errorMessage = 'Stock insuficiente para completar la venta.';
        } else if ((status === 400 || status === 422) && detail) {
          this.errorMessage = String(detail);
        } else if (status === 400 && typeof detail === 'string' && detail.toLowerCase().includes('stock')) {
          this.errorMessage = `Stock insuficiente: ${detail}`;
        } else if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error al registrar la venta. Por favor intenta de nuevo.';
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        formGroup.get(key)?.markAsTouched();
      }
    }
    this.items.controls.forEach(item => {
      if (item instanceof FormGroup) {
        for (const key in item.controls) {
          if (item.controls.hasOwnProperty(key)) {
            item.get(key)?.markAsTouched();
          }
        }
      }
    });
  }

  onCancel(): void {
    this.form.reset();
    this.items.clear();
    this.items.push(this.createItemControl());
    this.errorMessage = '';
    this.successMessage = '';
    this.formClosed.emit();
    this.dialogRef.close(false);
  }
}
