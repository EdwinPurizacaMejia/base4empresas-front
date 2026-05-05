/**
 * EJEMPLO DE INTEGRACIÓN: Sale List Component
 * 
 * Este archivo muestra cómo adaptar el componente sale-list
 * para usar la tabla genérica con Material Design
 * 
 * Pasos:
 * 1. Copiar esta estructura base
 * 2. Adaptar columnas y acciones según el modelo
 * 3. Importar SaleListItem del modelo
 * 4. Reemplazar template HTML
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { SaleListItem } from '../../models/sale.model';
import { SalesService } from '../../services/sales.service';
import { GenericDataTableComponent, TableConfig } from '../generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    GenericDataTableComponent
  ],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1 class="title">Ventas</h1>
          <p class="subtitle">Gestiona los registros de ventas</p>
        </div>
        <button class="btn-primary" (click)="onNewSale()">
          <mat-icon>add</mat-icon>
          Nueva venta
        </button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Data Table -->
      <app-generic-data-table
        [data]="sales"
        [config]="tableConfig"
        [loading]="loading"
        [error]="error"
        [totalItems]="sales.length"
        (actionClick)="onTableAction($event)"
        (searchChange)="onSearch($event)"
      ></app-generic-data-table>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      gap: 20px;
    }

    .title {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #111827;
    }

    .subtitle {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #6b7280;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .alert {
      padding: 14px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
      animation: slideDown 0.3s ease;
    }

    .alert-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .btn-primary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SaleListComponent implements OnInit {
  // ========== DATA ==========
  sales: SaleListItem[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // ========== TABLE CONFIG ==========
  tableConfig: TableConfig = {
    columns: [
      {
        key: 'number',
        label: 'Número de Venta',
        sortable: true,
        width: '120px'
      },
      {
        key: 'customer_id',
        label: 'Cliente',
        sortable: true,
        formatter: (value) => value || 'Cliente No Asignado'
      },
      {
        key: 'warehouse_id',
        label: 'Almacén',
        sortable: true
      },
      {
        key: 'total',
        label: 'Total',
        type: 'currency',
        sortable: true,
        width: '130px'
      },
      {
        key: 'created_at',
        label: 'Fecha',
        type: 'date',
        sortable: true,
        width: '120px'
      },
      {
        key: 'payment_status',
        label: 'Pago',
        type: 'badge',
        sortable: true,
        formatter: (value) => {
          if (value === 'paid') return 'Pagado';
          if (value === 'pending') return 'Pendiente';
          return 'Parcial';
        }
      }
    ],
    actions: [
      {
        id: 'view',
        label: 'Ver detalle',
        icon: 'visibility'
      },
      {
        id: 'print',
        label: 'Imprimir',
        icon: 'print'
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: 'edit',
        show: (row) => {
          // Solo permitir edición si no está cerrada
          return row.status !== 'closed';
        }
      },
      {
        id: 'delete',
        label: 'Cancelar',
        icon: 'delete_sweep',
        color: 'danger',
        show: (row) => {
          // Solo permitir cancelación si está pendiente
          return row.status === 'pending';
        }
      }
    ],
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showSearch: true,
    searchPlaceholder: 'Buscar por número de venta o cliente...'
  };

  // ========== CONSTRUCTOR ==========
  constructor(
    private salesService: SalesService,
    private router: Router
  ) {}

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    this.loadSales();
  }

  // ========== DATA LOADING ==========
  loadSales(): void {
    this.loading = true;
    this.error = null;

    this.salesService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales:', err);
        this.error = 'Error al cargar ventas. Intenta nuevamente.';
        this.sales = [];
        this.loading = false;
      }
    });
  }

  // ========== SEARCH ==========
  onSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.loadSales();
      return;
    }

    this.loading = true;
    this.error = null;

    this.salesService.getSales(searchTerm).subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching sales:', err);
        this.error = 'Error al buscar ventas.';
        this.loading = false;
      }
    });
  }

  // ========== ACTIONS ==========
  onNewSale(): void {
    this.router.navigate(['/sales/new']);
  }

  onTableAction(event: { action: string; row: SaleListItem }): void {
    const { action, row } = event;

    switch (action) {
      case 'view':
        this.onViewSale(row);
        break;
      case 'print':
        this.onPrintSale(row);
        break;
      case 'edit':
        this.onEditSale(row);
        break;
      case 'delete':
        this.onCancelSale(row);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  private onViewSale(sale: SaleListItem): void {
    this.router.navigate(['/sales', sale.id]);
  }

  private onPrintSale(sale: SaleListItem): void {
    // Implementar lógica de impresión
    console.log('Print sale:', sale.number);
    window.print();
  }

  private onEditSale(sale: SaleListItem): void {
    this.router.navigate(['/sales', sale.id, 'edit']);
  }

  private onCancelSale(sale: SaleListItem): void {
    if (confirm(`¿Cancelar venta ${sale.number}?`)) {
      // Implementar lógica de cancelación
      this.salesService.cancelSale(sale.id).subscribe({
        next: () => {
          this.successMessage = '✓ Venta cancelada exitosamente';
          this.loadSales();
          setTimeout(() => {
            this.successMessage = null;
          }, 4000);
        },
        error: (err) => {
          this.error = 'Error al cancelar la venta.';
        }
      });
    }
  }
}

/**
 * PASOS PARA ADAPTARLO A TU PROYECTO:
 * 
 * 1. IMPORTES:
 *    - Cambiar SaleListItem por tu modelo
 *    - Cambiar SalesService por tu servicio
 * 
 * 2. COLUMNAS:
 *    - Actualizar 'key' según los campos de tu modelo
 *    - Ajustar 'type' (currency, date, badge, etc)
 *    - Añadir 'formatter' si necesitas transformar datos
 * 
 * 3. ACCIONES:
 *    - Mantener solo las que necesites
 *    - Usar 'show' para mostrar acciones condicionalmente
 *    - Implementar los métodos onView, onEdit, onDelete
 * 
 * 4. BÚSQUEDA:
 *    - Adaptar onSearch() para tu backend
 *    - Considerar debounce para muchas búsquedas
 * 
 * 5. CSS:
 *    - El componente usa Material, CSS mínimo necesario
 *    - Solo styles específicos del container
 * 
 * EJEMPLO DE INTEGRACIÓN COMPLETA:
 * - products-list.component.ts (ya implementado ✓)
 * - Esta estructura puede reutilizarse en:
 *   - purchase-list
 *   - sale-list (este ejemplo)
 *   - stock-list
 *   - kardex-list
 */
