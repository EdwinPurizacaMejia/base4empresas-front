import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';

type StockStatus = 'ok' | 'warning' | 'critical';

interface StockWithStatus extends Stock {
  status: StockStatus;
  percentage: number;
}

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  stocks: StockWithStatus[] = [];
  private allStocks: StockWithStatus[] = []; // Copia de todos los stocks sin filtrar
  dataSource = new MatTableDataSource<StockWithStatus>([]);
  displayedColumns = ['sku', 'name', 'stock', 'min_stock', 'status', 'actions'];
  warehouseId = '';
  loading = false;
  error: string | null = null;
  initialLoad = true;
  private destroy$ = new Subject<void>();
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private stockService: StockService,
    private searchService: SearchService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Cargar warehouse por defecto si lo hay
    if (typeof localStorage !== 'undefined') {
      this.warehouseId = localStorage.getItem('lastWarehouseId') || '';
      if (this.warehouseId) {
        this.loadStock();
      }
    }

    // Suscribirse al buscador global
    this.searchService.searchTerm$Debounced
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.applyFilter(term);
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStock(): void {
    if (!this.warehouseId.trim()) {
      this.error = 'Por favor ingresa un ID de almacén';
      this.stocks = [];
      this.allStocks = [];
      this.dataSource.data = [];
      return;
    }

    this.loading = true;
    this.error = null;
    this.initialLoad = false;

    // Guardar warehouse ID para siguiente carga
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastWarehouseId', this.warehouseId);
    }

    this.stockService.getStock(this.warehouseId).subscribe({
      next: (data) => {
        const enrichedData = data.map(stock => ({
          ...stock,
          status: this.getStockStatus(stock.stock, stock.min_stock),
          percentage: this.getStockPercentage(stock.stock, stock.min_stock)
        }));
        this.allStocks = enrichedData;
        this.stocks = enrichedData;
        this.dataSource.data = enrichedData;
        this.loading = false;
        if (enrichedData.length === 0) {
          this.notificationService.info('No hay stock registrado para este almacén');
        }
      },
      error: (err) => {
        console.error(err);
        this.error = `Error al cargar stock del almacén. Verifica el ID e intenta nuevamente.`;
        this.stocks = [];
        this.allStocks = [];
        this.dataSource.data = [];
        this.loading = false;
        this.notificationService.error(this.error);
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda global al inventario
   */
  private applyFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.stocks = [...this.allStocks];
      this.dataSource.data = [...this.allStocks];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.stocks = this.allStocks.filter(stock =>
        stock.sku.toLowerCase().includes(term) ||
        stock.name.toLowerCase().includes(term)
      );
      this.dataSource.data = this.stocks;
      console.log(`🔍 Stocks filtrados: ${this.stocks.length} de ${this.allStocks.length}`);
    }
  }

  getStockStatus(current: number, minimum?: number): StockStatus {
    if (!minimum || minimum <= 0) {
      return 'ok';
    }

    if (current < minimum) {
      return 'critical';
    }

    if (current < minimum * 1.5) {
      return 'warning';
    }

    return 'ok';
  }

  getStockPercentage(current: number, minimum?: number): number {
    if (!minimum || minimum <= 0) {
      return 100;
    }

    return Math.min(100, (current / minimum) * 100);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.loadStock();
    }
  }

  onViewStock(product: Stock): void {
    this.router.navigate(['/inventario', product.product_id]);
  }

  onViewKardex(product: Stock): void {
    this.router.navigate(['/kardex'], {
      queryParams: { product_id: product.product_id, sku: product.sku }
    });
  }

  getStatusLabel(status: StockStatus): string {
    const labels: { [key in StockStatus]: string } = {
      'ok': 'Stock OK',
      'warning': 'Stock Bajo',
      'critical': 'Stock Crítico'
    };
    return labels[status];
  }
}

