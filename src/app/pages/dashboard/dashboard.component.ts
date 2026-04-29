import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';

interface DashboardCard {
  title: string;
  icon: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cards: DashboardCard[] = [];
  loading = true;
  error = '';

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Cargar datos en paralelo
    Promise.all([
      this.loadProducts(),
      this.loadSales(),
      this.loadPurchases()
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
            color: 'blue'
          });
          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Total Productos',
            icon: '📦',
            value: '-',
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
          const totalSales = data.reduce((sum, sale) => sum + sale.total, 0);
          this.cards.push({
            title: 'Total Ventas',
            icon: '💰',
            value: `S/${totalSales.toFixed(2)}`,
            subtitle: `${data.length} transacciones`,
            color: 'green'
          });
          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Total Ventas',
            icon: '💰',
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
            title: 'Total Compras',
            icon: '🛒',
            value: `S/${totalPurchases.toFixed(2)}`,
            subtitle: `${data.length} pedidos`,
            color: 'orange'
          });
          resolve();
        },
        error: () => {
          this.cards.push({
            title: 'Total Compras',
            icon: '🛒',
            value: 'S/0.00',
            color: 'orange'
          });
          resolve();
        }
      });
    });
  }

  getCardClass(card: DashboardCard): string {
    return `card-${card.color}`;
  }
}
