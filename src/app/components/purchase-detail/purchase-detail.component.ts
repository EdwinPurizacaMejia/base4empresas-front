import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

import { Purchase } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

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
    AppCurrencyPipe,
  ],
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.css'],
})
export class PurchaseDetailComponent implements OnInit {
  purchase: Purchase | null = null;
  loading = false;
  error: string | null = null;
  purchaseId: string | null = null;
  displayedColumns: string[] = ['product_id', 'quantity', 'unit_cost', 'subtotal'];

  private productsById = new Map<string, Product>();

  get itemsDataSource(): any[] {
    return this.purchase?.items ?? [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private productsService: ProductsService,
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

    // Preferimos el detalle por ID para asegurar que vengan los items.
    this.purchaseService.getPurchaseById(id).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loadProductsForItems(purchase?.items ?? []);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.userMessage || 'Error al cargar la compra';
        this.loading = false;
        this.notificationService.error(this.error ?? 'Error al cargar la compra');
      },
    });
  }

  private loadProductsForItems(items: any[]): void {
    const ids = Array.from(
      new Set((items ?? []).map((it) => it?.product_id).filter(Boolean)),
    ) as string[];

    ids.forEach((id) => {
      if (this.productsById.has(id)) return;
      this.productsService.getProductById(id).subscribe({
        next: (p) => this.productsById.set(id, p),
        error: (err) => console.error('Error cargando producto', id, err),
      });
    });
  }

  getProductName(productId: string): string {
    const p = this.productsById.get(productId);
    return (p as any)?.name ?? (p as any)?.description ?? productId;
  }

  onEdit(): void {
    if (this.purchase) {
      this.router.navigate(['/compras'], {
        queryParams: { editId: this.purchase.id },
      });
      this.notificationService.info('Abriendo editor...');
    }
  }

  onGoBack(): void {
    this.router.navigate(['/compras']);
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
