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

import { Order, OrderStatus, getOrderStatusLabel, getOrderStatusColor } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-orders-list',
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
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
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
    'separation_expiry_at',
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
          this.orders = orders || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.notificationService.error('Error al cargar las órdenes');
          this.loading = false;
        }
      });
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

  viewDetail(orderId: string): void {
    this.router.navigate(['/ventas/pedidos', orderId]);
  }

  createOrder(): void {
    this.router.navigate(['/ventas/pedidos/crear']);
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
