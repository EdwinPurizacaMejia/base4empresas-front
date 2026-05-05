import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state-container">
      <mat-icon class="empty-state-icon" [class]="iconClass">{{ icon }}</mat-icon>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-description">{{ description }}</p>
      <button
        *ngIf="showAction"
        mat-raised-button
        color="primary"
        class="empty-state-action"
        (click)="onAction()"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        gap: 1rem;
        min-height: 300px;
        text-align: center;
      }

      .empty-state-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--color-text-tertiary, #999);
        margin-bottom: 0.5rem;
      }

      .empty-state-icon.large {
        font-size: 96px;
        width: 96px;
        height: 96px;
      }

      .empty-state-title {
        margin: 0.5rem 0 0 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary, #333);
      }

      .empty-state-description {
        margin: 0.5rem 0 1rem 0;
        font-size: 0.95rem;
        color: var(--color-text-secondary, #666);
        max-width: 400px;
      }

      .empty-state-action {
        margin-top: 1rem;
      }

      @media (max-width: 768px) {
        .empty-state-container {
          padding: 2rem 1rem;
          min-height: 250px;
        }

        .empty-state-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }

        .empty-state-title {
          font-size: 1.1rem;
        }

        .empty-state-description {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() iconClass: string = '';
  @Input() title: string = 'Sin datos';
  @Input() description: string = 'No hay información disponible en este momento.';
  @Input() showAction: boolean = false;
  @Input() actionLabel: string = 'Crear nuevo';

  onAction(): void {
    // Esta función será sobrescrita por emit de event si es necesario
  }
}
