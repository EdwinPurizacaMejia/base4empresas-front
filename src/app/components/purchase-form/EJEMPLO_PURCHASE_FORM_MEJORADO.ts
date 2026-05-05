/**
 * EJEMPLO DE PURCHASE-FORM MEJORADO
 * 
 * Muestra cómo aplicar las mejoras a un formulario más complejo
 * que tiene FormArray de items.
 */

import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PurchaseService } from '../../services/purchase.service';
import { PurchaseCreate, PurchaseItemCreate } from '../../models/purchase.model';
import { ConfirmationService } from '../../services/confirmation.service';

/**
 * CARACTERÍSTICAS PRINCIPALES:
 * - Confirmación antes de guardar
 * - Confirmación antes de eliminar items
 * - Mensajes de error claros
 * - Loading state
 * - Snackbars para notificaciones
 * - FormArray con control de items
 * - Estilos Material Design
 */

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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule
  ],
  template: `
    <mat-card class="form-card">
      <!-- Header -->
      <mat-card-header>
        <div class="form-header">
          <h2>Nueva Compra</h2>
          <button 
            mat-icon-button 
            (click)="onCancel()"
            [disabled]="loading"
            class="btn-close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <!-- Form Content -->
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">

          <div class="form-grid">
            <!-- Proveedor -->
            <mat-form-field class="half-width">
              <mat-label>Proveedor *</mat-label>
              <mat-select formControlName="supplier_id" [attr.aria-invalid]="hasError('supplier_id')">
                <mat-option value="">-- Seleccionar --</mat-option>
                <mat-option value="1">Proveedor A</mat-option>
                <mat-option value="2">Proveedor B</mat-option>
              </mat-select>
              <mat-icon matPrefix>business</mat-icon>
              <mat-error *ngIf="hasError('supplier_id')">
                {{ getErrorMessage('supplier_id') }}
              </mat-error>
            </mat-form-field>

            <!-- Almacén -->
            <mat-form-field class="half-width">
              <mat-label>Almacén *</mat-label>
              <mat-select formControlName="warehouse_id" [attr.aria-invalid]="hasError('warehouse_id')">
                <mat-option value="">-- Seleccionar --</mat-option>
                <mat-option value="1">Almacén Central</mat-option>
                <mat-option value="2">Almacén Secundario</mat-option>
              </mat-select>
              <mat-icon matPrefix>warehouse</mat-icon>
              <mat-error *ngIf="hasError('warehouse_id')">
                {{ getErrorMessage('warehouse_id') }}
              </mat-error>
            </mat-form-field>

            <!-- Notas -->
            <mat-form-field class="full-width">
              <mat-label>Notas</mat-label>
              <textarea 
                matInput 
                formControlName="notes" 
                rows="2"
                placeholder="Notas adicionales sobre esta compra">
              </textarea>
              <mat-icon matPrefix>note</mat-icon>
            </mat-form-field>
          </div>

          <!-- Items -->
          <div class="items-section">
            <div class="section-header">
              <h3>Items de Compra</h3>
              <button 
                type="button" 
                mat-mini-fab 
                color="primary" 
                (click)="addItem()"
                [disabled]="loading"
                title="Agregar nuevo item">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <div *ngIf="items.length === 0" class="empty-state">
              <mat-icon>shopping_cart</mat-icon>
              <p>No hay items. Haz clic en "+" para agregar.</p>
            </div>

            <div *ngFor="let item of items.controls; let i = index" class="item-card">
              <div formGroupName="{{i}}" class="item-form">
                <mat-form-field>
                  <mat-label>Producto *</mat-label>
                  <mat-select formControlName="product_id">
                    <mat-option value="">-- Seleccionar --</mat-option>
                    <mat-option value="1">Producto 1</mat-option>
                    <mat-option value="2">Producto 2</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Cantidad *</mat-label>
                  <input matInput formControlName="quantity" type="number" min="1">
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Costo Unitario *</mat-label>
                  <input matInput formControlName="unit_cost" type="number" step="0.01" min="0">
                </mat-form-field>

                <button 
                  type="button" 
                  mat-icon-button 
                  color="warn" 
                  (click)="removeItem(i)"
                  [disabled]="loading || items.length === 1"
                  title="Eliminar este item">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

        </form>
      </mat-card-content>

      <!-- Actions -->
      <mat-card-footer>
        <div class="form-actions">
          <button 
            mat-stroked-button 
            (click)="onCancel()"
            [disabled]="loading"
            class="btn-secondary">
            Cancelar
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onSubmit()"
            [disabled]="loading || form.invalid"
            class="btn-primary">
            <mat-icon *ngIf="!loading">save</mat-icon>
            <mat-spinner *ngIf="loading" [diameter]="20" class="spinner"></mat-spinner>
            {{ loading ? 'Guardando...' : 'Guardar Compra' }}
          </button>
        </div>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [`
    .form-card {
      max-width: 800px;
      margin: 20px auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .form-container {
      padding: 20px 0;
    }

    .form-grid {
      display: grid;
      gap: 16px;
      padding: 0 20px 20px 20px;
    }

    .half-width {
      width: calc(50% - 8px);
    }

    .full-width {
      width: 100%;
    }

    .items-section {
      padding: 0 20px 20px 20px;
      border-top: 1px solid #e0e0e0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0 16px 0;
    }

    .section-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #999;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .item-card {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .item-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 12px;
      align-items: flex-start;
    }

    mat-form-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      background-color: #fafafa;
    }

    @media (max-width: 600px) {
      .half-width {
        width: 100%;
      }

      .item-form {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class PurchaseFormImprovedComponent implements OnDestroy {
  @Output() purchaseCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

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
      supplier_id: ['', [Validators.required]],
      warehouse_id: ['', [Validators.required]],
      notes: [''],
      items: this.fb.array(
        [this.createItemGroup()],
        [Validators.required, Validators.minLength(1)]
      )
    });
  }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      product_id: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_cost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

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

  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors) return '';
    return control.errors['required'] ? `${fieldName} es requerido` : 'Campo inválido';
  }

  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.confirmationService
      .confirmSave('esta compra')
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.submitForm();
        }
      });
  }

  private submitForm(): void {
    this.loading = true;

    const payload: PurchaseCreate = {
      supplier_id: parseInt(this.form.get('supplier_id')?.value),
      warehouse_id: parseInt(this.form.get('warehouse_id')?.value),
      notes: this.form.get('notes')?.value,
      items: this.items.value as PurchaseItemCreate[]
    };

    this.purchaseService.createPurchase(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.form.reset();

          this.snackBar.open('✓ Compra guardada exitosamente', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-success']
          });

          setTimeout(() => this.purchaseCreated.emit(), 300);
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(
            err.error?.detail || 'Error al guardar la compra',
            'Cerrar',
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
        }
      });
  }

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
