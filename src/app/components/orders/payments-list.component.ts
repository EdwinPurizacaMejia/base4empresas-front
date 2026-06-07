import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Order, OrderStatus, getOrderStatusLabel, getOrderStatusColor } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

/**
 * Componente para gestionar pagos pendientes
 * Muestra solo órdenes con saldo pendiente (paid_amount < total_amount)
 * Permite registrar pagos desde esta vista
 */
@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1>Gestión de Pagos</h1>
          <p class="subtitle">Órdenes con saldo pendiente de pago</p>
        </div>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="viewAllOrders()"
          matTooltip="Ver todas las órdenes"
        >
          <mat-icon>list</mat-icon>
          Ver Todas las Órdenes
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <form [formGroup]="filters" class="filters-form">
          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="status">
              <mat-option value="">Todos</mat-option>
              <mat-option *ngFor="let status of getOrderStatusOptions()" [value]="status">
                {{ getStatusLabel(status) }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Canal de Venta</mat-label>
            <mat-select formControlName="sales_channel_id">
              <mat-option value="">Todos</mat-option>
              <mat-option *ngFor="let channel of channels" [value]="channel.id">
                {{ channel.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button type="button" (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Limpiar
          </button>

          <button mat-stroked-button type="button" (click)="onRefresh()">
            <mat-icon>refresh</mat-icon>
            Actualizar
          </button>
        </form>
      </mat-card>

      <!-- Estadísticas rápidas -->
      <div class="stats-cards" *ngIf="!loading && pendingPaymentOrders.length > 0">
        <mat-card class="stat-card">
          <div class="stat-icon pending">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Órdenes con Saldo Pendiente</div>
            <div class="stat-value">{{ pendingPaymentOrders.length }}</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon amount">
            <mat-icon>attach_money</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total a Cobrar</div>
            <div class="stat-value">{{ getTotalPending() | appCurrency:'PEN' }}</div>
          </div>
        </mat-card>
      </div>

      <!-- Tabla de Órdenes con Pagos Pendientes -->
      <mat-card class="table-card">
        <app-loading-spinner *ngIf="loading" message="Cargando pagos pendientes..."></app-loading-spinner>

        <div class="table-container" *ngIf="!loading">
          <div class="empty-state" *ngIf="pendingPaymentOrders.length === 0">
            <mat-icon>check_circle</mat-icon>
            <p>No hay pagos pendientes</p>
            <p class="empty-subtitle">Todas las órdenes están completamente pagadas</p>
            <button mat-stroked-button (click)="viewAllOrders()">
              Ver Todas las Órdenes
            </button>
          </div>

          <table mat-table [dataSource]="pendingPaymentOrders" class="orders-table" *ngIf="pendingPaymentOrders.length > 0">
            <!-- Número de Orden -->
            <ng-container matColumnDef="order_number">
              <th mat-header-cell *matHeaderCellDef>Número de Orden</th>
              <td mat-cell *matCellDef="let order" class="order-number">
                {{ order.order_number }}
              </td>
            </ng-container>

            <!-- Cliente -->
            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let order">
                {{ order.customer_name || order.customer_id }}
              </td>
            </ng-container>

            <!-- Canal -->
            <ng-container matColumnDef="channel">
              <th mat-header-cell *matHeaderCellDef>Canal</th>
              <td mat-cell *matCellDef="let order">
                {{ getChannelName(order.sales_channel_id) }}
              </td>
            </ng-container>

            <!-- Estado -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let order">
                <mat-chip [color]="getStatusColor(order.status)" selected>
                  {{ getStatusLabel(order.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Total -->
            <ng-container matColumnDef="total_amount">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let order" class="amount-cell">
                {{ order.total_amount | appCurrency:order.currency }}
              </td>
            </ng-container>

            <!-- Pagado -->
            <ng-container matColumnDef="paid_amount">
              <th mat-header-cell *matHeaderCellDef>Pagado</th>
              <td mat-cell *matCellDef="let order" class="amount-cell paid">
                {{ order.paid_amount | appCurrency:order.currency }}
              </td>
            </ng-container>

            <!-- Saldo Pendiente (calculado) -->
            <ng-container matColumnDef="pending_amount">
              <th mat-header-cell *matHeaderCellDef>Saldo Pendiente</th>
              <td mat-cell *matCellDef="let order" class="amount-cell pending">
                <strong>{{ getPendingAmount(order) | appCurrency:order.currency }}</strong>
              </td>
            </ng-container>

            <!-- Porcentaje Pagado -->
            <ng-container matColumnDef="payment_progress">
              <th mat-header-cell *matHeaderCellDef>Progreso</th>
              <td mat-cell *matCellDef="let order">
                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="getPaymentPercentage(order)"
                      [class.complete]="getPaymentPercentage(order) === 100"
                    ></div>
                  </div>
                  <span class="progress-label">{{ getPaymentPercentage(order) }}%</span>
                </div>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let order">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="registerPayment(order)"
                  matTooltip="Registrar pago"
                  class="action-button"
                >
                  <mat-icon>payment</mat-icon>
                  Pagar
                </button>
                <button
                  mat-icon-button
                  color="accent"
                  (click)="viewDetail(order.id)"
                  matTooltip="Ver detalle completo"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="order-row"></tr>
          </table>
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

    .subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    .filters-card {
      margin-bottom: 24px;
      padding: 16px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-form mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    /* Estadísticas */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.pending {
      background-color: #fff3e0;
      color: #ff6f00;
    }

    .stat-icon.amount {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1a237e;
    }

    .table-card {
      padding: 0;
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
    }

    .orders-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #424242;
    }

    .order-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .order-row:hover {
      background-color: #f5f5f5;
    }

    .order-number {
      font-weight: 600;
      color: #1a237e;
    }

    .amount-cell {
      text-align: right;
      font-weight: 500;
    }

    .amount-cell.paid {
      color: #2e7d32;
    }

    .amount-cell.pending {
      color: #d32f2f;
    }

    /* Barra de progreso */
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #ff9800;
      border-radius: 4px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .progress-fill.complete {
      background-color: #4caf50;
    }

    .progress-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      min-width: 40px;
      text-align: right;
    }

    .action-button {
      margin-right: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
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

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters-form {
        flex-direction: column;
      }

      .filters-form mat-form-field {
        width: 100%;
      }

      .stats-cards {
        grid-template-columns: 1fr;
      }

      .orders-table {
        font-size: 12px;
      }

      .action-button {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  `]
})
export class PaymentsListComponent implements OnInit, OnDestroy {
  pendingPaymentOrders: Order[] = [];
  allOrders: Order[] = [];
  loading = false;
  filters: FormGroup;
  channels: any[] = [];

  displayedColumns = [
    'order_number',
    'customer',
    'channel',
    'status',
    'total_amount',
    'paid_amount',
    'pending_amount',
    'payment_progress',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private ordersService: OrdersService,
    private channelsService: SalesChannelsService,
    private notificationService: NotificationService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filters = this.fb.group({
      status: [''],
      sales_channel_id: ['']
    });
  }

  ngOnInit(): void {
    this.loadChannels();
    this.loadOrders();

    this.filters.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadOrders());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadChannels(): void {
    this.channelsService
      .getChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels) => {
          this.channels = channels || [];
        },
        error: (err) => {
          console.error('Error loading channels:', err);
        }
      });
  }

  private loadOrders(): void {
    this.loading = true;

    const filterValues = this.filters.value;
    const filters = {
      status: filterValues.status || undefined,
      sales_channel_id: filterValues.sales_channel_id || undefined
    };

    this.ordersService
      .listOrders(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.allOrders = orders || [];
          // Filtrar solo órdenes con saldo pendiente
          this.pendingPaymentOrders = this.allOrders.filter(
            order => order.paid_amount < order.total_amount
          );
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.notificationService.error('Error al cargar las órdenes');
          this.loading = false;
        }
      });
  }

  getPendingAmount(order: Order): number {
    return order.total_amount - order.paid_amount;
  }

  getPaymentPercentage(order: Order): number {
    if (order.total_amount === 0) return 0;
    return Math.round((order.paid_amount / order.total_amount) * 100);
  }

  getTotalPending(): number {
    return this.pendingPaymentOrders.reduce(
      (sum, order) => sum + this.getPendingAmount(order),
      0
    );
  }

  getStatusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return getOrderStatusColor(status);
  }

  getChannelName(channelId: string): string {
    const channel = this.channels.find((c) => c.id === channelId);
    return channel ? channel.name : channelId;
  }

  registerPayment(order: Order): void {
    // Redirige al detalle de la orden donde se puede registrar el pago
    this.router.navigate(['/ventas/pedidos', order.id]);
  }

  viewDetail(orderId: string): void {
    this.router.navigate(['/ventas/pedidos', orderId]);
  }

  viewAllOrders(): void {
    this.router.navigate(['/ventas/pedidos']);
  }

  onRefresh(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.filters.reset();
  }

  getOrderStatusOptions(): OrderStatus[] {
    return ['DRAFT', 'SEPARATED', 'CANCELLED', 'PENDING_INVOICE', 'INVOICED', 'SHIPPED', 'DELIVERED'];
  }
}
