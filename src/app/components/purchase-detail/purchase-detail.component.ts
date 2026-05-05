import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './purchase-detail.component.html',
  styleUrl: './purchase-detail.component.css',
})
export class PurchaseDetailComponent implements OnInit {
  purchase: PurchaseListItem | null = null;
  loading = false;
  error: string | null = null;
  purchaseId: string | null = null;
  displayedColumns: string[] = ['product', 'quantity', 'unit_price', 'total'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.purchaseId = params.get('id');
      if (this.purchaseId) {
        this.loadPurchase(this.purchaseId);
      }
    });
  }

  loadPurchase(id: string): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchases().subscribe({
      next: (purchases) => {
        const found = purchases.find((p) => p.id === id);
        if (found) {
          this.purchase = found;
          this.loading = false;
        } else {
          this.error = 'Compra no encontrada';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al cargar la compra';
        this.loading = false;
        this.notificationService.error('Error al cargar la compra');
      },
    });
  }

  onEdit(): void {
    if (this.purchase) {
      this.router.navigate(['/purchases'], {
        queryParams: { editId: this.purchase.id },
      });
      this.notificationService.info('Abriendo editor...');
    }
  }

  onGoBack(): void {
    this.router.navigate(['/purchases']);
  }

  onRetry(): void {
    if (this.purchaseId) {
      this.loadPurchase(this.purchaseId);
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      received: 'Recibida',
      cancelled: 'Cancelada',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'accent',
      confirmed: 'primary',
      received: 'success',
      cancelled: 'warn',
    };
    return colorMap[status] || 'primary';
  }
}
