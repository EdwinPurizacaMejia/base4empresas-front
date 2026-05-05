import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SaleListItem } from '../../models/sale.model';
import { SalesService } from '../../services/sales.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './sale-detail.component.html',
  styleUrl: './sale-detail.component.css',
})
export class SaleDetailComponent implements OnInit {
  sale: SaleListItem | null = null;
  loading = false;
  error: string | null = null;
  saleId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.saleId = params.get('id');
      if (this.saleId) {
        this.loadSale(this.saleId);
      }
    });
  }

  loadSale(id: string): void {
    this.loading = true;
    this.error = null;

    this.salesService.getSales().subscribe({
      next: (sales) => {
        const found = sales.find((s) => s.id === id);
        if (found) {
          this.sale = found;
          this.loading = false;
        } else {
          this.error = 'Venta no encontrada';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al cargar la venta';
        this.loading = false;
        this.notificationService.error('Error al cargar la venta');
      },
    });
  }

  onEdit(): void {
    if (this.sale) {
      this.router.navigate(['/sales'], {
        queryParams: { editId: this.sale.id },
      });
      this.notificationService.info('Abriendo editor...');
    }
  }

  onGoBack(): void {
    this.router.navigate(['/sales']);
  }

  onRetry(): void {
    if (this.saleId) {
      this.loadSale(this.saleId);
    }
  }

  getStatusLabel(status?: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada',
      shipped: 'Enviada',
    };
    return statusMap[status || 'pending'] || status || 'N/A';
  }

  getStatusColor(status?: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'accent',
      completed: 'primary',
      cancelled: 'warn',
      shipped: 'primary',
    };
    return colorMap[status || 'pending'] || 'primary';
  }

  getPaymentStatusLabel(paymentStatus?: string): string {
    const statusMap: { [key: string]: string } = {
      unpaid: 'No pagada',
      partial: 'Parcialmente pagada',
      paid: 'Pagada',
    };
    return statusMap[paymentStatus || 'unpaid'] || paymentStatus || 'N/A';
  }

  getPaymentStatusColor(paymentStatus?: string): string {
    const colorMap: { [key: string]: string } = {
      unpaid: 'warn',
      partial: 'accent',
      paid: 'primary',
    };
    return colorMap[paymentStatus || 'unpaid'] || 'primary';
  }
}
