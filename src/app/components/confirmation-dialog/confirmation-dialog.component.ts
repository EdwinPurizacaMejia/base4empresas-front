import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  severity: 'info' | 'warning' | 'error';
}

/**
 * ConfirmationDialogComponent — Diálogo de confirmación reutilizable
 *
 * Fase 4: inline styles migrados a confirmation-dialog.component.scss
 * - Colores hardcoded reemplazados por variables del sistema
 * - Diseño mejorado con iconos por severidad
 * - Accesibilidad: aria-label en botones
 *
 * Uso:
 * ```typescript
 * const ref = this.dialog.open(ConfirmationDialogComponent, {
 *   width: '400px',
 *   panelClass: 'crm-dialog-panel',
 *   backdropClass: 'crm-dialog-backdrop',
 *   data: {
 *     title: '¿Eliminar registro?',
 *     message: 'Esta acción no se puede deshacer.',
 *     confirmText: 'Eliminar',
 *     cancelText: 'Cancelar',
 *     severity: 'error'
 *   }
 * });
 * ref.afterClosed().subscribe((confirmed: boolean) => { ... });
 * ```
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  styleUrls: ['./confirmation-dialog.component.scss'],
  template: `
    <div class="confirmation-dialog" [ngClass]="'severity-' + data.severity">

      <!-- Icono de severidad -->
      <div class="dialog-icon">
        <mat-icon>
          {{ getSeverityIcon() }}
        </mat-icon>
      </div>

      <!-- Título -->
      <h2 mat-dialog-title class="dialog-title-confirm">{{ data.title }}</h2>

      <!-- Mensaje -->
      <div mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
      </div>

      <!-- Acciones -->
      <div mat-dialog-actions class="dialog-confirm-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="btn-cancel"
          [attr.aria-label]="data.cancelText">
          {{ data.cancelText }}
        </button>
        <button
          mat-raised-button
          (click)="onConfirm()"
          [ngClass]="'btn-' + data.severity"
          class="btn-confirm"
          [attr.aria-label]="data.confirmText">
          {{ data.confirmText }}
        </button>
      </div>

    </div>
  `,
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  getSeverityIcon(): string {
    switch (this.data.severity) {
      case 'info':    return 'info';
      case 'warning': return 'warning';
      case 'error':   return 'error';
      default:        return 'help';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
