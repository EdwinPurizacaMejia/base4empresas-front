import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { LoadingOverlayComponent } from '../shared/loading-overlay.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

interface DemoItem {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-notifications-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    LoadingSpinnerComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="demo-container">
      <h1>Demo: Notificaciones y Estados</h1>
      <p class="subtitle">
        Ejemplos interactivos de los nuevos componentes de UX
      </p>

      <!-- Overlay de carga (operación crítica) -->
      <app-loading-overlay
        [isLoading]="isProcessing"
        message="Procesando operación..."
      ></app-loading-overlay>

      <!-- Sección de notificaciones -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>Notificaciones (Toast)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Prueba los diferentes tipos de notificaciones</p>
          <div class="button-group">
            <button mat-raised-button color="primary" (click)="showSuccess()">
              <mat-icon>check_circle</mat-icon>
              Éxito
            </button>
            <button mat-raised-button color="warn" (click)="showError()">
              <mat-icon>error</mat-icon>
              Error
            </button>
            <button mat-raised-button color="accent" (click)="showWarning()">
              <mat-icon>warning</mat-icon>
              Advertencia
            </button>
            <button mat-raised-button (click)="showInfo()">
              <mat-icon>info</mat-icon>
              Información
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Sección de estado de carga -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>Estados de Carga</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Simula operaciones async con feedback visual</p>

          <!-- Loading Spinner -->
          <h4>Spinner Inline</h4>
          <div class="state-demo">
            <div *ngIf="showLoadingSpinner; else noSpinner">
              <app-loading-spinner
                message="Cargando elementos..."
              ></app-loading-spinner>
            </div>
            <ng-template #noSpinner>
              <button
                mat-raised-button
                color="primary"
                (click)="simulateLoadingSpinner()"
              >
                Simular Carga (3s)
              </button>
            </ng-template>
          </div>

          <mat-divider class="spacer"></mat-divider>

          <!-- Loading Overlay -->
          <h4>Overlay de Carga (Operación Crítica)</h4>
          <button mat-raised-button color="primary" (click)="simulateOverlay()">
            Simular Operación Crítica (2s)
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Sección de estados vacíos y errores -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>Estados Visuales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Diferentes estados de presentación de datos</p>

          <!-- Demo Empty State -->
          <h4>Empty State</h4>
          <div class="state-demo">
            <app-empty-state
              *ngIf="showEmptyState"
              icon="inbox"
              title="Sin elementos"
              description="Crea tu primer elemento para comenzar."
              [showAction]="true"
              actionLabel="Crear primero"
              (onAction)="handleEmptyStateAction()"
            ></app-empty-state>
            <button
              *ngIf="!showEmptyState"
              mat-raised-button
              color="primary"
              (click)="toggleEmptyState()"
            >
              Mostrar Empty State
            </button>
          </div>

          <mat-divider class="spacer"></mat-divider>

          <!-- Demo Error State -->
          <h4>Error State</h4>
          <div class="state-demo">
            <app-error-state
              *ngIf="showErrorState"
              icon="error_outline"
              title="Error al cargar"
              message="No se pudieron cargar los datos del servidor."
              details="Error 503: Servicio temporalmente no disponible"
              (onRetry)="handleErrorRetry()"
              (onGoBack)="toggleErrorState()"
            ></app-error-state>
            <button
              *ngIf="!showErrorState"
              mat-raised-button
              color="warn"
              (click)="toggleErrorState()"
            >
              Mostrar Error State
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Sección de patrones completos -->
      <mat-card class="demo-section">
        <mat-card-header>
          <mat-card-title>Patrón Completo (CRUD)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Ejemplo simulando un flujo completo de datos</p>

          <!-- Loading -->
          <app-loading-spinner
            *ngIf="patternLoading && items.length === 0"
            message="Cargando elementos..."
          ></app-loading-spinner>

          <!-- Error -->
          <app-error-state
            *ngIf="patternError && !patternLoading"
            title="Error al cargar"
            [message]="patternError"
            (onRetry)="loadPatternItems()"
            (onGoBack)="patternError = null"
          ></app-error-state>

          <!-- Empty -->
          <app-empty-state
            *ngIf="!patternLoading && !patternError && items.length === 0"
            icon="inventory_2"
            title="Sin elementos"
            description="No hay elementos. Crea uno para comenzar."
            [showAction]="true"
            actionLabel="Crear elemento"
            (onAction)="createItem()"
          ></app-empty-state>

