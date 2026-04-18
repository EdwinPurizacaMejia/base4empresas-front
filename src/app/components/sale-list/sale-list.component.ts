import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../services/sales.service';
import { SaleFormComponent } from '../sale-form/sale-form.component';
import { SaleListItem } from '../../models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, SaleFormComponent],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  sales: SaleListItem[] = [];
  loading = true;
  error = '';
  showForm = false;
  successMessage = '';

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.error = '';
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las ventas';
        this.loading = false;
      }
    });
  }

  onCreateSale(): void {
    this.showForm = true;
  }

  onSaleCreated(): void {
    this.showForm = false;
    this.successMessage = 'Venta registrada exitosamente';
    this.loadSales();

    // Auto-hide success message
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Completada';
    }
  }

  getPaymentStatusLabel(status?: string): string {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'pending':
        return 'Pendiente';
      case 'partial':
        return 'Parcial';
      default:
        return 'Pendiente';
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
