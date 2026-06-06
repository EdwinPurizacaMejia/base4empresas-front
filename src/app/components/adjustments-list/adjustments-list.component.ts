import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { KardexService } from '../../services/kardex.service';
import { WarehouseService } from '../../services/warehouse.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { CreateAdjustmentDialogComponent } from './create-adjustment-dialog.component';

export interface AdjustmentRow {
  date: string;
  warehouse: string;
  product: string;
  quantity: number;
  reason: string;
  user: string;
}

@Component({
  selector: 'app-adjustments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>⚙️ Ajustes de Inventario</h1>
        <button 
          mat-raised-button 
          color="primary"
          (click)="openCreateAdjustmentDialog()"
          [disabled]="!selectedWarehouse"
          [matTooltip]="!selectedWarehouse ? 'Selecciona un almacén primero' : 'Crear nuevo ajuste de inventario'"
        >
          <mat-icon>add</mat-icon>
          Nuevo Ajuste
        </button>
      </div>

      <!-- Filtro por Almacén -->
      <mat-card class="filter-card">
        <mat-form-field appearance="fill">
          <mat-label>Filtrar por Almacén</mat-label>
          <mat-select [(ngModel)]="selectedWarehouse" (selectionChange)="loadAdjustments()">
            <mat-option value="">Selecciona un almacén</mat-option>
            <mat-option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <!-- Tabla de Ajustes -->
      <mat-card class="table-card">
        <app-loading-spinner 
          *ngIf="loading" 
          message="Cargando ajustes..."
        ></app-loading-spinner>

        <div 
          *ngIf="!loading && !selectedWarehouse" 
          class="empty-state"
        >
          <mat-icon>warehouse</mat-icon>
          <p>Selecciona un almacén</p>
          <p class="empty-subtitle">
            Elige un almacén arriba para ver sus ajustes de inventario
          </p>
        </div>

        <div 
          *ngIf="!loading && selectedWarehouse && adjustments.length === 0" 
          class="empty-state"
        >
          <mat-icon>assignment</mat-icon>
          <p>No hay ajustes registrados</p>
          <p class="empty-subtitle">
            Los ajustes se registran para corregir diferencias de inventario
          </p>
        </div>

        <table 
          mat-table 
          [dataSource]="adjustments" 
          class="adjustments-table"
          *ngIf="!loading && adjustments.length > 0"
        >
          <!-- Columna: Fecha -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let element">{{ formatDate(element.date) }}</td>
          </ng-container>

          <!-- Columna: Almacén -->
          <ng-container matColumnDef="warehouse">
            <th mat-header-cell *matHeaderCellDef>Almacén</th>
            <td mat-cell *matCellDef="let element">{{ element.warehouse }}</td>
          </ng-container>

          <!-- Columna: Producto -->
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Producto</th>
            <td mat-cell *matCellDef="let element">{{ element.product }}</td>
          </ng-container>

          <!-- Columna: Cantidad -->
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Cantidad</th>
            <td mat-cell *matCellDef="let element">
              <span [class.adjustment-increase]="element.quantity > 0" 
                    [class.adjustment-decrease]="element.quantity < 0">
                {{ element.quantity > 0 ? '+' : '' }}{{ element.quantity }}
              </span>
            </td>
          </ng-container>

          <!-- Columna: Razón -->
          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Razón</th>
            <td mat-cell *matCellDef="let element">{{ element.reason }}</td>
          </ng-container>

          <!-- Columna: Usuario -->
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Usuario</th>
            <td mat-cell *matCellDef="let element">{{ element.user }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
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

    .filter-card {
      padding: 16px;
      margin-bottom: 24px;
    }

    .table-card {
      padding: 0;
      overflow: auto;
    }

    .adjustments-table {
      width: 100%;
    }

    .adjustments-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .adjustments-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .adjustment-increase {
      color: #4caf50;
      font-weight: 600;
    }

    .adjustment-decrease {
      color: #f44336;
      font-weight: 600;
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
      margin: 8px 0;
      color: #666;
    }

    .empty-subtitle {
      font-size: 12px;
      color: #999;
    }

    mat-form-field {
      width: 300px;
    }
  `]
})
export class AdjustmentsListComponent implements OnInit {
  adjustments: AdjustmentRow[] = [];
  warehouses: any[] = [];
  selectedWarehouse: string = '';
  loading = false;
  displayedColumns: string[] = ['date', 'warehouse', 'product', 'quantity', 'reason', 'user'];

  constructor(
    private kardexService: KardexService,
    private warehouseService: WarehouseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
      }
    });
  }

  loadAdjustments(): void {
    if (!this.selectedWarehouse) {
      this.adjustments = [];
      return;
    }

    this.loading = true;

    const filters: any = {
      referenceType: 'ADJUSTMENT',
      warehouseId: this.selectedWarehouse
    };

    this.kardexService.getKardex(filters).subscribe({
      next: (movements) => {
        this.adjustments = movements.map(movement => ({
          date: movement.created_at,
          warehouse: this.getWarehouseName(this.selectedWarehouse),
          product: movement.product_name 
            ? `${movement.product_name}${movement.product_sku ? ' (' + movement.product_sku + ')' : ''}`
            : `Producto #${movement.product_id?.substring(0, 8) || movement.id}`,
          quantity: movement.movement_type === 'IN' ? movement.quantity : -movement.quantity,
          reason: movement.reason || 'Sin especificar',
          user: 'Sistema'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading adjustments:', err);
        this.loading = false;
      }
    });
  }

  getWarehouseName(id: string): string {
    const warehouse = this.warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : id;
  }

  openCreateAdjustmentDialog(): void {
    const dialogRef = this.dialog.open(CreateAdjustmentDialogComponent, {
      width: '600px',
      disableClose: false,
      data: {
        warehouseId: this.selectedWarehouse,
        warehouses: this.warehouses
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        // Refrescar listado después de crear ajuste
        this.loadAdjustments();
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }
}
