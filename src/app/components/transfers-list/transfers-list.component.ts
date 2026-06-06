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
import { CreateTransferDialogComponent } from './create-transfer-dialog.component';

export interface TransferRow {
  date: string;
  warehouseFrom: string;
  warehouseTo: string;
  product: string;
  quantity: number;
  user: string;
}

@Component({
  selector: 'app-transfers-list',
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
        <h1>↔️ Transferencias entre Almacenes</h1>
        <button 
          mat-raised-button 
          color="primary"
          (click)="openCreateTransferDialog()"
          matTooltip="Crear nueva transferencia entre almacenes"
        >
          <mat-icon>add</mat-icon>
          Nueva Transferencia
        </button>
      </div>

      <!-- Filtro por Almacén -->
      <mat-card class="filter-card">
        <mat-form-field appearance="fill">
          <mat-label>Filtrar por Almacén</mat-label>
          <mat-select [(ngModel)]="selectedWarehouse" (selectionChange)="loadTransfers()">
            <mat-option value="">Todos los Almacenes</mat-option>
            <mat-option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <!-- Tabla de Transferencias -->
      <mat-card class="table-card">
        <app-loading-spinner 
          *ngIf="loading" 
          message="Cargando transferencias..."
        ></app-loading-spinner>

        <div 
          *ngIf="!loading && transfers.length === 0" 
          class="empty-state"
        >
          <mat-icon>swap_horiz</mat-icon>
          <p>No hay transferencias registradas</p>
          <p class="empty-subtitle">
            Las transferencias mueven productos entre almacenes
          </p>
        </div>

        <table 
          mat-table 
          [dataSource]="transfers" 
          class="transfers-table"
          *ngIf="!loading && transfers.length > 0"
        >
          <!-- Columna: Fecha -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let element">{{ formatDate(element.date) }}</td>
          </ng-container>

          <!-- Columna: Almacén Origen -->
          <ng-container matColumnDef="warehouseFrom">
            <th mat-header-cell *matHeaderCellDef>Almacén Origen</th>
            <td mat-cell *matCellDef="let element">{{ element.warehouseFrom }}</td>
          </ng-container>

          <!-- Columna: Almacén Destino -->
          <ng-container matColumnDef="warehouseTo">
            <th mat-header-cell *matHeaderCellDef>Almacén Destino</th>
            <td mat-cell *matCellDef="let element">{{ element.warehouseTo }}</td>
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
              <span class="transfer-quantity">{{ element.quantity }}</span>
            </td>
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

    .transfers-table {
      width: 100%;
    }

    .transfers-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .transfers-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .transfer-quantity {
      font-weight: 600;
      color: #2196f3;
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
export class TransfersListComponent implements OnInit {
  transfers: TransferRow[] = [];
  warehouses: any[] = [];
  selectedWarehouse: string = '';
  loading = false;
  displayedColumns: string[] = ['date', 'warehouseFrom', 'warehouseTo', 'product', 'quantity', 'user'];

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
        if (warehouses.length > 0) {
          this.selectedWarehouse = warehouses[0].id;
          this.loadTransfers();
        }
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
      }
    });
  }

  loadTransfers(): void {
    this.loading = true;

    const filters: any = {
      referenceType: 'TRANSFER',
      warehouseId: this.selectedWarehouse || ''
    };

    this.kardexService.getKardex(filters).subscribe({
      next: (movements) => {
        this.transfers = movements.map(movement => ({
          date: movement.created_at,
          warehouseFrom: 'Almacén Origen',
          warehouseTo: this.getWarehouseName(this.selectedWarehouse) || 'Almacén Destino',
          product: movement.product_name 
            ? `${movement.product_name}${movement.product_sku ? ' (' + movement.product_sku + ')' : ''}`
            : `Producto #${movement.product_id?.substring(0, 8) || movement.id}`,
          quantity: movement.quantity,
          user: 'Sistema'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading transfers:', err);
        this.loading = false;
      }
    });
  }

  getWarehouseName(id: string): string {
    const warehouse = this.warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : id;
  }

  openCreateTransferDialog(): void {
    const dialogRef = this.dialog.open(CreateTransferDialogComponent, {
      width: '600px',
      disableClose: false,
      data: {
        warehouses: this.warehouses
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        // Refrescar listado después de crear transferencia
        this.loadTransfers();
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
