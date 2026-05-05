import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { NotificationService } from '../../services/notification.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { GenericDataTableComponent, TableConfig, TableAction } from '../generic-data-table/generic-data-table.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PurchaseFormComponent,
    GenericDataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
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

  constructor(
    private purchaseService: PurchaseService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

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
        if (data.length === 0) {
          this.notificationService.info('No hay compras registradas');
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar compras. Intenta nuevamente.';
        this.purchases = [];
        this.loading = false;
        this.notificationService.error('Error al cargar compras. Por favor, intenta nuevamente.');
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
    this.notificationService.success('✓ Compra registrada exitosamente');
    this.loadPurchases();
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
        if (this.purchases.length === 0 && searchTerm) {
          this.notificationService.info(`No se encontraron compras para "${searchTerm}"`);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al buscar compras.';
        this.loading = false;
        this.notificationService.error('Error al buscar compras. Por favor, intenta nuevamente.');
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
    this.router.navigate(['/purchases', purchase.id]);
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
