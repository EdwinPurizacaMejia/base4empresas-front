import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderFormComponent } from './order-form.component';

import { Order, OrderStatus, getOrderStatusLabel, getOrderStatusColor } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { CustomersService } from '../../services/customers.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { OrderPaymentsComponent } from './order-payments/order-payments.component';
import { OrderShipmentsComponent } from './order-shipments/order-shipments.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';
import { ElectronicDocumentPanelComponent } from '../electronic-documents/electronic-document-panel.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    OrderPaymentsComponent,
    OrderShipmentsComponent,
    AppCurrencyPipe,
    ElectronicDocumentPanelComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = false;
  updatingStatus = false;
  selectedStatus: OrderStatus | null = null;
  showStatusSelector = false;

  customer: any = null;
  channel: any = null;

  itemsDisplayedColumns = ['product', 'quantity', 'unitPrice', 'discount', 'subtotal'];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private channelsService: SalesChannelsService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadOrder(): void {
    if (this.order?.id) {
      this.loadOrder(this.order.id);
    }
  }

  private loadOrder(orderId: string): void {
    this.loading = true;

    this.ordersService
      .getOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loadRelatedData();
        },
        error: (err) => {
          console.error('Error loading order:', err);
          this.notificationService.error('Error al cargar la orden');
          this.loading = false;
        }
      });
  }

  private loadRelatedData(): void {
    if (!this.order) return;

    forkJoin([
      this.customersService.getCustomers(),
      this.channelsService.getChannels()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([customers, channels]) => {
          this.customer = (customers ?? []).find((c: any) => c.id === this.order?.customer_id);
          this.channel = (channels ?? []).find((c: any) => c.id === this.order?.sales_channel_id);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading related data:', err);
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

  getAvailableStatusTransitions(): OrderStatus[] {
    if (!this.order) return [];

    const currentStatus = this.order.status;
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: ['SEPARATED', 'CANCELLED', 'PENDING_INVOICE'],
      SEPARATED: ['PENDING_INVOICE', 'CANCELLED', 'INVOICED'],
      CANCELLED: [],
      PENDING_INVOICE: ['INVOICED', 'CANCELLED'],
      INVOICED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: []
    };

    return transitions[currentStatus] || [];
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.order) return;

    this.updatingStatus = true;

    this.ordersService
      .updateOrderStatus(this.order.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.notificationService.success(`Estado actualizado a: ${this.getStatusLabel(newStatus)}`);
          this.showStatusSelector = false;
          this.updatingStatus = false;
        },
        error: (err) => {
          console.error('Error updating order status:', err);
          this.notificationService.error('Error al actualizar el estado');
          this.updatingStatus = false;
        }
      });
  }

  cancelOrder(): void {
    if (!this.order || !confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }

    this.ordersService
      .cancel(this.order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.notificationService.success('Orden cancelada exitosamente');
        },
        error: (err) => {
          console.error('Error canceling order:', err);
          this.notificationService.error('Error al cancelar la orden');
        }
      });
  }

  markAsSeparated(): void {
    if (!this.order) return;

    this.ordersService
      .markAsSeparated(this.order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.notificationService.success('Orden marcada como separada');
        },
        error: (err) => {
          console.error('Error marking as separated:', err);
          this.notificationService.error('Error al marcar como separada');
        }
      });
  }

  markAsInvoiced(): void {
    if (!this.order) return;

    this.ordersService
      .markAsInvoiced(this.order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.notificationService.success('Orden facturada exitosamente');
        },
        error: (err) => {
          console.error('Error marking as invoiced:', err);
          this.notificationService.error('Error al facturar');
        }
      });
  }

  isSeparationExpiring(): boolean {
    if (!this.order?.separation_expiry_at) return false;

    const expiryDate = new Date(this.order.separation_expiry_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
  }

  isSeparationExpired(): boolean {
    if (!this.order?.separation_expiry_at) return false;

    const expiryDate = new Date(this.order.separation_expiry_at);
    const now = new Date();

    return now > expiryDate;
  }

  getTotalBalance(): number {
    if (!this.order) return 0;
    return this.order.total_amount - this.order.paid_amount;
  }

  goBack(): void {
    this.router.navigate(['/pedidos']);
  }

  editOrder(): void {
    if (!this.order) return;
    const dialogRef = this.dialog.open(OrderFormComponent, {
      width: '760px',
      minWidth: '300px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      data: { order: this.order },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.notificationService.success('Pedido actualizado correctamente');
        this.loadOrder(this.order!.id);
      }
    });
  }
}
