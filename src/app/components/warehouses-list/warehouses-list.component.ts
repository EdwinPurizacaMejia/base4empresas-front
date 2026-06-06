import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

/**
 * Componente para listar almacenes
 * Muestra todos los almacenes disponibles en el sistema
 */
@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>🏢 Almacenes</h1>
        <button 
          mat-raised-button 
          color="primary"
          matTooltip="Próximamente: Crear nuevo almacén"
          disabled
        >
          <mat-icon>add</mat-icon>
          Nuevo Almacén
        </button>
      </div>

      <mat-card class="table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando almacenes..."></app-loading-spinner>

        <div class="table-container" *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="warehouses.length === 0">
            <mat-icon>warehouse</mat-icon>
            <p>No hay almacenes registrados</p>
            <p class="empty-subtitle">Los almacenes permiten organizar tu inventario por ubicación</p>
          </div>

          <!-- Tabla de almacenes -->
          <table mat-table [dataSource]="warehouses" class="warehouses-table" *ngIf="warehouses.length > 0">
            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let warehouse" class="warehouse-name">
                <mat-icon class="warehouse-icon">warehouse</mat-icon>
                {{ warehouse.name }}
              </td>
            </ng-container>

            <!-- Dirección -->
            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Dirección</th>
              <td mat-cell *matCellDef="let warehouse">
                <span *ngIf="warehouse.address">{{ warehouse.address }}</span>
                <span *ngIf="!warehouse.address" class="no-data">—</span>
              </td>
            </ng-container>

            <!-- Estado -->
            <ng-container matColumnDef="is_active">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let warehouse">
                <mat-chip 
                  [class.active-chip]="warehouse.is_active"
                  [class.inactive-chip]="!warehouse.is_active"
                  selected
                >
                  {{ warehouse.is_active ? 'Activo' : 'Inactivo' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let warehouse">
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar"
                  disabled
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="accent"
                  matTooltip="Ver inventario"
                  disabled
                >
                  <mat-icon>inventory</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="warehouse-row"></tr>
          </table>
        </div>

        <!-- Estadísticas -->
        <div class="stats" *ngIf="!loading && warehouses.length > 0">
          <span class="stat-item">
            <mat-icon>warehouse</mat-icon>
            <strong>{{ warehouses.length }}</strong> almacenes totales
          </span>
          <span class="stat-item" *ngIf="getActiveCount() > 0">
            <mat-icon>check_circle</mat-icon>
            <strong>{{ getActiveCount() }}</strong> activos
          </span>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #1a237e;
    }

    .table-card {
      padding: 0;
    }

    .table-container {
      overflow-x: auto;
    }

    .warehouses-table {
      width: 100%;
    }

    .warehouses-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #424242;
    }

    .warehouse-row {
      transition: background-color 0.2s;
    }

    .warehouse-row:hover {
      background-color: #f5f5f5;
    }

    .warehouse-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .warehouse-icon {
      color: #ff6f00;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    .active-chip {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .inactive-chip {
      background-color: #757575 !important;
      color: white !important;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #bdbdbd;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 18px;
      color: #424242;
      margin: 8px 0;
    }

    .empty-subtitle {
      font-size: 14px !important;
      color: #999 !important;
    }

    .stats {
      padding: 16px 24px;
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .stat-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ff6f00;
    }

    .stat-item:last-child mat-icon {
      color: #4caf50;
    }

    .stat-item strong {
      color: #1a237e;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class WarehousesListComponent implements OnInit, OnDestroy {
  warehouses: Warehouse[] = [];
  loading = false;

  displayedColumns = ['name', 'address', 'is_active', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private warehouseService: WarehouseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWarehouses(): void {
    this.loading = true;

    this.warehouseService
      .getWarehouses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (warehouses) => {
          this.warehouses = warehouses || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading warehouses:', err);
          this.notificationService.error('Error al cargar los almacenes');
          this.loading = false;
          this.warehouses = [];
        }
      });
  }

  getActiveCount(): number {
    return this.warehouses.filter(w => w.is_active).length;
  }
}
