import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StockListComponent } from './components/stock-list/stock-list.component';
import { KardexComponent } from './components/kardex/kardex.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { SaleListComponent } from './components/sale-list/sale-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProductsListComponent, StockListComponent, KardexComponent, PurchaseListComponent, SaleListComponent],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <nav class="app-nav">
        <button 
          class="nav-btn" 
          [class.active]="currentView === 'products'"
          (click)="currentView = 'products'"
        >
          📦 Productos
        </button>
        <button 
          class="nav-btn"
          [class.active]="currentView === 'stock'"
          (click)="currentView = 'stock'"
        >
          📊 Inventario
        </button>
        <button 
          class="nav-btn"
          [class.active]="currentView === 'kardex'"
          (click)="currentView = 'kardex'"
        >
          📋 Kardex
        </button>
        <button 
          class="nav-btn"
          [class.active]="currentView === 'purchases'"
          (click)="currentView = 'purchases'"
        >
          🛒 Compras
        </button>
        <button 
          class="nav-btn"
          [class.active]="currentView === 'sales'"
          (click)="currentView = 'sales'"
        >
          💰 Ventas
        </button>
      </nav>

      <!-- Views -->
      <div class="app-content">
        <app-products-list *ngIf="currentView === 'products'"></app-products-list>
        <app-stock-list *ngIf="currentView === 'stock'"></app-stock-list>
        <app-kardex *ngIf="currentView === 'kardex'"></app-kardex>
        <app-purchase-list *ngIf="currentView === 'purchases'"></app-purchase-list>
        <app-sale-list *ngIf="currentView === 'sales'"></app-sale-list>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #ffffff;
    }

    .app-nav {
      display: flex;
      gap: 0;
      background-color: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
      padding: 0;
      margin: 0;
      overflow-x: auto;
    }

    .nav-btn {
      padding: 16px 24px;
      border: none;
      background-color: transparent;
      color: #718096;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
    }

    .nav-btn:hover {
      color: #2d3748;
      background-color: #edf2f7;
    }

    .nav-btn.active {
      color: #3182ce;
      border-bottom-color: #3182ce;
      background-color: white;
    }

    .app-content {
      min-height: calc(100vh - 53px);
    }

    @media (max-width: 768px) {
      .nav-btn {
        padding: 12px 16px;
        font-size: 13px;
      }
    }
  `]
})
export class AppComponent {
  title = 'base4empresas';
  currentView: 'products' | 'stock' | 'kardex' | 'purchases' | 'sales' = 'products';
}



