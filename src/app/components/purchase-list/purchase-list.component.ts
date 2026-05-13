import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
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
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PurchaseFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.scss'
})
export class PurchaseListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  purchases: PurchaseListItem[] = [];
  private allPurchases: PurchaseListItem[] = [];
  dataSource = new MatTableDataSource<PurchaseListItem>([]);
  displayedColumns = ['number', 'created_at', 'supplier_id', 'status', 'total', 'actions'];
  loading = false;
  error: string | null = null;
  showForm = false;
  private destroy$ = new Subject<void>();
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private purchaseService: PurchaseService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchases();

    // Suscribirse al buscador global
    this.searchService.searchTerm$Debounced
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
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
        this.error = 'Error al cargar compras. Intenta nuevamente.';
        this.purchases = [];
        this.allPurchases = [];
        this.dataSource.data = [];
        this.loading = false;
        this.notificationService.error('Error al cargar compras. Por favor, intenta nuevamente.');
      }
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
      const filtered = this.allPurchases.filter(purchase =>
        purchase.number.toLowerCase().includes(term) ||
        purchase.supplier_id.toLowerCase().includes(term)
      );
      this.dataSource.data = filtered;
      this.purchases = filtered;
      console.log(`🔍 Compras filtradas: ${filtered.length} de ${this.allPurchases.length}`);
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'completed': return 'primary';
      case 'cancelled': return 'danger';
      default: return 'primary';
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

  onNewPurchase(): void {
    this.showForm = true;
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
    this.router.navigate(['/purchases', purchase.id]);
  }

  onEditPurchase(purchase: PurchaseListItem): void {
    console.log('Editar compra:', purchase);
    // TODO: Implementar edición en modal
  }

  onDeletePurchase(purchase: PurchaseListItem): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la compra "${purchase.number}"?`)) {
      console.log('Eliminar compra:', purchase);
      this.notificationService.warning('Compra marcada para eliminar (función en desarrollo)');
      // TODO: Implementar eliminación en servicio
    }
  }
}
