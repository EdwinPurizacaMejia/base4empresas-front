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

import { ProductsService } from '../../services/products.service';
import { StockOperationsService } from '../../services/stock-operations.service';
import { NotificationService } from '../../services/notification.service';

import { 
  MovementType, 
  AdjustmentReason, 
  StockAdjustmentCreate,
  getAdjustmentReasonLabel,
  getMovementTypeLabel
} from '../../models/stock-operations.model';

@Component({
  selector: 'app-create-adjustment-dialog',
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
      <mat-icon>add_circle</mat-icon>
      Crear Ajuste de Inventario
    </h2>

    <mat-dialog-content>
      <form [formGroup]="adjustmentForm">
        <!-- Tipo de Movimiento -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Tipo de Movimiento</mat-label>
          <mat-select formControlName="movement_type" required (selectionChange)="onMovementTypeChange()">
            <mat-option [value]="MovementType.IN">
              ↑ {{ getMovementTypeLabel(MovementType.IN) }}
            </mat-option>
            <mat-option [value]="MovementType.OUT">
              ↓ {{ getMovementTypeLabel(MovementType.OUT) }}
            </mat-option>
          </mat-select>
          <mat-hint>Entrada (IN) incrementa stock, Salida (OUT) decrementa stock</mat-hint>
          <mat-error *ngIf="adjustmentForm.get('movement_type')?.hasError('required')">
            El tipo de movimiento es obligatorio
          </mat-error>
        </mat-form-field>

        <!-- Razón -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Razón del Ajuste</mat-label>
          <mat-select formControlName="reason">
            <mat-option [value]="AdjustmentReason.MERMA">
              {{ getAdjustmentReasonLabel(AdjustmentReason.MERMA) }}
            </mat-option>
            <mat-option [value]="AdjustmentReason.REGULARIZACION">
              {{ getAdjustmentReasonLabel(AdjustmentReason.REGULARIZACION) }}
            </mat-option>
            <mat-option [value]="AdjustmentReason.INVENTARIO_INICIAL">
              {{ getAdjustmentReasonLabel(AdjustmentReason.INVENTARIO_INICIAL) }}
            </mat-option>
            <mat-option [value]="AdjustmentReason.OTRO">
              {{ getAdjustmentReasonLabel(AdjustmentReason.OTRO) }}
            </mat-option>
          </mat-select>
          <mat-hint>Motivo del ajuste (por defecto: OTRO)</mat-hint>
        </mat-form-field>

        <!-- Producto -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Producto</mat-label>
          <mat-select formControlName="product_id" required>
            <mat-option *ngFor="let product of products" [value]="product.id">
              {{ product.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="adjustmentForm.get('product_id')?.hasError('required')">
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
          <mat-hint>Cantidad siempre positiva (mayor a 0)</mat-hint>
          <mat-error *ngIf="adjustmentForm.get('quantity')?.hasError('required')">
            La cantidad es obligatoria
          </mat-error>
          <mat-error *ngIf="adjustmentForm.get('quantity')?.hasError('min')">
            La cantidad debe ser mayor a 0
          </mat-error>
        </mat-form-field>

        <!-- Costo Unitario (condicional) -->
        <mat-form-field 
          appearance="fill" 
          class="full-width"
          *ngIf="isMovementTypeIN"
        >
          <mat-label>Costo Unitario *</mat-label>
          <input 
            matInput 
            type="number" 
            formControlName="unit_cost"
            min="0"
            step="0.01"
            [required]="isMovementTypeIN"
          >
          <mat-hint class="cost-hint-in">
            ⚠️ OBLIGATORIO para entradas (IN)
          </mat-hint>
          <mat-error *ngIf="adjustmentForm.get('unit_cost')?.hasError('required')">
            El costo unitario es obligatorio para entradas (IN)
          </mat-error>
          <mat-error *ngIf="adjustmentForm.get('unit_cost')?.hasError('min')">
            El costo debe ser mayor o igual a 0
          </mat-error>
        </mat-form-field>

        <div *ngIf="!isMovementTypeIN" class="cost-info-out">
          <mat-icon>info</mat-icon>
          <span>
            El costo unitario se calculará automáticamente usando el método de costeo (Promedio Ponderado)
          </span>
        </div>

        <!-- Nota -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nota (opcional)</mat-label>
          <textarea 
            matInput 
            formControlName="note"
            rows="3"
            placeholder="Comentarios adicionales sobre el ajuste..."
          ></textarea>
        </mat-form-field>
      </form>

      <!-- Loading Indicator -->
      <div *ngIf="saving" class="loading-overlay">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Guardando ajuste...</p>
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
        [disabled]="!adjustmentForm.valid || saving"
      >
        <mat-icon>save</mat-icon>
        Guardar Ajuste
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

    .cost-hint-in {
      color: #f44336;
      font-weight: 500;
    }

    .cost-info-out {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #1976d2;
    }

    .cost-info-out mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
      color: #1976d2;
    }
  `]
})
export class CreateAdjustmentDialogComponent implements OnInit {
  adjustmentForm: FormGroup;
  products: any[] = [];
  saving = false;

  // Enums para el template
  MovementType = MovementType;
  AdjustmentReason = AdjustmentReason;

  // Helpers para el template
  getMovementTypeLabel = getMovementTypeLabel;
  getAdjustmentReasonLabel = getAdjustmentReasonLabel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productsService: ProductsService,
    private stockOperationsService: StockOperationsService,
    private notificationService: NotificationService
  ) {
    this.adjustmentForm = this.fb.group({
      movement_type: ['', Validators.required],
      reason: [AdjustmentReason.OTRO],
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit_cost: [0, [Validators.min(0)]],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  get isMovementTypeIN(): boolean {
    return this.adjustmentForm.get('movement_type')?.value === MovementType.IN;
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

  onMovementTypeChange(): void {
    const unitCostControl = this.adjustmentForm.get('unit_cost');
    
    if (this.isMovementTypeIN) {
      // Para IN: unit_cost es obligatorio
      unitCostControl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      // Para OUT: unit_cost no es necesario
      unitCostControl?.clearValidators();
      unitCostControl?.setValue(null);
    }
    
    unitCostControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.adjustmentForm.invalid) {
      this.notificationService.error('Por favor completa todos los campos obligatorios');
      return;
    }

    this.saving = true;

    const formValue = this.adjustmentForm.value;

    const payload: StockAdjustmentCreate = {
      warehouse_id: this.data.warehouseId,
      movement_type: formValue.movement_type,
      reason: formValue.reason || AdjustmentReason.OTRO,
      note: formValue.note || undefined,
      items: [
        {
          product_id: formValue.product_id,
          quantity: Number(formValue.quantity),
          unit_cost: this.isMovementTypeIN ? Number(formValue.unit_cost) : undefined
        }
      ]
    };

    this.stockOperationsService.createAdjustment(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.notificationService.success('Ajuste creado exitosamente');
        this.dialogRef.close('created');
      },
      error: (err) => {
        this.saving = false;
        console.error('Error creating adjustment:', err);
        
        // Manejo de errores específicos
        if (err.status === 422) {
          const errorMsg = err.error?.detail || 'Validación fallida';
          this.notificationService.error(`Error de validación: ${errorMsg}`);
        } else {
          this.notificationService.error('Error al crear el ajuste');
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
