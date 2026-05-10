import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ProductFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  products: Product[] = [];
  private allProducts: Product[] = [];
  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns = ['sku', 'name', 'category', 'unit', 'sale_price', 'purchase_price', 'min_stock', 'is_active', 'actions'];
  loading = false;
  error: string | null = null;
  showForm = false;
  private destroy$ = new Subject<void>();
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private productService: ProductsService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();

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

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.products = data;
        this.dataSource.data = data;
        this.loading = false;
        if (data.length === 0) {
          this.notificationService.info('No hay productos registrados');
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar productos. Intenta nuevamente.';
        this.products = [];
        this.allProducts = [];
        this.dataSource.data = [];
        this.loading = false;
        this.notificationService.error('Error al cargar productos. Por favor, intenta nuevamente.');
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda global a los productos
   */
  private applyFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.dataSource.data = [...this.allProducts];
      this.products = [...this.allProducts];
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = this.allProducts.filter(product =>
        product.sku.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term)
      );
      this.dataSource.data = filtered;
      this.products = filtered;
      console.log(`🔍 Productos filtrados: ${filtered.length} de ${this.allProducts.length}`);
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  onNewProduct(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      minWidth: '300px',
      maxWidth: '90vw',
      height: 'auto',
      minHeight: '400px',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'crm-dialog-panel',
      backdropClass: 'crm-dialog-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadProducts();
        this.notificationService.success('Producto creado exitosamente');
      }
    });
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onProductCreated(): void {
    this.loadProducts();
    this.showForm = false;
    this.notificationService.success('Producto creado exitosamente');
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/productos', product.id]);
  }

  onEditProduct(product: Product): void {
    console.log('Edit product:', product);
    // TODO: Implementar edición en modal
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      console.log('Delete product:', product);
      this.notificationService.warning('Producto marcado para eliminar (función en desarrollo)');
      // TODO: Implementar eliminación en servicio
    }
  }
}
