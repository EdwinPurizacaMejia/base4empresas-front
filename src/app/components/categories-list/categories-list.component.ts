import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

import { CategoriesService, CategoryDto } from '../../services/categories.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

/**
 * Componente para listar categorías de productos
 * Fix Causa 2+3: template migrado al patrón visual del sistema + inline styles eliminados
 * + MatPaginator reemplaza el pie de tabla de estadísticas
 */
@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatTooltipModule,
    MatPaginatorModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="list-page">

      <div class="page-header">
        <div class="page-header__title-group">
          <h1 class="page-header__title">Categorías de Productos</h1>
          <p class="page-header__subtitle">Organización de productos por categoría</p>
        </div>
        <div class="page-header__actions">
          <button
            mat-raised-button
            color="primary"
            matTooltip="Próximamente: Crear nueva categoría"
            disabled
          >
            <mat-icon>add</mat-icon>
            Nueva Categoría
          </button>
        </div>
      </div>

      <div class="list-table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando categorías..."></app-loading-spinner>

        <ng-container *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="dataSource.data.length === 0">
            <mat-icon class="empty-state__icon">category</mat-icon>
            <h3 class="empty-state__title">Sin categorías</h3>
            <p class="empty-state__message">No hay categorías registradas en el sistema</p>
          </div>

          <!-- Tabla de categorías -->
          <table
            mat-table
            [dataSource]="dataSource"
            class="list-table"
            *ngIf="dataSource.data.length > 0"
          >
            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>NOMBRE</th>
              <td mat-cell *matCellDef="let category">
                <span class="item-name">
                  <mat-icon class="item-icon category-icon">label</mat-icon>
                  {{ category.name }}
                </span>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>ACCIONES</th>
              <td mat-cell *matCellDef="let category">
                <div class="row-actions">
                  <button
                    mat-icon-button
                    class="action-btn edit"
                    matTooltip="Editar categoría"
                    disabled
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    class="action-btn delete"
                    matTooltip="Eliminar categoría"
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

          <!-- Paginador — reemplaza el pie de tabla de estadísticas -->
          <mat-paginator
            *ngIf="dataSource.data.length > 0"
            [pageSizeOptions]="[5, 10, 25]"
            [pageSize]="10"
            showFirstLastButtons
            aria-label="Seleccionar página de categorías"
          ></mat-paginator>
        </ng-container>
      </div>

    </div>
  `,
  // Fix Causa 3: eliminado bloque `styles: [...]` — solo styleUrls externo
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<CategoryDto>();
  loading = false;

  displayedColumns = ['name', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  constructor(
    private categoriesService: CategoriesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading = true;

    this.categoriesService
      .listCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.dataSource.data = categories || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          this.notificationService.error('Error al cargar las categorías');
          this.loading = false;
          this.dataSource.data = [];
        },
      });
  }
}
