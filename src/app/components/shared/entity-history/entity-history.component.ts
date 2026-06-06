import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AuditLog, AuditableEntityType, getAuditActionLabel, getAuditSeverityColor } from '../../../models/audit-log.model';
import { AuditService } from '../../../services/audit.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../loading-spinner.component';

/**
 * Componente reutilizable de Historial de Entidad - FASE 5
 * 
 * Muestra un historial de auditoría para cualquier entidad (Order, Payment, Shipment, etc.)
 * Se usa como pestaña o sección dentro de componentes de detalle.
 * 
 * Uso:
 * ```html
 * <app-entity-history
 *   [entityType]="'ORDER'"
 *   [entityId]="order.id"
 * ></app-entity-history>
 * ```
 */
@Component({
  selector: 'app-entity-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="entity-history-container">
      <!-- Loading State -->
      <app-loading-spinner
        *ngIf="loading"
        message="Cargando historial..."
      ></app-loading-spinner>

      <!-- Empty State -->
      <div *ngIf="!loading && logs.length === 0" class="empty-state">
        <mat-icon>history</mat-icon>
        <p>Sin historial para esta entidad</p>
      </div>

      <!-- History Table -->
      <div *ngIf="!loading && logs.length > 0" class="history-table-wrapper">
        <table mat-table [dataSource]="logs" class="history-table">
          <!-- Timestamp Column -->
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Fecha/Hora</th>
            <td mat-cell *matCellDef="let log">
              {{ log.created_at | date: 'short' }}
            </td>
          </ng-container>

          <!-- Action Column -->
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Acción</th>
            <td mat-cell *matCellDef="let log">
              <span class="action-badge" [style.background]="getActionColor(log.action)">
                {{ getActionLabel(log.action) }}
              </span>
            </td>
          </ng-container>

          <!-- Actor Column -->
          <ng-container matColumnDef="actor">
            <th mat-header-cell *matHeaderCellDef>Usuario/Actor</th>
            <td mat-cell *matCellDef="let log">
              {{ log.actor_name || log.actor_id || log.actor_type }}
            </td>
          </ng-container>

          <!-- Severity Column -->
          <ng-container matColumnDef="severity">
            <th mat-header-cell *matHeaderCellDef>Severidad</th>
            <td mat-cell *matCellDef="let log">
              <mat-icon
                [style.color]="getSeverityColor(log.severity)"
                [matTooltip]="log.severity"
                class="severity-icon"
              >
                {{ getSeverityIcon(log.severity) }}
              </mat-icon>
            </td>
          </ng-container>

          <!-- Details Column -->
          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Detalles</th>
            <td mat-cell *matCellDef="let log">
              <button
                mat-icon-button
                [matTooltip]="getMetadataTooltip(log.metadata)"
                class="info-button"
              >
                <mat-icon>info</mat-icon>
              </button>
            </td>
          </ng-container>

          <!-- Table Header/Rows -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="history-row"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .entity-history-container {
      padding: 16px 0;
      width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .history-table-wrapper {
      overflow-x: auto;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
    }

    .history-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }

    .history-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .history-row:hover {
      background-color: #fafafa;
    }

    .action-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .info-button {
      color: #2196f3;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .history-table {
        font-size: 12px;
      }

      .history-table td,
      .history-table th {
        padding: 8px;
      }

      .action-badge {
        padding: 2px 8px;
        font-size: 10px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityHistoryComponent implements OnInit, OnDestroy {
  @Input() entityType!: AuditableEntityType;
  @Input() entityId!: string;

  logs: AuditLog[] = [];
  loading = false;
  displayedColumns: string[] = ['timestamp', 'action', 'actor', 'severity', 'details'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar historial de auditoría para la entidad
   */
  private loadHistory(): void {
    if (!this.entityType || !this.entityId) {
      this.notificationService.warning('Tipo de entidad o ID no especificado');
      return;
    }

    this.loading = true;
    this.auditService
      .getLogsByEntity(this.entityType, this.entityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.logs = logs;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading history:', err);
          this.notificationService.error('Error al cargar el historial');
          this.loading = false;
        }
      });
  }

  /**
   * Obtener label de acción
   */
  getActionLabel(action: string): string {
    return getAuditActionLabel(action as any);
  }

  /**
   * Obtener color de acción (dinámico según tipo)
   */
  getActionColor(action: string): string {
    const colors: Record<string, string> = {
      'CREATED': '#4caf50',
      'UPDATED': '#2196f3',
      'DELETED': '#f44336',
      'STATUS_CHANGED': '#ff9800',
      'VALIDATED': '#8bc34a',
      'REJECTED': '#e91e63',
      'CANCELLED': '#9c27b0',
      'APPROVED': '#00bcd4',
      'EXPORTED': '#673ab7',
      'IMPORTED': '#ffeb3b',
      'LOCKED': '#795548',
      'UNLOCKED': '#00897b',
    };
    return colors[action] || '#999';
  }

  /**
   * Obtener color de severidad
   */
  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#9c27b0',
    };
    return colors[severity] || '#999';
  }

  /**
   * Obtener icono de severidad
   */
  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'priority_high',
    };
    return icons[severity] || 'info';
  }

  /**
   * Obtener tooltip de metadatos
   */
  getMetadataTooltip(metadata: any): string {
    if (!metadata) return 'Sin detalles adicionales';

    const details: string[] = [];

    if (metadata.old_value !== undefined) {
      details.push(`Anterior: ${this.formatValue(metadata.old_value)}`);
    }
    if (metadata.new_value !== undefined) {
      details.push(`Nuevo: ${this.formatValue(metadata.new_value)}`);
    }
    if (metadata.amount) {
      details.push(`Monto: ${metadata.amount} ${metadata.currency || 'PEN'}`);
    }
    if (metadata.reason) {
      details.push(`Razón: ${metadata.reason}`);
    }
    if (metadata.notes) {
      details.push(`Notas: ${metadata.notes}`);
    }

    return details.length ? details.join('\n') : 'Sin detalles adicionales';
  }

  /**
   * Formatear valor para display
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return '(vacío)';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
