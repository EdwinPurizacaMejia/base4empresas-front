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

import { SaleDetail } from '../../models/sale.model';
import { SalesService } from '../../services/sales.service';
import { NotificationService } from '../../services/notification.service';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';
import { ElectronicDocumentPanelComponent } from '../electronic-documents/electronic-document-panel.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SaleFormComponent } from '../sale-form/sale-form.component';

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
    MatDialogModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    AppCurrencyPipe,
    ElectronicDocumentPanelComponent,
  ],
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.css'],
})
export class SaleDetailComponent implements OnInit {
  sale: SaleDetail | null = null;
  loading = false;
  error: string | null = null;
  saleId: string | null = null;

  private productNameById: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private productsService: ProductsService,
    private notificationService: NotificationService,
    private dialog: MatDialog
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

    this.salesService.getSaleById(id).subscribe({
      next: (sale) => {
        this.sale = sale;

        // Cargar nombres de productos para los items (si backend solo trae product_id)
        const ids = Array.from(
          new Set(
            ((sale as any)?.items ?? [])
              .map((it: any) => String(it?.product_id || it?.product?.id || ''))
              .filter((x: string) => !!x),
          ),
        );

        if (ids.length > 0) {
          this.productsService.getProducts({ isActive: true }).subscribe({
            next: (rows: Product[]) => {
              this.productNameById = Object.fromEntries((rows ?? []).map((p) => [p.id, p.name || p.description || p.sku || p.id]));
              this.loading = false;
            },
            error: () => {
              this.productNameById = {};
              this.loading = false;
            },
          });
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la venta';
        this.loading = false;

        // Manejo recomendado: stock insuficiente / saldo negativo (probables 409/400)
        const status = err?.status;
        if (status === 409) {
          this.notificationService.error('Stock insuficiente para completar la operación.');
        } else if (status === 400 || status === 422) {
          const detail = err?.error?.detail;
          this.notificationService.error(detail ? String(detail) : 'Solicitud inválida.');
        } else {
          this.notificationService.error('Error al cargar la venta');
        }
      },
    });
  }

  onEdit(): void {
    if (!this.sale) return;

    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '760px',
      minWidth: '300px',
      maxWidth: '95vw',
      height: 'auto',
      minHeight: '400px',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'crm-dialog-panel',
      backdropClass: 'crm-dialog-backdrop',
      data: { sale: this.sale },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && this.saleId) {
        this.notificationService.success('Venta actualizada exitosamente');
        this.loadSale(this.saleId); // recargar los datos del detalle
      }
    });
  }

  onGoBack(): void {
    this.router.navigate(['/ventas/ventas']);
  }

  // Tabla de items
  get displayedColumns(): string[] {
    return ['product', 'quantity', 'unit_price', 'total_cost', 'subtotal'];
  }

  get items(): any[] {
    return (this.sale as any)?.items ?? [];
  }

  getProductName(it: any): string {
    const embedded = it?.product?.name || it?.product_name;
    if (embedded) return embedded;
    const id = it?.product_id || it?.product?.id;
    if (!id) return '—';
    return this.productNameById[String(id)] || String(id);
  }

  getItemSubtotal(it: any): number {
    const qty = Number(it?.quantity) || 0;
    // según backend puede venir unit_price o unit_cost
    const unit = Number(it?.unit_price ?? it?.unit_cost ?? 0) || 0;
    return qty * unit;
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
