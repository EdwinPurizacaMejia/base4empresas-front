import { Component, EventEmitter, Output, OnDestroy, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PurchaseService } from '../../services/purchase.service';
import { PurchaseCreate } from '../../models/purchase.model';
import { ConfirmationService } from '../../services/confirmation.service';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/supplier.model';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';

interface DialogData {
  purchase?: any;
}

@Component({
  selector: 'app-purchase-form',
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
    MatSelectModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css']
})
export class PurchaseFormComponent implements OnInit, OnDestroy {
  @Output() purchaseCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  private editingPurchaseId: string | null = null;

  suppliers: Supplier[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  private destroy$ = new Subject<void>();

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private suppliersService: SuppliersService,
    private warehouseService: WarehouseService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService,
    private dialogRef: MatDialogRef<PurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();

    if (this.data?.purchase) {
      this.editingPurchaseId = this.data.purchase?.id ?? null;
      this.patchFormForEdit(this.data.purchase);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      supplier_id: ['', [Validators.required]],
      warehouse_id: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      product_id: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_cost: [0, [Validators.required, Validators.min(0.01)]]
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

    if (errors['maxLength']) {
      return `${this.getFieldLabel(fieldName)} no puede exceder ${errors['maxLength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtiene etiqueta legible del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      supplier_id: 'Proveedor',
      warehouse_id: 'Almacén',
      notes: 'Notas',
      product_id: 'Producto',
      quantity: 'Cantidad',
      unit_cost: 'Costo Unitario'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Obtiene mensaje de error para items
   */
  getItemError(itemIndex: number, fieldName: string): string {
    const control = this.items.at(itemIndex).get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} requerido`;
    }

    if (errors['min']) {
      return `Mínimo ${errors['min'].min}`;
    }

    return 'Inválido';
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Verifica si un item tiene error
   */
  hasItemError(itemIndex: number, fieldName: string): boolean {
    const control = this.items.at(itemIndex).get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Agrega un nuevo item
   */
  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  /**
   * Elimina un item con confirmación
   */
  removeItem(index: number): void {
    if (this.items.length === 1) {
      this.snackBar.open('Debes mantener al menos un item', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    this.confirmationService
      .confirmDelete(`Item ${index + 1}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.items.removeAt(index);
          this.snackBar.open('Item eliminado', 'Cerrar', {
            duration: 2000,
            panelClass: ['snackbar-success']
          });
        }
      });
  }

  /**
   * Calcula el total de la compra
   */
  calculateTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitCost = item.get('unit_cost')?.value || 0;
      return sum + (quantity * unitCost);
    }, 0);
  }

  /**
   * Marca todos los campos como tocados
   */
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });

    this.items.controls.forEach(item => {
      Object.keys((item as FormGroup).controls).forEach(key => {
        (item as FormGroup).get(key)?.markAsTouched();
      });
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
      .confirmSave('esta compra')
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.submitForm();
        }
      });
  }

  private loadCatalogs(): void {
    this.suppliersService
      .getSuppliers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.suppliers = data ?? []),
        error: (err) => console.error('Error cargando proveedores', err),
      });

    this.warehouseService
      .getWarehouses({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.warehouses = data ?? []),
        error: (err) => console.error('Error cargando almacenes', err),
      });

    this.productsService
      .getProducts({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.products = data ?? []),
        error: (err) => console.error('Error cargando productos', err),
      });
  }

  private patchFormForEdit(purchase: any): void {
    const items = purchase?.items ?? [];

    // reset items (y quitar el item inicial que se crea por defecto)
    this.items.clear();
    if (items.length > 0) {
      items.forEach((it: any) => {
        this.items.push(
          this.fb.group({
            product_id: [it?.product_id ?? it?.product?.id ?? '', [Validators.required]],
            quantity: [
              it?.quantity ?? 1,
              [Validators.required, Validators.min(1)],
            ],
            unit_cost: [
              it?.unit_cost ?? it?.unit_price ?? it?.price ?? 0,
              [Validators.required, Validators.min(0.01)],
            ],
          }),
        );
      });
    } else {
      this.items.push(this.createItemGroup());
    }

    this.form.patchValue({
      supplier_id: purchase?.supplier?.id ?? purchase?.supplier_id ?? '',
      warehouse_id: purchase?.warehouse?.id ?? purchase?.warehouse_id ?? '',
      notes: purchase?.notes ?? '',
    });
  }

  /**
   * Envía el formulario (API call)
   */
  private submitForm(): void {
    this.loading = true;

    const payload: PurchaseCreate = {
      supplier_id: this.form.get('supplier_id')?.value,
      warehouse_id: this.form.get('warehouse_id')?.value,
      notes: this.form.get('notes')?.value || null,
      items: this.items.value.map((item: any) => ({
        product_id: item.product_id,
        // Mantener precisión (y evitar issues con coma decimal en el input)
        quantity: Number(item.quantity) || 0,
        unit_cost: Number(item.unit_cost) || 0,
      })),
    };

    const request$ = this.editingPurchaseId
      ? this.purchaseService.updatePurchase(this.editingPurchaseId, payload)
      : this.purchaseService.createPurchase(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          this.snackBar.open(
            this.editingPurchaseId
              ? `✓ Compra actualizada exitosamente. Total: $${response.total}`
              : `✓ Compra registrada exitosamente. Total: $${response.total}`,
            'Cerrar',
            {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            }
          );

          setTimeout(() => {
            this.purchaseCreated.emit();
            this.dialogRef.close(true);
          }, 300);
        },
        error: (err) => {
          this.loading = false;
          const errorMsg =
            err.userMessage ||
            err.error?.detail ||
            (this.editingPurchaseId ? 'Error al actualizar la compra' : 'Error al registrar la compra');

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
            this.items.clear();
            this.items.push(this.createItemGroup());
            this.formClosed.emit();
            this.dialogRef.close(false);
          }
        });
    } else {
      this.formClosed.emit();
      this.dialogRef.close(false);
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
