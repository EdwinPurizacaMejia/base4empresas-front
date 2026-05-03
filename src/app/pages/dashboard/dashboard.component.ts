import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { ChartConfiguration } from 'chart.js';

interface DashboardCard {
  title: string;
  icon: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  loading?: boolean;
  trend?: number;
}

interface MonthlyData {
  month: string;
  sales: number;
  purchases: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // KPI Cards
  cards: DashboardCard[] = [];
  currentDate: string = '';
  
  // Chart Data
  monthlySalesData: MonthlyData[] = [];
  productCategories: string[] = [];
  productCounts: number[] = [];
  salesTrendData: number[] = [];
  
  // Chart Configurations
  salesLineChartConfig: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Ventas Mensuales',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'Compras Mensuales',
          data: [],
          borderColor: '#764ba2',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#764ba2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#667eea'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  };

  productCategoryChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Productos por Categoría',
          data: [],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(23, 162, 184, 0.8)'
          ],
          borderColor: [
            '#667eea',
            '#764ba2',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#17a2b8'
          ],
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#667eea'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  };

  revenueChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Ventas', 'Compras', 'Otros'],
      datasets: [
        {
          data: [],
          backgroundColor: ['#667eea', '#764ba2', '#17a2b8'],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  loading = true;
  error = '';

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Cargar datos en paralelo
    Promise.all([
      this.loadProducts(),
      this.loadSales(),
      this.loadPurchases(),
      this.loadChartData()
    ])
      .then(() => {
        this.loading = false;
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Error al cargar datos del dashboard';
        this.loading = false;
      });
  }

  private loadProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.productsService.getProducts().subscribe({
        next: (data) => {
          const totalProducts = data.length;
          this.cards.push({
            title: 'Total Productos',
            icon: '📦',
            value: totalProducts,
            subtitle: 'En el sistema',
            color: 'blue',
            trend: 5
          });
          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Total Productos',
            icon: '📦',
            value: 0,
            color: 'blue'
          });
          resolve();
        }
      });
    });
  }

  private loadSales(): Promise<void> {
    return new Promise((resolve) => {
      this.salesService.getSales().subscribe({
        next: (data) => {
          const totalSales = data.reduce((sum, sale) => sum + (sale.total || 0), 0);
          this.cards.push({
            title: 'Ventas Totales',
            icon: '💵',
            value: `S/${totalSales.toFixed(2)}`,
            subtitle: `${data.length} transacciones`,
            color: 'green',
            trend: 12
          });
          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Ventas Totales',
            icon: '💵',
            value: 'S/0.00',
            color: 'green'
          });
          resolve();
        }
      });
    });
  }

  private loadPurchases(): Promise<void> {
    return new Promise((resolve) => {
      this.purchaseService.getPurchases().subscribe({
        next: (data) => {
          const totalPurchases = data.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
          this.cards.push({
            title: 'Compras Totales',
            icon: '🛒',
            value: `S/${totalPurchases.toFixed(2)}`,
            subtitle: `${data.length} órdenes`,
            color: 'orange',
            trend: 8
          });

          // Cuarta tarjeta: Margen de Ganancia
          const sales = this.cards.find(c => c.title === 'Ventas Totales');
          if (sales) {
            const salesValue = parseFloat(String(sales.value).replace('S/', '')) || 0;
            const margin = ((salesValue - totalPurchases) / salesValue * 100) || 0;
            this.cards.push({
              title: 'Margen de Ganancia',
              icon: '📈',
              value: `${margin.toFixed(1)}%`,
              subtitle: 'Margen actual',
              color: 'purple',
              trend: 3
            });
          }

          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Compras Totales',
            icon: '🛒',
            value: 'S/0.00',
            color: 'orange'
          });
          resolve();
        }
      });
    });
  }

  private loadChartData(): Promise<void> {
    return new Promise((resolve) => {
      // Simular datos mensuales para gráficos
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      const salesData = [15000, 18000, 22000, 19000, 25000, 28000];
      const purchasesData = [8000, 9000, 11000, 10000, 12000, 14000];

      // Actualizar gráfico de línea
      this.salesLineChartConfig.data.labels = months;
      this.salesLineChartConfig.data.datasets[0].data = salesData;
      this.salesLineChartConfig.data.datasets[1].data = purchasesData;

      // Datos para gráfico de barras (categorías de productos)
      this.productCategoryChartConfig.data.labels = [
        'Electrónica',
        'Ropa',
        'Alimentos',
        'Muebles',
        'Libros',
        'Otros'
      ];
      this.productCategoryChartConfig.data.datasets[0].data = [45, 38, 52, 28, 35, 22];

      // Datos para gráfico doughnut
      const totalSales = salesData.reduce((a, b) => a + b, 0);
      const totalPurchases = purchasesData.reduce((a, b) => a + b, 0);
      const others = totalSales * 0.15;
      this.revenueChartConfig.data.datasets[0].data = [totalSales, totalPurchases, others];

      resolve();
    });
  }

  getCardClass(card: DashboardCard): string {
    return `card-${card.color}`;
  }

  getTrendClass(trend?: number): string {
    if (!trend) return '';
    return trend > 0 ? 'trend-up' : 'trend-down';
  }

  getTrendIcon(trend?: number): string {
    if (!trend) return '';
    return trend > 0 ? '↑' : '↓';
  }

  getBarWidth(dataValue: any): number {
    if (typeof dataValue !== 'number') return 0;
    return (dataValue / 52) * 100;
  }
}
