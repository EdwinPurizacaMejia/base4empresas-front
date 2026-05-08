import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { StockService } from '../../services/stock.service';
import { SearchService } from '../../services/search.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface KPICard {
  title: string;
  value: string | number;
  trend?: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface RecentPurchase {
  number: string;
  supplier_id: string;
  total: number;
  created_at: string;
}

interface LowStockProduct {
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  product_id: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
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
  monthlyChartLabels: string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  monthlySalesData: number[] = [45000, 52000, 48000, 61000, 55000, 67000];
  monthlyPurchasesData: number[] = [28000, 31000, 29000, 35000, 32000, 38000];

  // Lists
  recentPurchases: RecentPurchase[] = [];
  lowStockProducts: LowStockProduct[] = [];

  // Chart scale for visual representation
  chartMaxValue = 70000;

  // Warehouse ID (default: main warehouse)
  private warehouseId = 'bbbbbbbb-0000-0000-0000-000000000001';

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService,
    private stockService: StockService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    // Obtener warehouse ID desde localStorage o usar el default
    if (typeof localStorage !== 'undefined') {
      const savedWarehouseId = localStorage.getItem('lastWarehouseId');
      if (savedWarehouseId) {
        this.warehouseId = savedWarehouseId;
      }
    }
    this.currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Suscribirse al buscador global
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
            .slice(0, 5)
            .map(p => ({
              number: p.number,
              supplier_id: p.supplier_id,
              total: p.total,
              created_at: p.created_at || ''
            }));
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
      // Obtener datos de stock del almacén
      this.stockService.getStock(this.warehouseId).subscribe({
        next: stocks => {
          // ✅ PASO 1: Enriquecer stocks con min_stock mock/configurado
          // Nota: El backend no devuelve min_stock, así que usamos valores de prueba
          const minStockConfig: Record<string, number> = {
            'SKU-001': 10,  // Coca Cola: mín 10
            'SKU-002': 20,  // Arroz: mín 20
            'SKU-003': 15,  // Detergente: mín 15
            'SKU-004': 12,  // Agua: mín 12
            'SKU-005': 10   // Azúcar: mín 10
          };

          const enrichedStocks = stocks.map(s => ({
            ...s,
            min_stock: s.min_stock ?? minStockConfig[s.sku] ?? 10
          }));

          // ✅ PASO 2: Filtrar productos donde stock <= min_stock
          const productsWithLowStock = enrichedStocks.filter(
            s => s.min_stock > 0 && s.stock <= s.min_stock
          );

          // ✅ PASO 3: Ordenar por ratio de severidad (stock / min_stock) - menor = más crítico
          this.lowStockProducts = productsWithLowStock
            .sort((a, b) => {
              const ratioA = a.stock / (a.min_stock ?? 1);
              const ratioB = b.stock / (b.min_stock ?? 1);
              return ratioA - ratioB;
            })
            .slice(0, 5)
            .map(s => ({
              name: s.name,
              sku: s.sku,
              current_stock: s.stock,
              min_stock: s.min_stock,
              product_id: s.product_id
            }));

          console.log('📦 Productos con stock bajo (warehouse:', this.warehouseId, '):', {
            total: this.lowStockProducts.length,
            items: this.lowStockProducts
          });
          resolve();
        },
        error: err => {
          console.error('Error loading low stock products:', err);
          this.lowStockProducts = [];
          resolve();
        }
      });
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getTrendIcon(trend: number | undefined): string {
    if (!trend) return '';
    return trend >= 0 ? 'trending_up' : 'trending_down';
  }

  getTrendClass(trend: number | undefined): string {
    if (!trend) return '';
    return trend >= 0 ? 'trend-positive' : 'trend-negative';
  }

  getChartBarHeight(value: number): number {
    return (value / this.chartMaxValue) * 100;
  }

  retry(): void {
    this.loadDashboardData();
  }
}
