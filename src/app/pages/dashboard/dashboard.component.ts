import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryStockCurrentItem } from '../../models/inventory.model';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { StockService } from '../../services/stock.service';
import { SearchService } from '../../services/search.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

export type DateRangePreset = 'today' | '7d' | '30d' | 'month' | 'custom';

interface KPICard {
  title: string;
  value: string | number;
  trend?: number;
  icon: string; // Material Symbols name
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  sparkline: number[];
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
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Para SSR: Chart.js usa canvas; en server no existe. Renderizamos charts solo en browser.
  isBrowser = false;

  // Para usar Math.* en templates Angular
  Math = Math;
  // State
  loading = true;
  error = '';
  currentDate = '';
  private destroy$ = new Subject<void>();

  // Header controls
  rangePreset: DateRangePreset = '30d';
  searchQuery = '';

  // KPI Cards
  kpiCards: KPICard[] = [];

  // KPI sparklines (Chart.js)
  kpiSparkOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.35, borderWidth: 2 },
      point: { radius: 0, hitRadius: 6, hoverRadius: 3 }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  // Mock mensual (últimos 6 meses - datos del enunciado)
  monthlyChartLabels: string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  monthlySalesData: number[] = [32000, 35000, 31000, 42000, 39000, 47000];
  monthlyPurchasesData: number[] = [21000, 24000, 20000, 26000, 25000, 29000];

  // Derived
  monthlyProfitData: number[] = [];

  // Charts (Chart.js / ng2-charts)
  mainComboChartData?: ChartData<'bar'>;
  mainComboChartOptions?: ChartConfiguration<'bar'>['options'];

  salesByCategoryData?: ChartData<'doughnut'>;
  salesByCategoryOptions?: ChartConfiguration<'doughnut'>['options'];

  topProductsData?: ChartData<'bar'>;
  topProductsOptions?: ChartConfiguration<'bar'>['options'];

  grossMarginByProductData?: ChartData<'bar'>;
  grossMarginByProductOptions?: ChartConfiguration<'bar'>['options'];

  // Lists (mock/real)
  recentPurchases: RecentPurchase[] = [];
  lowStockProducts: LowStockProduct[] = [];

  // Mock adicionales
  recentSales: Array<{ number: string; customer: string; total: number; status: 'Pendiente' | 'Pagado' | 'Cancelado'; created_at: string }> = [];

  // Warehouse ID (default: main warehouse)
  private warehouseId = 'bbbbbbbb-0000-0000-0000-000000000001';

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService,
    private stockService: StockService,
    private searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

    // ✅ Mock derivado
    this.monthlyProfitData = this.monthlySalesData.map((v, i) => v - (this.monthlyPurchasesData[i] ?? 0));

    // ✅ Construir charts apenas inicia (no depende de API)
    //    pero solo en browser (SSR no soporta canvas).
    if (this.isBrowser) {
      this.buildCharts();
    }

    Promise.all([this.loadKPIs(), this.loadRecentPurchases(), this.loadLowStockProducts(), this.loadRecentSalesMock()])
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
    this.kpiCards = [];

    return Promise.all([
      // Productos registrados (real)
      new Promise<void>(resolve => {
        this.productsService.getProducts().subscribe({
          next: products => {
            const activeProducts = products.filter(p => p.is_active).length;

            this.kpiCards.push({
              title: 'Productos registrados',
              value: activeProducts,
              icon: 'inventory_2',
              color: 'info',
              trend: 5,
              sparkline: [20, 24, 22, 26, 25, 28, 30]
            });
            resolve();
          },
          error: () => {
            this.kpiCards.push({
              title: 'Productos registrados',
              value: 0,
              icon: 'inventory_2',
              color: 'info',
              sparkline: [0, 0, 0, 0, 0, 0, 0]
            });
            resolve();
          }
        });
      }),

      // Ventas Totales (mock mensual enunciado)
      new Promise<void>(resolve => {
        const totalSales = this.monthlySalesData.reduce((a, b) => a + b, 0);
        this.kpiCards.push({
          title: 'Ventas totales',
          value: `S/ ${totalSales.toLocaleString('es-PE')}`,
          icon: 'trending_up',
          color: 'success',
          trend: 12,
          sparkline: [32, 35, 31, 42, 39, 47, 49]
        });
        resolve();
      }),

      // Compras Totales (mock mensual enunciado)
      new Promise<void>(resolve => {
        const totalPurchases = this.monthlyPurchasesData.reduce((a, b) => a + b, 0);
        this.kpiCards.push({
          title: 'Compras totales',
          value: `S/ ${totalPurchases.toLocaleString('es-PE')}`,
          icon: 'shopping_cart',
          color: 'warning',
          trend: -3,
          sparkline: [21, 24, 20, 26, 25, 29, 28]
        });
        resolve();
      }),

      // Utilidad bruta (derivada)
      new Promise<void>(resolve => {
        const totalProfit = this.monthlyProfitData.reduce((a, b) => a + b, 0);
        this.kpiCards.push({
          title: 'Utilidad bruta',
          value: `S/ ${totalProfit.toLocaleString('es-PE')}`,
          icon: 'savings',
          color: 'primary',
          trend: 8,
          sparkline: [11, 11, 11, 16, 14, 18, 19]
        });
        resolve();
      }),

      // Stock bajo (real)
      new Promise<void>(resolve => {
        // Se llenará cuando loadLowStockProducts termine, pero ponemos placeholder elegante
        this.kpiCards.push({
          title: 'Stock bajo',
          value: '—',
          icon: 'warning',
          color: 'danger',
          trend: -2,
          sparkline: [9, 8, 7, 7, 6, 5, 5]
        });
        resolve();
      }),

      // Pedidos pendientes (mock)
      new Promise<void>(resolve => {
        this.kpiCards.push({
          title: 'Pedidos pendientes',
          value: 7,
          icon: 'assignment_late',
          color: 'primary',
          trend: -4,
          sparkline: [10, 9, 8, 7, 7, 7, 6]
        });
        resolve();
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
      // El endpoint actual expone /inventory/stock/current y NO incluye sku/name/min_stock.
      // Para el dashboard (mock/placeholder), seguimos calculando "stock bajo" usando solo quantity_on_hand.
      this.stockService.getStockCurrent(this.warehouseId).subscribe({
        next: (items: InventoryStockCurrentItem[]) => {
          const minStockDefault = 10;

          // Consideramos "stock bajo" cuando qty <= minStockDefault (regla simple)
          const low = items.filter(i => i.quantity_on_hand <= minStockDefault);

          this.lowStockProducts = low.slice(0, 8).map(i => ({
            name: i.product_id, // placeholder (no tenemos name en este endpoint)
            sku: i.product_id,  // placeholder
            current_stock: i.quantity_on_hand,
            min_stock: minStockDefault,
            product_id: i.product_id
          }));

          // ✅ Update KPI "Stock bajo"
          const idx = this.kpiCards.findIndex(k => k.title === 'Stock bajo');
          if (idx >= 0) {
            this.kpiCards[idx] = {
              ...this.kpiCards[idx],
              value: this.lowStockProducts.length
            };
          }

          resolve();
        },
        error: (err: unknown) => {
          console.error('Error loading low stock products:', err);
          this.lowStockProducts = [];
          const idx = this.kpiCards.findIndex(k => k.title === 'Stock bajo');
          if (idx >= 0) this.kpiCards[idx] = { ...this.kpiCards[idx], value: 0 };
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

  getKpiSparkData(card: KPICard): ChartData<'line'> {
    const color = this.getKpiColorHex(card.color);
    const fill = this.toRgba(color, 0.18);

    return {
      labels: card.sparkline.map((_, i) => String(i + 1)),
      datasets: [
        {
          data: card.sparkline,
          borderColor: color,
          backgroundColor: fill,
          fill: true
        }
      ]
    };
  }

  private getKpiColorHex(color: KPICard['color']): string {
    switch (color) {
      case 'success':
        return '#16a34a';
      case 'warning':
        return '#f59e0b';
      case 'danger':
        return '#dc2626';
      case 'info':
        return '#0ea5e9';
      case 'primary':
      default:
        return '#2563eb';
    }
  }

  private toRgba(hex: string, alpha: number): string {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  onPresetChange(preset: DateRangePreset): void {
    this.rangePreset = preset;
    // En un siguiente paso: recalcular data según rango.
  }

  onSearch(): void {
    // Integración con buscador global existente
    this.searchService.setSearchTerm(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.setSearchTerm('');
  }

  private loadRecentSalesMock(): Promise<void> {
    return new Promise(resolve => {
      this.recentSales = [
        { number: 'V-000145', customer: 'Inversiones Rivera SAC', total: 1240.5, status: 'Pagado', created_at: new Date().toISOString() },
        { number: 'V-000146', customer: 'Comercial El Norte EIRL', total: 860, status: 'Pendiente', created_at: new Date(Date.now() - 86400000).toISOString() },
        { number: 'V-000147', customer: 'Distribuidora San Martín', total: 420.9, status: 'Cancelado', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
        { number: 'V-000148', customer: 'Retail Andes', total: 2310.0, status: 'Pagado', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
        { number: 'V-000149', customer: 'Minimarket Las Flores', total: 315.25, status: 'Pendiente', created_at: new Date(Date.now() - 4 * 86400000).toISOString() }
      ];
      resolve();
    });
  }

  private buildCharts(): void {
    const colors = {
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#f59e0b',
      danger: '#dc2626',
      slate: '#64748b',
      grid: '#e2e8f0'
    };

    // =========================
    // Combo: Ventas/Compras (bar) + Utilidad (line)
    // =========================
    this.mainComboChartData = {
      labels: this.monthlyChartLabels,
      datasets: [
        {
          label: 'Ventas',
          data: this.monthlySalesData,
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          borderRadius: 8,
          barThickness: 18,
          order: 2
        },
        {
          label: 'Compras',
          data: this.monthlyPurchasesData,
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderRadius: 8,
          barThickness: 18,
          order: 3
        },
        {
          // Line over bars (supported via Chart.js dataset props)
          type: 'line',
          label: 'Utilidad',
          data: this.monthlyProfitData,
          borderColor: colors.success,
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          pointBackgroundColor: colors.success,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
          order: 1
        } as any
      ]
    };

    this.mainComboChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'start', labels: { color: '#0f172a', boxWidth: 10, boxHeight: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const label = ctx.dataset.label ?? '';
              const v = Number((ctx as any).parsed?.y ?? 0);
              return `${label}: S/ ${v.toLocaleString('es-PE')}`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: colors.slate }, grid: { display: false } },
        y: {
          ticks: {
            color: colors.slate,
            callback: value => `S/ ${Math.round(Number(value) / 1000)}k`
          },
          grid: { color: colors.grid }
        }
      }
    };

    // =========================
    // Donut: Ventas por categoría
    // =========================
    this.salesByCategoryData = {
      labels: ['Bebidas', 'Alimentos', 'Limpieza'],
      datasets: [
        {
          data: [44, 38, 18],
          backgroundColor: [colors.primary, colors.success, '#0ea5e9'],
          borderWidth: 0,
          hoverOffset: 6
        }
      ]
    };

    this.salesByCategoryOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#0f172a', boxWidth: 10, boxHeight: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed}%`
          }
        }
      },
      cutout: '72%'
    };

    // =========================
    // Top 10 productos más vendidos (horizontal bar)
    // =========================
    const topProductsLabels = ['Coca Cola 500ml', 'Arroz 1kg', 'Agua 650ml', 'Detergente 1L', 'Azúcar 1kg', 'Leche 1L', 'Aceite 1L', 'Pan molde', 'Galletas', 'Atún'];

    this.topProductsData = {
      labels: topProductsLabels,
      datasets: [
        {
          label: 'Unidades',
          data: [120, 110, 98, 92, 86, 78, 72, 66, 60, 54],
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          borderRadius: 8,
          barThickness: 14
        }
      ]
    };

    this.topProductsOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { ticks: { color: colors.slate }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.slate }, grid: { display: false } }
      }
    };

    // =========================
    // Margen bruto por producto (horizontal bar)
    // =========================
    const marginLabels = ['Coca Cola', 'Agua', 'Detergente', 'Arroz', 'Azúcar', 'Leche', 'Aceite', 'Atún', 'Galletas', 'Pan'];

    this.grossMarginByProductData = {
      labels: marginLabels,
      datasets: [
        {
          label: '% Margen',
          data: [32, 28, 25, 24, 22, 20, 19, 18, 16, 15],
          backgroundColor: 'rgba(22, 163, 74, 0.85)',
          borderRadius: 8,
          barThickness: 14
        }
      ]
    };

    this.grossMarginByProductOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x}%`
          }
        }
      },
      scales: {
        x: { ticks: { color: colors.slate }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.slate }, grid: { display: false } }
      }
    };
  }

  retry(): void {
    this.loadDashboardData();
  }
}
