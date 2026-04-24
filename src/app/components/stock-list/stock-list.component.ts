import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock.service';

type StockStatus = 'ok' | 'warning' | 'critical';

interface StockWithStatus extends Stock {
  status: StockStatus;
  percentage: number;
}

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent implements OnInit {

  stocks: StockWithStatus[] = [];
  warehouseId = '';
  loading = false;
  error: string | null = null;
  initialLoad = true;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    // Cargar warehouse por defecto si lo hay
    if (typeof localStorage !== 'undefined') {
      this.warehouseId = localStorage.getItem('lastWarehouseId') || '';
      if (this.warehouseId) {
        this.loadStock();
      }
    }
  }

  loadStock(): void {
    if (!this.warehouseId.trim()) {
      this.error = 'Por favor ingresa un ID de almacén';
      this.stocks = [];
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
        this.stocks = data.map(stock => ({
          ...stock,
          status: this.getStockStatus(stock.stock, stock.min_stock),
          percentage: this.getStockPercentage(stock.stock, stock.min_stock)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = `Error al cargar stock del almacén. Verifica el ID e intenta nuevamente.`;
        this.stocks = [];
        this.loading = false;
      }
    });
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

  onViewKardex(product: Stock): void {
    // TODO: Implementar navegación a kardex
    console.log('Ver kardex del producto:', product.product_id, product.sku);
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
