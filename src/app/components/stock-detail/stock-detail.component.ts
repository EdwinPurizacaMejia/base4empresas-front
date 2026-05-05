import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.css',
})
export class StockDetailComponent implements OnInit {
  stock: Stock | null = null;
  loading = false;
  error: string | null = null;
  productId: string | null = null;
  stockPercentage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
      if (this.productId) {
        this.loadStock(this.productId);
      }
    });
  }

  loadStock(id: string): void {
    this.loading = true;
    this.error = null;

    this.stockService.getStock('').subscribe({
      next: (stocks) => {
        const found = stocks.find((s) => s.product_id === id);
        if (found) {
          this.stock = found;
          this.calculateStockPercentage();
          this.loading = false;
        } else {
          this.error = 'Stock no encontrado';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al cargar el inventario';
        this.loading = false;
        this.notificationService.error('Error al cargar el inventario');
      },
    });
  }

  calculateStockPercentage(): void {
    if (this.stock && this.stock.min_stock && this.stock.min_stock > 0) {
      const percentage = (this.stock.stock / (this.stock.min_stock * 2)) * 100;
      this.stockPercentage = Math.min(percentage, 100);
    } else {
      this.stockPercentage = 0;
    }
  }

  getStockStatus(): string {
    if (!this.stock) return 'unknown';
    
    const minStock = this.stock.min_stock || 0;
    
    if (this.stock.stock === 0) {
      return 'agotado';
    } else if (this.stock.stock < minStock) {
      return 'bajo';
    } else if (this.stock.stock >= (minStock * 2)) {
      return 'optimo';
    }
    return 'normal';
  }

  getStockStatusLabel(): string {
    const statusMap: { [key: string]: string } = {
      agotado: 'Agotado',
      bajo: 'Stock Bajo',
      normal: 'Stock Normal',
      optimo: 'Stock Óptimo',
      unknown: 'Desconocido',
    };
    return statusMap[this.getStockStatus()];
  }

  getStockStatusColor(): string {
    const colorMap: { [key: string]: string } = {
      agotado: 'warn',
      bajo: 'accent',
      normal: 'primary',
      optimo: 'primary',
      unknown: 'primary',
    };
    return colorMap[this.getStockStatus()];
  }

  getProgressColor(): string {
    const status = this.getStockStatus();
    if (status === 'agotado') return '#f44336';
    if (status === 'bajo') return '#ff9800';
    if (status === 'optimo') return '#4caf50';
    return '#1976d2';
  }

  onEdit(): void {
    if (this.stock) {
      this.router.navigate(['/stock'], {
        queryParams: { editId: this.stock.product_id },
      });
      this.notificationService.info('Abriendo editor...');
    }
  }

  onGoBack(): void {
    this.router.navigate(['/stock']);
  }

  onRetry(): void {
    if (this.productId) {
      this.loadStock(this.productId);
    }
  }
}
