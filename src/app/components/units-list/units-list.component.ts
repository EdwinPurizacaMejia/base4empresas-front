import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UnitsService, UnitDto } from '../../services/units.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

/**
 * Componente para listar unidades de medida
 * Muestra todas las unidades disponibles en el sistema (kg, unidad, litro, etc.)
 */
@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>⚖️ Unidades de Medida</h1>
        <button 
          mat-raised-button 
          color="primary"
          matTooltip="Próximamente: Crear nueva unidad"
          disabled
        >
          <mat-icon>add</mat-icon>
          Nueva Unidad
        </button>
      </div>

      <mat-card class="table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando unidades..."></app-loading-spinner>

        <div class="table-container" *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="units.length === 0">
            <mat-icon>straighten</mat-icon>
            <p>No hay unidades de medida registradas</p>
            <p class="empty-subtitle">Define las unidades para medir tus productos (kg, unidad, litro, etc.)</p>
          </div>

          <!-- Tabla de unidades -->
          <table mat-table [dataSource]="units" class="units-table" *ngIf="units.length > 0">
            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let unit">{{ unit.id }}</td>
            </ng-container>

            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let unit" class="unit-name">
                <mat-icon class="unit-icon">straighten</mat-icon>
                {{ unit.name }}
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let unit">
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
                  color="warn"
                  matTooltip="Eliminar"
                  disabled
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="unit-row"></tr>
          </table>
        </div>

        <!-- Estadísticas -->
        <div class="stats" *ngIf="!loading && units.length > 0">
          <span class="stat-item">
            <mat-icon>straighten</mat-icon>
            <strong>{{ units.length }}</strong> unidades de medida disponibles
          </span>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1200px;
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

    .units-table {
      width: 100%;
    }

    .units-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #424242;
    }

    .unit-row {
      transition: background-color 0.2s;
    }

    .unit-row:hover {
      background-color: #f5f5f5;
    }

    .unit-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .unit-icon {
      color: #388e3c;
      font-size: 20px;
      width: 20px;
      height: 20px;
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
      color: #388e3c;
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
export class UnitsListComponent implements OnInit, OnDestroy {
  units: UnitDto[] = [];
  loading = false;

  displayedColumns = ['name', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private unitsService: UnitsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUnits(): void {
    this.loading = true;

    this.unitsService
      .listUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units) => {
          this.units = units || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading units:', err);
          this.notificationService.error('Error al cargar las unidades');
          this.loading = false;
          this.units = [];
        }
      });
  }
}