          <!-- Data -->
          <div *ngIf="!patternError && items.length > 0">
            <div class="items-list">
              <div
                *ngFor="let item of items"
                class="item-card"
              >
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="createItem()">
                Crear elemento
              </button>
              <button mat-raised-button color="warn" (click)="simulateError()">
                Simular error
              </button>
              <button
                mat-raised-button
                color="accent"
                (click)="clearItems()"
              >
                Limpiar
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Información -->
      <mat-card class="demo-section info-card">
        <mat-card-header>
          <mat-card-title>ℹ️ Información</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>
            Esta es una demo interactiva de los nuevos componentes de UX.
            Consulta
            <code>GUIA_NOTIFICACIONES_ESTADOS.md</code>
            para aprender cómo integrar estas mejoras en otros componentes.
          </p>
          <p>
            <strong>Componentes disponibles:</strong>
          </p>
          <ul>
            <li><code>NotificationService</code> - Toast notifications</li>
            <li><code>LoadingSpinnerComponent</code> - Spinner de carga</li>
            <li><code>LoadingOverlayComponent</code> - Overlay de carga</li>
            <li><code>EmptyStateComponent</code> - Estado sin datos</li>
            <li><code>ErrorStateComponent</code> - Gestión de errores</li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }

      h1 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: var(--text-secondary);
        margin-bottom: 2rem;
      }

      .demo-section {
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .demo-section mat-card-header {
        margin-bottom: 1rem;
      }

      .demo-section mat-card-title {
        color: var(--primary-color);
        font-weight: 600;
      }

      .button-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      .button-group button {
        flex: 1;
        min-width: 120px;
      }

      .state-demo {
        border: 1px solid var(--border-light);
        border-radius: 4px;
        padding: 1.5rem;
        background-color: var(--secondary-color);
        margin: 1rem 0;
      }

      h4 {
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
      }

      .spacer {
        margin: 2rem 0 !important;
      }

      .items-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }

      .item-card {
        background-color: var(--secondary-color);
        padding: 1rem;
        border-radius: 4px;
        border-left: 4px solid var(--primary-color);
      }

      .item-card h4 {
        margin: 0 0 0.5rem 0;
        color: var(--primary-color);
      }

      .item-card p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }

      .action-buttons button {
        flex: 1;
        min-width: 140px;
      }

      .info-card {
        background-color: var(--info-color);
        color: white;
      }

      .info-card mat-card-title {
        color: white;
      }

      .info-card p,
      .info-card li {
        color: rgba(255, 255, 255, 0.95);
      }

      .info-card code {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-family: monospace;
      }

      @media (max-width: 768px) {
        .demo-container {
          padding: 1rem;
        }

        .button-group {
          flex-direction: column;
        }

        .button-group button {
          width: 100%;
        }

        .items-list {
          grid-template-columns: 1fr;
        }

        .action-buttons {
          flex-direction: column;
        }

        .action-buttons button {
          width: 100%;
        }
      }
    `,
  ],
})
export class NotificationsDemoComponent implements OnInit {
  // Loader states
  showLoadingSpinner = false;
  isProcessing = false;

  // State toggles
  showEmptyState = false;
  showErrorState = false;

  // Pattern demo
  patternLoading = false;
  patternError: string | null = null;
  items: DemoItem[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {}

  // Notification methods
  showSuccess(): void {
    this.notificationService.success('¡Operación completada exitosamente!');
  }

  showError(): void {
    this.notificationService.error('Ocurrió un error inesperado. Intenta nuevamente.');
  }

  showWarning(): void {
    this.notificationService.warning('Esta es una advertencia importante.');
  }

  showInfo(): void {
    this.notificationService.info('Información relevante para ti.');
  }

  // Loading simulator
  simulateLoadingSpinner(): void {
    this.showLoadingSpinner = true;
    setTimeout(() => {
      this.showLoadingSpinner = false;
      this.notificationService.success('Carga completada');
    }, 3000);
  }

  simulateOverlay(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.notificationService.success('Operación completada');
    }, 2000);
  }

  // State toggles
  toggleEmptyState(): void {
    this.showEmptyState = !this.showEmptyState;
  }

  toggleErrorState(): void {
    this.showErrorState = !this.showErrorState;
  }

  handleEmptyStateAction(): void {
    this.showEmptyState = false;
    this.notificationService.success('Elemento creado');
  }

  handleErrorRetry(): void {
    this.notificationService.info('Reintentando...');
    setTimeout(() => {
      this.showErrorState = false;
      this.notificationService.success('Datos cargados correctamente');
    }, 1500);
  }

  // Pattern demo
  loadPatternItems(): void {
    this.patternLoading = true;
    this.patternError = null;

    setTimeout(() => {
      this.items = [
        {
          id: '1',
          name: 'Elemento 1',
          description: 'Descripción del primer elemento',
        },
        {
          id: '2',
          name: 'Elemento 2',
          description: 'Descripción del segundo elemento',
        },
        {
          id: '3',
          name: 'Elemento 3',
          description: 'Descripción del tercer elemento',
        },
      ];
      this.patternLoading = false;
    }, 1500);
  }

  createItem(): void {
    const newItem: DemoItem = {
      id: Date.now().toString(),
      name: `Elemento ${this.items.length + 1}`,
      description: 'Nuevo elemento creado',
    };
    this.items = [...this.items, newItem];
    this.notificationService.success('Elemento creado correctamente');
  }

  simulateError(): void {
    this.patternError = 'No se pudieron cargar los datos. Intenta nuevamente.';
  }

  clearItems(): void {
    if (confirm('¿Estás seguro de que deseas limpiar todos los elementos?')) {
      this.items = [];
      this.notificationService.warning('Todos los elementos han sido eliminados');
    }
  }
}
