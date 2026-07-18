import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SalesService } from '../../services/sales.service';
import { SearchService } from '../../services/search.service';
import { SaleFormComponent } from '../sale-form/sale-form.component';
import { SaleListItem } from '../../models/sale.model';
import { GenericDataTableComponent, TableConfig } from '../generic-data-table/generic-data-table.component';
import { WarehouseService } from '../../services/warehouse.service';
import { SuppliersService } from '../../services/suppliers.service';
import { ElectronicDocumentsService } from '../../services/electronic-documents.service';
import { GenerateDocumentDialogComponent, GenerateDocumentDialogResult } from '../electronic-documents/generate-document-dialog.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, GenericDataTableComponent],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit, OnDestroy {
  sales: SaleListItem[] = [];
  private allSales: SaleListItem[] = []; // Copia de todas las ventas sin filtrar
  loading = true;
  error = '';
  showForm = false;
  successMessage = '';
  private destroy$ = new Subject<void>();

  // Lookups para mostrar nombres en vez de IDs
  private warehouseNameById: Record<string, string> = {};
  // Re-usa suppliers como “clientes” temporalmente si el backend usa la misma entidad.
  // Si luego existe CustomersService, solo se cambia aquí.
  private customerNameById: Record<string, string> = {};

  tableConfig: TableConfig = {
    columns: [
      { key: 'number', label: 'Número', sortable: true, width: '120px' },
      { key: 'sale_date', label: 'Fecha', type: 'date', sortable: true, width: '160px' },
      {
        key: 'customer_id',
        label: 'Cliente',
        sortable: true,
        formatter: (val) => this.getCustomerLabel(val),
      },
      {
        key: 'warehouse_id',
        label: 'Almacén',
        sortable: true,
        formatter: (val) => this.getWarehouseLabel(val),
      },
      { key: 'status', label: 'Estado', sortable: true, width: '100px', formatter: (val) => this.getStatusLabel(val) },
      { key: 'total', label: 'Total', type: 'currency', sortable: true, width: '130px' },
      {
        key: 'cost_total',
        label: 'Costo total',
        type: 'currency',
        sortable: true,
        width: '130px',
        formatter: (val) => (val === null || val === undefined ? '—' : val),
      },
      {
        key: 'gross_profit',
        label: 'Utilidad',
        type: 'currency',
        sortable: true,
        width: '130px',
        formatter: (val) => (val === null || val === undefined ? '—' : val),
      },
      {
        key: 'gross_margin_pct',
        label: 'Margen %',
        sortable: true,
        width: '110px',
        formatter: (val) => (val === null || val === undefined ? '—' : `${Number(val).toFixed(2)}%`),
      }
    ],
    actions: [
      { id: 'view', label: 'Ver detalle', icon: 'visibility' },
      { id: 'edit', label: 'Editar', icon: 'edit' },
      { id: 'generate_doc', label: 'Generar Comprobante', icon: 'receipt_long', color: 'primary' },
      { id: 'delete', label: 'Eliminar', icon: 'delete', color: 'danger' }
    ],
    actionsDisplay: 'buttons',
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showSearch: false,
    searchPlaceholder: 'Buscar por número o cliente...'
  };

  constructor(
    private salesService: SalesService,
    private searchService: SearchService,
    private warehouseService: WarehouseService,
    private suppliersService: SuppliersService,
    private electronicDocumentsService: ElectronicDocumentsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadSales();

    // Suscribirse al buscador global
    this.searchService.searchTerm$Debounced
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.applyFilter(term);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLookups(): void {
    forkJoin({
      warehouses: this.warehouseService.getWarehouses({ isActive: true }),
      // OJO: si luego existe CustomersService, reemplazar esta llamada.
      customers: this.suppliersService.getSuppliers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ warehouses, customers }) => {
          this.warehouseNameById = Object.fromEntries((warehouses ?? []).map((w: any) => [w.id, w.name]));
          this.customerNameById = Object.fromEntries(
            (customers ?? []).map((c: any) => [c.id, c.business_name || c.name || c.id]),
          );
        },
        error: () => {
          // silencioso: si falla, se mostrará el ID como fallback
          this.warehouseNameById = {};
          this.customerNameById = {};
        },
      });
  }

  private getWarehouseLabel(id: any): string {
    if (!id) return '—';
    return this.warehouseNameById[String(id)] || String(id);
  }

  private getCustomerLabel(id: any): string {
    if (!id) return '—';
    return this.customerNameById[String(id)] || String(id);
  }

  loadSales(): void {
    this.loading = true;
    this.error = '';
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.allSales = data;
        this.sales = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las ventas';
        this.loading = false;
        this.allSales = [];
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda global a las ventas
   */
  private applyFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.sales = [...this.allSales];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.sales = this.allSales.filter(sale =>
        sale.number.toLowerCase().includes(term) ||
        (sale.customer_id && sale.customer_id.toLowerCase().includes(term))
      );
      console.log(`🔍 Ventas filtradas: ${this.sales.length} de ${this.allSales.length}`);
    }
  }

  onCreateSale(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '760px',
      minWidth: '300px',
      maxWidth: '95vw',
      height: 'auto',
      minHeight: '400px',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'crm-dialog-panel',
      backdropClass: 'crm-dialog-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.successMessage = 'Venta registrada exitosamente';
        this.loadSales();

        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      }
    });
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
        this.allSales = data;
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
      case 'generate_doc':
        this.onGenerateElectronicDocument(event.row);
        break;
      case 'delete':
        this.onDeleteSale(event.row);
        break;
    }
  }

  onGenerateElectronicDocument(sale: SaleListItem): void {
    const dialogRef = this.dialog.open(GenerateDocumentDialogComponent, {
      width: '440px',
      disableClose: false,
      data: { saleNumber: sale.number },
    });

    dialogRef.afterClosed().subscribe((result: GenerateDocumentDialogResult | undefined) => {
      if (!result) return;

      const typeLabels: Record<string, string> = {
        invoice: 'Factura/Boleta',
        credit_note: 'Nota de Crédito',
        debit_note: 'Nota de Débito',
      };
      const tipoLabel = typeLabels[result.documentType] || result.documentType;

      this.electronicDocumentsService.createFromSale(sale.id, result.documentType).subscribe({
        next: (doc) => {
          this.successMessage = `✔ ${tipoLabel} ${doc.full_number || ''} generada correctamente (estado: ${doc.status})`;
          setTimeout(() => { this.successMessage = ''; }, 6000);
          this.snackBar.open(
            `${tipoLabel} ${doc.full_number || 'creada'} — emítela desde el detalle de venta`,
            'Ver',
            { duration: 6000, panelClass: 'snack-success' }
          );
        },
        error: (err) => {
          const msg = err?.error?.detail || 'Error al generar el comprobante';
          this.snackBar.open(`Error: ${msg}`, 'Cerrar', { duration: 8000, panelClass: 'snack-error' });
        }
      });
    });
  }

  onViewSale(sale: SaleListItem): void {
    this.router.navigate(['/ventas/ventas', sale.id]);
  }

  onEditSale(sale: SaleListItem): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '760px',
      minWidth: '300px',
      maxWidth: '95vw',
      height: 'auto',
      minHeight: '400px',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'crm-dialog-panel',
      backdropClass: 'crm-dialog-backdrop',
      data: { sale }, // ← pasa la venta para modo edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.successMessage = 'Venta actualizada exitosamente';
        this.loadSales();
        setTimeout(() => { this.successMessage = ''; }, 4000);
      }
    });
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
