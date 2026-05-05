import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter" [strokeWidth]="strokeWidth"></mat-spinner>
      <p class="loading-text" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        gap: 1.5rem;
        min-height: 200px;
      }

      .loading-text {
        margin: 0;
        font-size: 0.95rem;
        color: var(--color-text-secondary, #666);
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .loading-container {
          padding: 2rem 1rem;
          min-height: 150px;
        }

        .loading-text {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Cargando...';
  @Input() diameter: number = 50;
  @Input() strokeWidth: number = 4;
}
