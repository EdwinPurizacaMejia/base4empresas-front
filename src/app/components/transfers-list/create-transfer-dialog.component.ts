import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { WarehouseService } from '../../services/warehouse.service';
import { ProductsService } from '../../services/products.service';
import { StockOperationsService } from '../../services/stock-operations.service';
import { NotificationService } from '../../services/notification.service';

import { TransferCreate } from '../../models/stock-operations.model';

@Component({
  selector: 'app-create-transfer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>swap_horiz</mat-icon>
      Crear Transferencia entre Almacenes
    </h2>

    <mat-dialog-content>
      <form [formGroup]="transferForm">
        <!-- Almacén Origen -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Almacén Origen</mat-label>
          <mat-select formControlName="warehouse_from_id" required (selectionChange)="onWarehouseFromChange()">
            <mat-option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
          <mat-hint>Almacén desde donde se retiran los productos</mat-hint>
          <mat-error *ngIf="transferForm.get('warehouse_from_id')?.hasError('required')">
            El almacén origen es obligatorio
          </mat-error>
        </mat-form-field>

        <!-- Almacén Destino -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Almacén Destino</mat-label>
          <mat-select formControlName="warehouse_to_id" required (selectionChange)="validateDifferentWarehouses()">
            <mat-option *ngFor="let warehouse of availableDestinationWarehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
          <mat-hint>Almacén al que se transfieren los productos</mat-hint>
          <mat-error *ngIf="transferForm.get('warehouse_to_id')?.hasError('required')">
            El almacén destino es obligatorio
          </mat-error>
          <mat-error *ngIf="transferForm.get('warehouse_to_id')?.hasError('sameWarehouse')">
            El almacén destino debe ser diferente al origen
          </mat-error>
        </mat-form-field>

        <!-- Mensaje de validación -->
        <div *ngIf="sameWarehouseError" class="warning-box">
          <mat-icon>warning</mat-icon>
          <span>El almacén origen y destino deben ser diferentes</span>
        </div>

        <!-- Producto -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Producto</mat-label>
          <mat-select formControlName="product_id" required>
            <mat-option *ngFor="let product of products" [value]="product.id">
              {{ product.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="transferForm.get('product_id')?.hasError('required')">
            El producto es obligatorio
          </mat-error>
        </mat-form-field>

        <!-- Cantidad -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Cantidad</mat-label>
          <input 
            matInput 
            type="number" 
            formControlName="quantity"
            min="0.01"
            step="0.01"
            required
          >
          <mat-hint>Cantidad a transferir (debe ser mayor a 0)</mat-hint>
          <mat-error *ngIf="transferForm.get('quantity')?.hasError('required')">
            La cantidad es obligatoria
          </mat-error>
          <mat-error *ngIf="transferForm.get('quantity')?.hasError('min')">
            La cantidad debe ser mayor a 0
          </mat-error>
        </mat-form-field>

        <!-- Nota -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nota (opcional)</mat-label>
          <textarea 
            matInput 
            formControlName="note"
            rows="3"
            placeholder="Motivo o comentarios sobre la transferencia..."
          ></textarea>
        </mat-form-field>
      </form>

      <!-- Loading Indicator -->
      <div *ngIf="saving" class="loading-overlay">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Guardando transferencia...</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving">
        Cancelar
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSubmit()"
        [disabled]="!transferForm.valid || saving || sameWarehouseError"
      >
        <mat-icon>save</mat-icon>
        Guardar Transferencia
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-height: 400px;
      max-height: 70vh;
      padding: 20px;
      position: relative;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .warning-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #fff3e0;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #f57c00;
      border-left: 4px solid #f57c00;
    }

    .warning-box mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #f57c00;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-overlay p {
      margin-top: 16px;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 20px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1a237e;
    }

    h2 mat-icon {
      color: #2196f3;
    }
  `]
})
export class CreateTransferDialogComponent implements OnInit {
  transferForm: FormGroup;
  warehouses: any[] = [];
  availableDestinationWarehouses: any[] = [];
  products: any[] = [];
  saving = false;
  sameWarehouseError = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private warehouseService: WarehouseService,
    private productsService: ProductsService,
    private stockOperationsService: StockOperationsService,
    private notificationService: NotificationService
  ) {
    this.transferForm = this.fb.group({
      warehouse_from_id: ['', Validators.required],
      warehouse_to_id: ['', Validators.required],
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.availableDestinationWarehouses = warehouses;
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
        this.notificationService.error('Error al cargar almacenes');
      }
    });
  }

  loadProducts(): void {
    this.productsService.getProducts({ isActive: true }).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.notificationService.error('Error al cargar productos');
      }
    });
  }

  onWarehouseFromChange(): void {
    const warehouseFromId = this.transferForm.get('warehouse_from_id')?.value;
    
    // Filtrar almacenes de destino para excluir el almacén de origen
    this.availableDestinationWarehouses = this.warehouses.filter(
      w => w.id !== warehouseFromId
    );

    // Si el destino actual es igual al origen, limpiar
    const warehouseToId = this.transferForm.get('warehouse_to_id')?.value;
    if (warehouseToId === warehouseFromId) {
      this.transferForm.get('warehouse_to_id')?.setValue('');
    }

    this.validateDifferentWarehouses();
  }

  validateDifferentWarehouses(): void {
    const warehouseFromId = this.transferForm.get('warehouse_from_id')?.value;
    const warehouseToId = this.transferForm.get('warehouse_to_id')?.value;

    if (warehouseFromId && warehouseToId && warehouseFromId === warehouseToId) {
      this.sameWarehouseError = true;
      this.transferForm.get('warehouse_to_id')?.setErrors({ sameWarehouse: true });
    } else {
      this.sameWarehouseError = false;
      // Solo quitar el error de sameWarehouse, mantener otros errores
      const currentErrors = this.transferForm.get('warehouse_to_id')?.errors;
      if (currentErrors && currentErrors['sameWarehouse']) {
        delete currentErrors['sameWarehouse'];
        const hasOtherErrors = Object.keys(currentErrors).length > 0;
        this.transferForm.get('warehouse_to_id')?.setErrors(hasOtherErrors ? currentErrors : null);
      }
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid || this.sameWarehouseError) {
      this.notificationService.error('Por favor completa todos los campos obligatorios');
      return;
    }

    this.saving = true;

    const formValue = this.transferForm.value;

    const payload: TransferCreate = {
      warehouse_from_id: formValue.warehouse_from_id,
      warehouse_to_id: formValue.warehouse_to_id,
      note: formValue.note || undefined,
      items: [
        {
          product_id: formValue.product_id,
          quantity: Number(formValue.quantity)
        }
      ]
    };

    this.stockOperationsService.createTransfer(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.notificationService.success('Transferencia creada exitosamente');
        this.dialogRef.close('created');
      },
      error: (err) => {
        this.saving = false;
        console.error('Error creating transfer:', err);
        
        // Manejo de errores específicos
        if (err.status === 422) {
          const errorMsg = err.error?.detail || 'Validación fallida';
          this.notificationService.error(`Error de validación: ${errorMsg}`);
        } else if (err.status === 400) {
          this.notificationService.error('Stock insuficiente en almacén origen');
        } else {
          this.notificationService.error('Error al crear la transferencia');
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
