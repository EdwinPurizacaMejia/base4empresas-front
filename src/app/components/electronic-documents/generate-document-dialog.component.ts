import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRadioModule } from "@angular/material/radio";
import { MatDividerModule } from "@angular/material/divider";

export interface GenerateDocumentDialogData {
  /** Número de la venta para mostrar en el diálogo */
  saleNumber?: string;
}

export interface GenerateDocumentDialogResult {
  documentType: "invoice" | "credit_note" | "debit_note";
}

/**
 * Diálogo para seleccionar el tipo de comprobante electrónico a generar.
 *
 * Uso:
 *   const ref = this.dialog.open(GenerateDocumentDialogComponent, {
 *     data: { saleNumber: '001-00000001' },
 *     width: '420px'
 *   });
 *   ref.afterClosed().subscribe((result: GenerateDocumentDialogResult | undefined) => {
 *     if (result) { ... }
 *   });
 */
@Component({
  selector: "app-generate-document-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
  ],
  template: `
    <div class="gd-dialog">
      <!-- Header -->
      <div class="gd-header">
        <div class="gd-header__icon">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <div class="gd-header__text">
          <h2 mat-dialog-title class="gd-title">
            Generar Comprobante Electrónico
          </h2>
          <p class="gd-subtitle" *ngIf="data?.saleNumber">
            Venta: <strong>{{ data.saleNumber }}</strong>
          </p>
        </div>
      </div>

      <mat-divider />

      <!-- Content -->
      <mat-dialog-content class="gd-content">
        <p class="gd-description">
          Selecciona el tipo de comprobante electrónico que deseas generar:
        </p>

        <mat-radio-group
          [(ngModel)]="selectedType"
          class="gd-radio-group"
          aria-label="Tipo de comprobante"
        >
          <label class="gd-radio-card" [class.gd-radio-card--selected]="selectedType === 'invoice'">
            <mat-radio-button value="invoice" color="primary" />
            <div class="gd-radio-card__content">
              <div class="gd-radio-card__icon">🧾</div>
              <div class="gd-radio-card__info">
                <span class="gd-radio-card__title">Factura / Boleta</span>
                <span class="gd-radio-card__desc">
                  Boleta si el cliente usa DNI · Factura si usa RUC
                </span>
              </div>
            </div>
          </label>

          <label class="gd-radio-card" [class.gd-radio-card--selected]="selectedType === 'credit_note'">
            <mat-radio-button value="credit_note" color="primary" />
            <div class="gd-radio-card__content">
              <div class="gd-radio-card__icon">↩️</div>
              <div class="gd-radio-card__info">
                <span class="gd-radio-card__title">Nota de Crédito</span>
                <span class="gd-radio-card__desc">
                  Para devoluciones o descuentos sobre un comprobante emitido
                </span>
              </div>
            </div>
          </label>

          <label class="gd-radio-card" [class.gd-radio-card--selected]="selectedType === 'debit_note'">
            <mat-radio-button value="debit_note" color="primary" />
            <div class="gd-radio-card__content">
              <div class="gd-radio-card__icon">➕</div>
              <div class="gd-radio-card__info">
                <span class="gd-radio-card__title">Nota de Débito</span>
                <span class="gd-radio-card__desc">
                  Para cargos adicionales sobre un comprobante emitido
                </span>
              </div>
            </div>
          </label>
        </mat-radio-group>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions align="end" class="gd-actions">
        <button mat-stroked-button (click)="onCancel()" class="gd-btn-cancel">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!selectedType"
          (click)="onAccept()"
          class="gd-btn-accept"
        >
          <mat-icon>receipt_long</mat-icon>
          Generar Comprobante
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .gd-dialog {
        min-width: 380px;
        max-width: 460px;
      }

      /* Header */
      .gd-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem 0.75rem;
      }

      .gd-header__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        flex-shrink: 0;
      }

      .gd-header__icon mat-icon {
        color: white;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .gd-title {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        color: #0f172a !important;
        line-height: 1.3 !important;
      }

      .gd-subtitle {
        margin: 2px 0 0;
        font-size: 0.82rem;
        color: #64748b;
      }

      /* Content */
      .gd-content {
        padding: 1rem 1.5rem !important;
      }

      .gd-description {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        color: #475569;
      }

      /* Radio group */
      .gd-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .gd-radio-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
        background: #f8fafc;
      }

      .gd-radio-card:hover {
        border-color: #93c5fd;
        background: #eff6ff;
      }

      .gd-radio-card--selected {
        border-color: #3b82f6;
        background: #eff6ff;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
      }

      .gd-radio-card__content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
      }

      .gd-radio-card__icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .gd-radio-card__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .gd-radio-card__title {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1e293b;
      }

      .gd-radio-card__desc {
        font-size: 0.78rem;
        color: #64748b;
        line-height: 1.3;
      }

      /* Actions */
      .gd-actions {
        padding: 0.75rem 1.5rem 1.25rem !important;
        gap: 0.75rem;
      }

      .gd-btn-cancel {
        color: #64748b !important;
      }

      .gd-btn-accept {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
        font-weight: 600 !important;
      }
    `,
  ],
})
export class GenerateDocumentDialogComponent {
  selectedType: "invoice" | "credit_note" | "debit_note" = "invoice";

  constructor(
    public dialogRef: MatDialogRef<
      GenerateDocumentDialogComponent,
      GenerateDocumentDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) public data: GenerateDocumentDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  onAccept(): void {
    this.dialogRef.close({ documentType: this.selectedType });
  }
}
