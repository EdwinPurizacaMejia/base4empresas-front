import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { GenericDataTableComponent, TableConfig, TableAction } from '../generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PurchaseFormComponent, GenericDataTableComponent],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit {

  purchases: PurchaseListItem[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  successMessage: string | null = null;

  tableConfig: TableConfig = {
    columns: [
      { key: 'number', label: 'Número', sortable: true, width: '120px' },
      { key: 'created_at', label: 'Fecha', type: 'date', sortable: true, width: '160px' },
      { key: 'supplier_id', label: 'Proveedor', sortable: true, formatter: (val) => val?.substring(0, 8) + '...' },
      { key: 'warehouse_id', label: 'Almacén', sortable: true, formatter: (val) => val?.substring(0, 8) + '...' },
      { key: 'status', label: 'Estado', type: 'badge', sortable: true, width: '100px', formatter: (val) => this.getStatusLabel(val) },
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
    searchPlaceholder: 'Buscar por número o proveedor...'
  };

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar compras. Intenta nuevamente.';
        this.purchases = [];
        this.loading = false;
      }
    });
  }

  onNewPurchase(): void {
    this.showForm = true;
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onPurchaseCreated(): void {
    this.showForm = false;
    this.successMessage = '✓ Compra registrada exitosamente';
    this.loadPurchases();

    setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        // Filtrar localmente si hay término de búsqueda
        if (searchTerm) {
          this.purchases = data.filter(p =>
            p.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier_id.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          this.purchases = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al buscar compras.';
        this.loading = false;
      }
    });
  }

  onTableAction(event: { action: string; row: PurchaseListItem }): void {
    switch (event.action) {
      case 'view':
        this.onViewPurchase(event.row);
        break;
      case 'edit':
        this.onEditPurchase(event.row);
        break;
      case 'delete':
        this.onDeletePurchase(event.row);
        break;
    }
  }

  onViewPurchase(purchase: PurchaseListItem): void {
    console.log('Ver detalle de compra:', purchase);
  }

  onEditPurchase(purchase: PurchaseListItem): void {
    console.log('Editar compra:', purchase);
  }

  onDeletePurchase(purchase: PurchaseListItem): void {
    if (confirm(`¿Estás seguro de eliminar la compra N°${purchase.number}?`)) {
      console.log('Eliminar compra:', purchase);
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Completada';
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }
}
