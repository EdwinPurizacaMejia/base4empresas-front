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
 * Fix Causa 2+3: template migrado al patrón visual del sistema + inline styles eliminados
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
    LoadingSpinnerComponent,
  ],
  template: `
    <!-- Patrón page-header consistente con el sistema de diseño -->
    <div class="list-page">

      <div class="page-header">
        <div class="page-header__title-group">
          <h1 class="page-header__title">Unidades de Medida</h1>
          <p class="page-header__subtitle">Unidades para cuantificar productos (kg, unidad, litro, etc.)</p>
        </div>
        <div class="page-header__actions">
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
      </div>

      <!-- Tabla -->
      <div class="list-table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando unidades..."></app-loading-spinner>

        <ng-container *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="units.length === 0">
            <mat-icon class="empty-state__icon">straighten</mat-icon>
            <h3 class="empty-state__title">Sin unidades</h3>
            <p class="empty-state__message">No hay unidades de medida registradas en el sistema</p>
          </div>

          <!-- Tabla de unidades -->
          <table
            mat-table
            [dataSource]="units"
            class="list-table"
            *ngIf="units.length > 0"
          >
            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>NOMBRE</th>
              <td mat-cell *matCellDef="let unit">
                <span class="item-name">
                  <mat-icon class="item-icon unit-icon">straighten</mat-icon>
                  {{ unit.name }}
                </span>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>ACCIONES</th>
              <td mat-cell *matCellDef="let unit">
                <div class="row-actions">
                  <button
                    mat-icon-button
                    class="action-btn edit"
                    matTooltip="Editar unidad"
                    disabled
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    class="action-btn delete"
                    matTooltip="Eliminar unidad"
                    disabled
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="data-row"></tr>
          </table>
        </ng-container>

        <!-- Estadísticas pie de tabla -->
        <div class="table-footer" *ngIf="!loading && units.length > 0">
          <mat-icon class="footer-icon">straighten</mat-icon>
          <strong>{{ units.length }}</strong>&nbsp;unidades de medida disponibles
        </div>
      </div>

    </div>
  `,
  // Fix Causa 3: eliminado bloque `styles: [...]` — solo styleUrls externo
  styleUrls: ['./units-list.component.scss'],
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
        },
      });
  }
}
