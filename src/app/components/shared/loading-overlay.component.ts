import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading" [@fadeInOut]>
      <div class="loading-overlay-content">
        <mat-spinner
          [diameter]="diameter"
          [strokeWidth]="strokeWidth"
        ></mat-spinner>
        <p class="loading-overlay-text" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .loading-overlay-content {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      .loading-overlay-text {
        margin: 0;
        font-size: 0.95rem;
        color: var(--color-text-secondary, #666);
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .loading-overlay-content {
          padding: 1.5rem;
          gap: 0.75rem;
        }

        .loading-overlay-text {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Procesando...';
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 3;
}
