import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="error-state-container">
      <mat-icon class="error-state-icon">{{ icon }}</mat-icon>
      <h3 class="error-state-title">{{ title }}</h3>
      <p class="error-state-message">{{ message }}</p>
      <p class="error-state-details" *ngIf="details">{{ details }}</p>
      <div class="error-state-actions">
        <button mat-raised-button color="primary" (click)="onRetry.emit()">
          {{ retryLabel }}
        </button>
        <button mat-stroked-button color="accent" (click)="onGoBack.emit()">
          {{ backLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .error-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        gap: 1rem;
        min-height: 300px;
        text-align: center;
        background-color: var(--color-error-light, #ffebee);
        border-radius: 8px;
        border: 1px solid var(--color-error-border, #ffcdd2);
      }

      .error-state-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--color-error, #d32f2f);
        margin-bottom: 0.5rem;
      }

      .error-state-title {
        margin: 0.5rem 0 0 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-error, #d32f2f);
      }

      .error-state-message {
        margin: 0.5rem 0 0 0;
        font-size: 0.95rem;
        color: var(--color-text-secondary, #666);
        max-width: 450px;
      }

      .error-state-details {
        margin: 0.5rem 0 1rem 0;
        font-size: 0.85rem;
        color: var(--color-text-tertiary, #999);
        background-color: rgba(0, 0, 0, 0.02);
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-family: monospace;
        max-width: 450px;
        word-break: break-word;
      }

      .error-state-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .error-state-container {
          padding: 2rem 1rem;
          min-height: 250px;
        }

        .error-state-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }

        .error-state-title {
          font-size: 1.1rem;
        }

        .error-state-message {
          font-size: 0.9rem;
        }

        .error-state-actions {
          flex-direction: column;
          gap: 0.5rem;
        }

        button {
          width: 100%;
        }
      }
    `,
  ],
})
export class ErrorStateComponent {
  @Input() icon: string = 'error_outline';
  @Input() title: string = 'Error al cargar datos';
  @Input() message: string = 'Ocurrió un problema al cargar la información.';
  @Input() details: string = '';
  @Input() retryLabel: string = 'Reintentar';
  @Input() backLabel: string = 'Volver atrás';

  @Output() onRetry = new EventEmitter<void>();
  @Output() onGoBack = new EventEmitter<void>();
}
