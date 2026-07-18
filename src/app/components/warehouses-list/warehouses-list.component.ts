import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

/**
 * Componente para listar almacenes
 * Fix Causa 2+3: template migrado al patrón visual del sistema + inline styles eliminados
 * + MatPaginator reemplaza el pie de tabla de estadísticas
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
    MatPaginatorModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="list-page">

      <div class="page-header">
        <div class="page-header__title-group">
          <h1 class="page-header__title">Almacenes</h1>
          <p class="page-header__subtitle">Gestión de almacenes y ubicaciones de inventario</p>
        </div>
        <div class="page-header__actions">
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
      </div>

      <div class="list-table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando almacenes..."></app-loading-spinner>

        <ng-container *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="dataSource.data.length === 0">
            <mat-icon class="empty-state__icon">warehouse</mat-icon>
            <h3 class="empty-state__title">Sin almacenes</h3>
            <p class="empty-state__message">No hay almacenes registrados en el sistema</p>
          </div>

          <!-- Tabla de almacenes -->
          <table
            mat-table
            [dataSource]="dataSource"
            class="list-table"
            *ngIf="dataSource.data.length > 0"
          >
            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>NOMBRE</th>
              <td mat-cell *matCellDef="let warehouse">
                <span class="item-name">
                  {{ warehouse.name }}
                </span>
              </td>
            </ng-container>

            <!-- Dirección -->
            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>DIRECCIÓN</th>
              <td mat-cell *matCellDef="let warehouse">
                <span *ngIf="warehouse.address">{{ warehouse.address }}</span>
                <span *ngIf="!warehouse.address" class="no-data">—</span>
              </td>
            </ng-container>

            <!-- Estado -->
            <ng-container matColumnDef="is_active">
              <th mat-header-cell *matHeaderCellDef>ESTADO</th>
              <td mat-cell *matCellDef="let warehouse">
                <span class="status-badge" [class.active]="warehouse.is_active" [class.inactive]="!warehouse.is_active">
                  {{ warehouse.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>ACCIONES</th>
              <td mat-cell *matCellDef="let warehouse">
                <div class="row-actions">
                  <button
                    mat-icon-button
                    class="action-btn edit"
                    matTooltip="Editar almacén"
                    disabled
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    class="action-btn"
                    matTooltip="Ver inventario"
                    disabled
                  >
                    <mat-icon>inventory</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="data-row"></tr>
          </table>

          <!-- Paginador -->
          <mat-paginator
            *ngIf="dataSource.data.length > 0"
            [pageSizeOptions]="[5, 10, 25]"
            [pageSize]="10"
            showFirstLastButtons
            aria-label="Seleccionar página de almacenes"
          ></mat-paginator>
        </ng-container>
      </div>

    </div>
  `,
  // Fix Causa 3: eliminado bloque `styles: [...]` — solo styleUrls externo
  styleUrls: ['./warehouses-list.component.scss'],
})
export class WarehousesListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<Warehouse>();
  loading = false;

  displayedColumns = ['name', 'address', 'is_active', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  constructor(
    private warehouseService: WarehouseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
          this.dataSource.data = warehouses || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading warehouses:', err);
          this.notificationService.error('Error al cargar los almacenes');
          this.loading = false;
          this.dataSource.data = [];
        },
      });
  }
}
