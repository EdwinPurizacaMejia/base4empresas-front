import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/supplier.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PurchaseFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AppCurrencyPipe,
  ],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.scss',
})
export class PurchaseListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  purchases: PurchaseListItem[] = [];
  private allPurchases: PurchaseListItem[] = [];
  dataSource = new MatTableDataSource<PurchaseListItem>([]);
  private suppliersById = new Map<string, Supplier>();
  displayedColumns = [
    'number',
    'created_at',
    'supplier_id',
    'status',
    'total',
    'actions',
  ];
  loading = false;
  error: string | null = null;
  showForm = false;
  private destroy$ = new Subject<void>();
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private purchaseService: PurchaseService,
    private suppliersService: SuppliersService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadPurchases();

    // Suscribirse al buscador global
    this.searchService.searchTerm$Debounced
      .pipe(takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSuppliers(): void {
    this.suppliersService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliersById = new Map((suppliers ?? []).map((s) => [s.id, s]));
      },
      error: (err) => {
        console.error(err);
        // No bloquea la pantalla si proveedores falla; solo caerá a mostrar el ID.
      },
    });
  }

  getSupplierName(purchase: PurchaseListItem): string {
    return (
      purchase.supplier?.business_name ??
      this.suppliersById.get(purchase.supplier_id)?.business_name ??
      purchase.supplier_id
    );
  }

  getPurchaseDate(purchase: PurchaseListItem): string | null {
    return purchase.purchase_date ?? purchase.created_at ?? null;
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.allPurchases = data;
        this.purchases = data;
        this.dataSource.data = data;
        this.loading = false;
        if (data.length === 0) {
          this.notificationService.info('No hay compras registradas');
        }
      },
      error: (err) => {
        console.error(err);
        const errorMsg =
          err.userMessage || 'Error al cargar compras. Intenta nuevamente.';
        this.error = errorMsg;
        this.purchases = [];
        this.allPurchases = [];
        this.dataSource.data = [];
        this.loading = false;
        this.notificationService.error(errorMsg);
      },
    });
  }

  /**
   * Aplica el filtro de búsqueda global a las compras
   */
  private applyFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.dataSource.data = [...this.allPurchases];
      this.purchases = [...this.allPurchases];
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = this.allPurchases.filter(
        (purchase) =>
          purchase.number.toLowerCase().includes(term) ||
          purchase.supplier_id.toLowerCase().includes(term),
      );
      this.dataSource.data = filtered;
      this.purchases = filtered;
      console.log(
        `🔍 Compras filtradas: ${filtered.length} de ${this.allPurchases.length}`,
      );
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Completada';
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  }

  onNewPurchase(): void {
    const dialogRef = this.dialog.open(PurchaseFormComponent, {
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
        this.notificationService.success('Compra registrada exitosamente');
        this.loadPurchases();
      }
    });
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onPurchaseCreated(): void {
    this.showForm = false;
    this.notificationService.success('Compra registrada exitosamente');
    this.loadPurchases();
  }

  onViewPurchase(purchase: PurchaseListItem): void {
    this.router.navigate(['/compras', purchase.id]);
  }

  onEditPurchase(purchase: PurchaseListItem): void {
    // Importante: el listado no trae items. Para editar necesitamos el detalle.
    this.purchaseService.getPurchaseById(purchase.id).subscribe({
      next: (detail) => {
        const dialogRef = this.dialog.open(PurchaseFormComponent, {
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
          data: { purchase: detail },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === true) {
            this.notificationService.success('Compra actualizada exitosamente');
            this.loadPurchases();
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error(
          err.userMessage || 'No se pudo cargar el detalle de la compra para editar.',
        );
      },
    });
  }

  onDeletePurchase(purchase: PurchaseListItem): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la compra "${purchase.number}"?`,
      )
    ) {
      console.log('Eliminar compra:', purchase);
      this.notificationService.warning(
        'Compra marcada para eliminar (función en desarrollo)',
      );
      // TODO: Implementar eliminación en servicio
    }
  }
}
