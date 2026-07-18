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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Order, OrderStatus, getOrderStatusLabel, getOrderStatusColor } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { ElectronicDocumentsService } from '../../services/electronic-documents.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GenerateDocumentDialogComponent, GenerateDocumentDialogResult } from '../electronic-documents/generate-document-dialog.component';
import { OrderFormComponent } from './order-form.component';
import { OrderCreateComponent } from './order-create.component';
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
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
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
    private electronicDocumentsService: ElectronicDocumentsService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    const dialogRef = this.dialog.open(OrderCreateComponent, {
      width: '760px',
      minWidth: '300px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'crm-dialog-panel',
      backdropClass: 'crm-dialog-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.snackBar.open('Orden creada exitosamente', 'OK', { duration: 4000 });
        this.loadOrders();
      }
    });
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

  editOrder(order: Order): void {
    // Cargar el pedido completo (con items) antes de abrir el diálogo
    this.ordersService.getOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullOrder) => {
          const dialogRef = this.dialog.open(OrderFormComponent, {
            width: '760px',
            minWidth: '300px',
            maxWidth: '95vw',
            maxHeight: '95vh',
            disableClose: true,
            autoFocus: false,
            panelClass: 'crm-dialog-panel',
            backdropClass: 'crm-dialog-backdrop',
            data: { order: fullOrder },
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              this.snackBar.open('Pedido actualizado exitosamente', 'OK', { duration: 4000 });
              this.loadOrders();
            }
          });
        },
        error: () => {
          this.notificationService.error('Error al cargar los datos del pedido');
        }
      });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${order.order_number}?\nEsta acción no se puede deshacer.`)) return;

    this.ordersService
      .cancel(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Pedido ${order.order_number} cancelado`, 'OK', { duration: 4000 });
          this.loadOrders();
        },
        error: (err) => {
          const msg = err?.error?.detail || 'Error al cancelar el pedido';
          this.snackBar.open(`Error: ${msg}`, 'Cerrar', { duration: 6000, panelClass: 'snack-error' });
        }
      });
  }

  generateElectronicDocument(order: Order): void {
    const dialogRef = this.dialog.open(GenerateDocumentDialogComponent, {
      width: '440px',
      disableClose: false,
      data: { saleNumber: order.order_number },
    });

    dialogRef.afterClosed().subscribe((result: GenerateDocumentDialogResult | undefined) => {
      if (!result) return;

      const typeLabels: Record<string, string> = {
        invoice: 'Factura/Boleta',
        credit_note: 'Nota de Crédito',
        debit_note: 'Nota de Débito',
      };
      const tipoLabel = typeLabels[result.documentType] || result.documentType;

      this.electronicDocumentsService.createFromOrder(order.id, result.documentType).subscribe({
        next: (doc) => {
          this.snackBar.open(
            `✔ ${tipoLabel} ${doc.full_number || ''} generada (${doc.status})`,
            'Ver',
            { duration: 6000, panelClass: 'snack-success' }
          );
          this.loadOrders();
        },
        error: (err) => {
          const msg = err?.error?.detail || 'Error al generar el comprobante';
          this.snackBar.open(`Error: ${msg}`, 'Cerrar', { duration: 8000, panelClass: 'snack-error' });
        }
      });
    });
  }
}
