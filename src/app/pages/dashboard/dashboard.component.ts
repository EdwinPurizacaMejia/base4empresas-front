import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js
Chart.register(...registerables);

interface KPICard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  backgroundColor?: string;
}

interface SalesData {
  month: string;
  sales: number;
  purchases: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // KPI Cards
  kpiCards: KPICard[] = [];
  
  // Charts data
  salesData: SalesData[] = [];
  
  // Chart references
  salesChart: Chart | null = null;
  categoryChart: Chart | null = null;
  
  // Loading and error states
  loading = true;
  error = '';
  currentDate: string = '';
  
  // Stats from services
  totalSalesThisMonth = 0;
  totalPurchasesThisMonth = 0;
  activeProducts = 0;
  lowStockProducts = 0;

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadDashboardData();
  }

  private setCurrentDate(): void {
    this.currentDate = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.loadProducts(),
      this.loadSales(),
      this.loadPurchases()
    ])
      .then(() => {
        this.initializeKPICards();
        this.generateMockSalesData();
        setTimeout(() => this.initializeCharts(), 100);
        this.loading = false;
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
        this.loadMockData();
        this.loading = false;
      });
  }

  private loadProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.productsService.getProducts().subscribe({
        next: (data) => {
          this.activeProducts = data?.length || 0;
          this.lowStockProducts = Math.ceil((data?.length || 0) * 0.12);
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }

  private loadSales(): Promise<void> {
    return new Promise((resolve) => {
      this.salesService.getSales().subscribe({
        next: (data) => {
          this.totalSalesThisMonth = data?.reduce((sum, sale: any) => sum + (sale.total || 0), 0) || 0;
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }

  private loadPurchases(): Promise<void> {
    return new Promise((resolve) => {
      this.purchaseService.getPurchases().subscribe({
        next: (data) => {
          this.totalPurchasesThisMonth = data?.reduce((sum, purchase: any) => sum + (purchase.total || 0), 0) || 0;
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }

  private loadMockData(): void {
    this.activeProducts = 156;
    this.lowStockProducts = 18;
    this.totalSalesThisMonth = 45230;
    this.totalPurchasesThisMonth = 28150;
    this.initializeKPICards();
    this.generateMockSalesData();
    setTimeout(() => this.initializeCharts(), 100);
  }

  private generateMockSalesData(): void {
    this.salesData = [
      { month: 'Enero', sales: 4200, purchases: 3800 },
      { month: 'Febrero', sales: 5800, purchases: 4200 },
      { month: 'Marzo', sales: 4500, purchases: 3900 },
      { month: 'Abril', sales: 6200, purchases: 4800 },
      { month: 'Mayo', sales: 7100, purchases: 5200 },
      { month: 'Junio', sales: 6500, purchases: 4900 }
    ];
  }

  private initializeKPICards(): void {
    this.kpiCards = [
      {
        title: 'Ingresos Totales',
        value: this.formatCurrency(this.totalSalesThisMonth),
        change: 12.5,
        changeType: 'increase',
        icon: 'trending_up',
        color: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)'
      },
      {
        title: 'Gastos Totales',
        value: this.formatCurrency(this.totalPurchasesThisMonth),
        change: -5.2,
        changeType: 'decrease',
        icon: 'trending_down',
        color: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)'
      },
      {
        title: 'Productos en Stock',
        value: this.activeProducts,
        change: 8.1,
        changeType: 'increase',
        icon: 'inventory_2',
        color: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)'
      },
      {
        title: 'Stock Crítico',
        value: this.lowStockProducts,
        change: 2.3,
        changeType: 'increase',
        icon: 'warning',
        color: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)'
      }
    ];
  }

  private initializeCharts(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createSalesChart();
      this.createCategoryChart();
    }
  }

  private createSalesChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.salesData.map(d => d.month),
        datasets: [
          {
            label: 'Ventas',
            data: this.salesData.map(d => d.sales),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#667eea'
          },
          {
            label: 'Compras',
            data: this.salesData.map(d => d.purchases),
            borderColor: '#764ba2',
            backgroundColor: 'rgba(118, 75, 162, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#764ba2',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#764ba2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 13,
                weight: 500
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    this.salesChart = new Chart(ctx, chartConfig);
  }

  private createCategoryChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Otros'],
        datasets: [
          {
            data: [28, 22, 18, 20, 12],
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#43e97b'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          }
        }
      }
    };

    this.categoryChart = new Chart(ctx, chartConfig);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getChangeIcon(changeType?: string): string {
    switch (changeType) {
      case 'increase':
        return 'arrow_upward';
      case 'decrease':
        return 'arrow_downward';
      default:
        return 'remove';
    }
  }

  getIconEmoji(iconName: string): string {
    const emojiMap: { [key: string]: string } = {
      'trending_up': '📈',
      'trending_down': '📉',
      'inventory_2': '📦',
      'warning': '⚠️',
      'arrow_upward': '↑',
      'arrow_downward': '↓'
    };
    return emojiMap[iconName] || '•';
  }

  ngOnDestroy(): void {
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
  }
}

