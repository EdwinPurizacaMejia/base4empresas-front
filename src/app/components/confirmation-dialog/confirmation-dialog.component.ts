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

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog" [ngClass]="'severity-' + data.severity">
      <!-- Icon -->
      <div class="dialog-icon">
        <mat-icon [ngSwitch]="data.severity">
          <span *ngSwitchCase="'info'">info</span>
          <span *ngSwitchCase="'warning'">warning</span>
          <span *ngSwitchCase="'error'">error</span>
        </mat-icon>
      </div>

      <!-- Title -->
      <h2 mat-dialog-title>{{ data.title }}</h2>

      <!-- Message -->
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>

      <!-- Actions -->
      <div mat-dialog-actions align="end">
        <button 
          mat-button 
          (click)="onCancel()"
          class="btn-cancel">
          {{ data.cancelText }}
        </button>
        <button 
          mat-raised-button 
          (click)="onConfirm()"
          [ngClass]="'btn-' + data.severity"
          class="btn-confirm">
          {{ data.confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      text-align: center;
      padding: 8px 0;
    }

    .dialog-icon {
      margin: 16px 0 8px 0;
    }

    .dialog-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .severity-info .dialog-icon mat-icon {
      color: #1976d2;
    }

    .severity-warning .dialog-icon mat-icon {
      color: #ff9800;
    }

    .severity-error .dialog-icon mat-icon {
      color: #f44336;
    }

    h2 {
      margin: 16px 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    [mat-dialog-actions] {
      padding: 16px 0 0 0;
      gap: 8px;
    }

    .btn-cancel {
      color: #666;
    }

    .btn-confirm {
      color: white;
    }

    .btn-info {
      background-color: #1976d2;
    }

    .btn-warning {
      background-color: #ff9800;
    }

    .btn-error {
      background-color: #f44336;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
