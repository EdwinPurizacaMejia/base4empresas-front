import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { SearchService } from '../../services/search.service';
import { Product } from '../../models/product.model';
import { SaleListItem } from '../../models/sale.model';
import { PurchaseListItem } from '../../models/purchase.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface KPICard {
  title: string;
  value: string | number;
  trend?: number; // Porcentaje de cambio
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface LowStockProduct {
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // State
  loading = true;
  error = '';
  currentDate = '';
  private destroy$ = new Subject<void>();

  // KPI Cards
  kpiCards: KPICard[] = [];

  // Chart data (últimos 6 meses)
  monthlyChartLabels: string[] = [];
  monthlySalesData: number[] = [];
  monthlyPurchasesData: number[] = [];

  // Lists
  recentPurchases: PurchaseListItem[] = [];
  lowStockProducts: LowStockProduct[] = [];

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Suscribirse al buscador global (para logs)
    this.searchService.searchTerm$Debounced
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        console.log('🔎 [Dashboard] Búsqueda global:', term);
      });

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.loadKPIs(),
      this.loadChartData(),
      this.loadRecentPurchases(),
      this.loadLowStockProducts()
    ])
      .then(() => {
        this.loading = false;
      })
      .catch(err => {
        console.error('Error loading dashboard:', err);
        this.error = 'Error al cargar datos del dashboard';
        this.loading = false;
      });
  }

  private loadKPIs(): Promise<void> {
    return Promise.all([
      new Promise<void>(resolve => {
        this.productsService.getProducts().subscribe({
          next: products => {
            const activeProducts = products.filter(p => p.is_active).length;
            this.kpiCards.push({
              title: 'Total de Productos',
              value: activeProducts,
              icon: 'inventory_2',
              color: 'primary',
              trend: 5
            });
            resolve();
          },
          error: () => {
            this.kpiCards.push({
              title: 'Total de Productos',
              value: 0,
              icon: 'inventory_2',
              color: 'primary'
            });
            resolve();
          }
        });
      }),
      new Promise<void>(resolve => {
        this.salesService.getSales().subscribe({
          next: sales => {
            const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
            this.kpiCards.push({
              title: 'Ventas Totales',
              value: `S/ ${totalSales.toFixed(2)}`,
              icon: 'trending_up',
              color: 'success',
              trend: 12
            });
            resolve();
          },
          error: () => {
            this.kpiCards.push({
              title: 'Ventas Totales',
              value: 'S/ 0.00',
              icon: 'trending_up',
              color: 'success'
            });
            resolve();
          }
        });
      }),
      new Promise<void>(resolve => {
        this.purchaseService.getPurchases().subscribe({
          next: purchases => {
            const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
            this.kpiCards.push({
              title: 'Compras Totales',
              value: `S/ ${totalPurchases.toFixed(2)}`,
              icon: 'shopping_cart',
              color: 'warning',
              trend: -3
            });
            resolve();
          },
          error: () => {
            this.kpiCards.push({
              title: 'Compras Totales',
              value: 'S/ 0.00',
              icon: 'shopping_cart',
              color: 'warning'
            });
            resolve();
          }
        });
      })
    ]).then(() => {});
  }

  private loadChartData(): Promise<void> {
    return new Promise(resolve => {
      // Generar últimos 6 meses
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      this.monthlyChartLabels = months;
      this.monthlySalesData = [45000, 52000, 48000, 61000, 55000, 67000];
      this.monthlyPurchasesData = [28000, 31000, 29000, 35000, 32000, 38000];
      resolve();
    });
  }

  private loadRecentPurchases(): Promise<void> {
    return new Promise(resolve => {
      this.purchaseService.getPurchases().subscribe({
        next: purchases => {
          this.recentPurchases = purchases
            .sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            })
            .slice(0, 5);
          resolve();
        },
        error: () => {
          this.recentPurchases = [];
          resolve();
        }
      });
    });
  }

  private loadLowStockProducts(): Promise<void> {
    return new Promise(resolve => {
      this.productsService.getProducts().subscribe({
        next: products => {
          this.lowStockProducts = products
            .filter(p => p.is_active && p.min_stock > 0) // Para demo, asumir que tenemos stock (en realidad necesitaríamos StockService)
            .slice(0, 5)
            .map(p => ({
              name: p.name,
              sku: p.sku,
              current_stock: Math.floor(Math.random() * p.min_stock * 2), // Demo
              min_stock: p.min_stock
            }));
          resolve();
        },
        error: () => {
          this.lowStockProducts = [];
          resolve();
        }
      });
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getTrendIcon(trend: number | undefined): string {
    if (!trend) return '';
    return trend >= 0 ? 'trending_up' : 'trending_down';
  }

  getTrendClass(trend: number | undefined): string {
    if (!trend) return '';
    return trend >= 0 ? 'trend-positive' : 'trend-negative';
  }
}
