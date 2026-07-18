import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CategoriesService, CategoryDto } from '../../services/categories.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

/**
 * Componente para listar categorías de productos
 * Muestra todas las categorías disponibles en el sistema
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
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>📚 Categorías de Productos</h1>
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

      <mat-card class="table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando categorías..."></app-loading-spinner>

        <div class="table-container" *ngIf="!loading">
          <!-- Estado vacío -->
          <div class="empty-state" *ngIf="categories.length === 0">
            <mat-icon>category</mat-icon>
            <p>No hay categorías registradas</p>
            <p class="empty-subtitle">Las categorías permiten organizar tus productos</p>
          </div>

          <!-- Tabla de categorías -->
          <table mat-table [dataSource]="categories" class="categories-table" *ngIf="categories.length > 0">
            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let category">{{ category.id }}</td>
            </ng-container>

            <!-- Nombre -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let category" class="category-name">
                <mat-icon class="category-icon">label</mat-icon>
                {{ category.name }}
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let category">
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
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="category-row"></tr>
          </table>
        </div>

        <!-- Estadísticas -->
        <div class="stats" *ngIf="!loading && categories.length > 0">
          <span class="stat-item">
            <mat-icon>category</mat-icon>
            <strong>{{ categories.length }}</strong> categorías registradas
          </span>
        </div>
      </mat-card>
    </div>
  `,
  styleUrls: ['./categories-list.component.scss'],
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

    .categories-table {
      width: 100%;
    }

    .categories-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #424242;
    }

    .category-row {
      transition: background-color 0.2s;
    }

    .category-row:hover {
      background-color: #f5f5f5;
    }

    .category-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .category-icon {
      color: #1976d2;
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
      color: #1976d2;
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
export class CategoriesListComponent implements OnInit, OnDestroy {
  categories: CategoryDto[] = [];
  loading = false;

  displayedColumns = ['name', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private categoriesService: CategoriesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
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
          this.categories = categories || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          this.notificationService.error('Error al cargar las categorías');
          this.loading = false;
          this.categories = [];
        }
      });
  }
}
