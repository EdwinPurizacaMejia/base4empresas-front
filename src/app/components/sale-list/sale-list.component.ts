import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SalesService } from '../../services/sales.service';
import { SaleFormComponent } from '../sale-form/sale-form.component';
import { SaleListItem } from '../../models/sale.model';
import { GenericDataTableComponent, TableConfig } from '../generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, SaleFormComponent, GenericDataTableComponent],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  sales: SaleListItem[] = [];
  loading = true;
  error = '';
  showForm = false;
  successMessage = '';

  tableConfig: TableConfig = {
    columns: [
      { key: 'number', label: 'Número', sortable: true, width: '120px' },
      { key: 'created_at', label: 'Fecha', type: 'date', sortable: true, width: '160px' },
      { key: 'customer_id', label: 'Cliente', sortable: true, formatter: (val) => val || '-' },
      { key: 'warehouse_id', label: 'Almacén', sortable: true },
      { key: 'status', label: 'Estado', type: 'badge', sortable: true, width: '100px', formatter: (val) => this.getStatusLabel(val) },
      { key: 'payment_status', label: 'Pago', type: 'badge', sortable: true, width: '100px', formatter: (val) => this.getPaymentStatusLabel(val) },
      { key: 'total', label: 'Total', type: 'currency', sortable: true, width: '130px' }
    ],
    actions: [
      { id: 'view', label: 'Ver detalle', icon: 'visibility' },
      { id: 'edit', label: 'Editar', icon: 'edit' },
      { id: 'delete', label: 'Eliminar', icon: 'delete', color: 'danger' }
    ],
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showSearch: true,
    searchPlaceholder: 'Buscar por número o cliente...'
  };

  constructor(
    private salesService: SalesService,
    private router: Router
  ) {}

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

    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.error = '';
    this.salesService.getSales().subscribe({
      next: (data) => {
        // Filtrar localmente si hay término de búsqueda
        if (searchTerm) {
          this.sales = data.filter(s =>
            s.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.customer_id && s.customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        } else {
          this.sales = data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al buscar ventas';
        this.loading = false;
      }
    });
  }

  onTableAction(event: { action: string; row: SaleListItem }): void {
    switch (event.action) {
      case 'view':
        this.onViewSale(event.row);
        break;
      case 'edit':
        this.onEditSale(event.row);
        break;
      case 'delete':
        this.onDeleteSale(event.row);
        break;
    }
  }

  onViewSale(sale: SaleListItem): void {
    this.router.navigate(['/sales', sale.id]);
  }

  onEditSale(sale: SaleListItem): void {
    console.log('Editar venta:', sale);
  }

  onDeleteSale(sale: SaleListItem): void {
    if (confirm(`¿Estás seguro de eliminar la venta N°${sale.number}?`)) {
      console.log('Eliminar venta:', sale);
    }
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
