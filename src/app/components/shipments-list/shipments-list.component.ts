import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { OrdersService } from '../../services/orders.service';
import { ShipmentsService } from '../../services/shipments.service';
import { Order } from '../../models/order.model';
import { Shipment, getShipmentStatusLabel, getShippingMethodLabel } from '../../models/shipment.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

interface OrderWithShipments extends Order {
  shipments?: Shipment[];
  latestShipment?: Shipment;
}

@Component({
  selector: 'app-shipments-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>📦 Gestión de Envíos</h1>
        <p class="subtitle">Seguimiento de envíos y entregas</p>
      </div>

      <!-- Filtros -->
      <mat-card class="filter-card">
        <mat-form-field appearance="fill">
          <mat-label>Filtrar por estado de orden</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadOrders()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="INVOICED">Facturadas</mat-option>
            <mat-option value="SHIPPED">En Tránsito</mat-option>
            <mat-option value="DELIVERED">Entregadas</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <!-- Tabla de Órdenes con Envíos -->
      <mat-card class="table-card">
        <app-loading-spinner 
          *ngIf="loading" 
          message="Cargando órdenes con envíos..."
        ></app-loading-spinner>

        <div 
          *ngIf="!loading && orders.length === 0" 
          class="empty-state"
        >
          <mat-icon>local_shipping</mat-icon>
          <p>No hay órdenes con envíos</p>
          <p class="empty-subtitle">
            Las órdenes con envíos aparecerán aquí
          </p>
        </div>

        <table 
          mat-table 
          [dataSource]="orders" 
          class="shipments-table"
          *ngIf="!loading && orders.length > 0"
        >
          <!-- Columna: Orden -->
          <ng-container matColumnDef="order">
            <th mat-header-cell *matHeaderCellDef>Orden</th>
            <td mat-cell *matCellDef="let element">
              <div class="order-info">
                <a [routerLink]="['/ventas/pedidos', element.id]" class="order-link">
                  #{{ element.order_number || element.id.substring(0, 8) }}
                </a>
                <small>{{ formatDate(element.created_at) }}</small>
              </div>
            </td>
          </ng-container>

          <!-- Columna: Cliente -->
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let element">
              {{ element.customer_name || 'N/A' }}
            </td>
          </ng-container>

          <!-- Columna: Método de Envío -->
          <ng-container matColumnDef="shipping_method">
            <th mat-header-cell *matHeaderCellDef>Método</th>
            <td mat-cell *matCellDef="let element">
              <span *ngIf="element.latestShipment">
                {{ getShippingMethodLabel(element.latestShipment.shipping_method) }}
              </span>
              <span *ngIf="!element.latestShipment" class="no-shipment">
                Sin envío
              </span>
            </td>
          </ng-container>

          <!-- Columna: Tracking -->
          <ng-container matColumnDef="tracking">
            <th mat-header-cell *matHeaderCellDef>Tracking</th>
            <td mat-cell *matCellDef="let element">
              <code *ngIf="element.latestShipment?.tracking_number" class="tracking-code">
                {{ element.latestShipment.tracking_number }}
              </code>
              <span *ngIf="!element.latestShipment?.tracking_number" class="no-tracking">
                -
              </span>
            </td>
          </ng-container>

          <!-- Columna: Destinatario -->
          <ng-container matColumnDef="recipient">
            <th mat-header-cell *matHeaderCellDef>Destinatario</th>
            <td mat-cell *matCellDef="let element">
              <div *ngIf="element.latestShipment" class="recipient-info">
                <strong>{{ element.latestShipment.recipient_name }}</strong>
                <small *ngIf="element.latestShipment.recipient_phone">
                  {{ element.latestShipment.recipient_phone }}
                </small>
              </div>
              <span *ngIf="!element.latestShipment">-</span>
            </td>
          </ng-container>

          <!-- Columna: Estado de Envío -->
          <ng-container matColumnDef="shipment_status">
            <th mat-header-cell *matHeaderCellDef>Estado Envío</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip 
                *ngIf="element.latestShipment"
                [class]="'status-chip status-' + element.latestShipment.status.toLowerCase()"
              >
                {{ getShipmentStatusLabel(element.latestShipment.status) }}
              </mat-chip>
              <mat-chip *ngIf="!element.latestShipment" class="status-chip status-none">
                Sin envío
              </mat-chip>
            </td>
          </ng-container>

          <!-- Columna: Estado Orden -->
          <ng-container matColumnDef="order_status">
            <th mat-header-cell *matHeaderCellDef>Estado Orden</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [class]="'status-chip status-' + element.status.toLowerCase()">
                {{ getOrderStatusLabel(element.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Columna: Acciones -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let element">
              <button 
                mat-icon-button 
                [routerLink]="['/ventas/pedidos', element.id]"
                matTooltip="Ver detalle"
              >
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
      color: #1a237e;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .filter-card {
      padding: 16px;
      margin-bottom: 24px;
    }

    .table-card {
      padding: 0;
      overflow: auto;
    }

    .shipments-table {
      width: 100%;
    }

    .shipments-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
      padding: 16px 12px;
    }

    .shipments-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .table-row:hover {
      background-color: #f9f9f9;
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .order-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 600;
    }

    .order-link:hover {
      text-decoration: underline;
    }

    .order-info small {
      color: #666;
      font-size: 12px;
    }

    .recipient-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .recipient-info strong {
      font-size: 14px;
    }

    .recipient-info small {
      color: #666;
      font-size: 12px;
    }

    .tracking-code {
      background-color: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #1565c0;
    }

    .no-tracking, .no-shipment {
      color: #999;
      font-style: italic;
    }

    .status-chip {
      font-size: 12px;
      min-height: 28px;
      border-radius: 14px;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-in_transit {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-delivered {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-cancelled {
      background-color: #f5f5f5;
      color: #616161;
    }

    .status-none {
      background-color: #fafafa;
      color: #9e9e9e;
    }

    .status-invoiced {
      background-color: #fff9c4;
      color: #f57f17;
    }

    .status-shipped {
      background-color: #e1f5fe;
      color: #01579b;
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
export class ShipmentsListComponent implements OnInit {
  orders: OrderWithShipments[] = [];
  selectedStatus: string = '';
  loading = false;
  displayedColumns: string[] = ['order', 'customer', 'shipping_method', 'tracking', 'recipient', 'shipment_status', 'order_status', 'actions'];

  // Re-exportar funciones para uso en template
  getShipmentStatusLabel = getShipmentStatusLabel;
  getShippingMethodLabel = getShippingMethodLabel;

  constructor(
    private ordersService: OrdersService,
    private shipmentsService: ShipmentsService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    // Cargar órdenes que están en estado INVOICED, SHIPPED o DELIVERED
    const params: any = {};
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.ordersService.listOrders(params).subscribe({
      next: (orders: Order[]) => {
        // Filtrar solo órdenes que están en estados relacionados con envíos
        const relevantOrders = orders.filter(o => 
          ['INVOICED', 'SHIPPED', 'DELIVERED'].includes(o.status)
        );

        // Cargar shipments para cada orden
        this.loadShipmentsForOrders(relevantOrders);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
        this.orders = [];
      }
    });
  }

  private loadShipmentsForOrders(orders: Order[]): void {
    if (orders.length === 0) {
      this.orders = [];
      this.loading = false;
      return;
    }

    let completed = 0;
    const ordersWithShipments: OrderWithShipments[] = [];

    orders.forEach(order => {
      this.shipmentsService.listShipmentsForOrder(order.id).subscribe({
        next: (shipments) => {
          const orderWithShipments: OrderWithShipments = {
            ...order,
            shipments: shipments,
            latestShipment: shipments.length > 0 ? shipments[shipments.length - 1] : undefined
          };
          ordersWithShipments.push(orderWithShipments);
          completed++;

          if (completed === orders.length) {
            this.orders = ordersWithShipments;
            this.loading = false;
          }
        },
        error: (err) => {
          console.error(`Error loading shipments for order ${order.id}:`, err);
          // Agregar orden sin shipments
          ordersWithShipments.push({ ...order });
          completed++;

          if (completed === orders.length) {
            this.orders = ordersWithShipments;
            this.loading = false;
          }
        }
      });
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

  getOrderStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Borrador',
      'SEPARATED': 'Separado',
      'PENDING_INVOICE': 'Pendiente Factura',
      'INVOICED': 'Facturado',
      'SHIPPED': 'En Tránsito',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }
}
