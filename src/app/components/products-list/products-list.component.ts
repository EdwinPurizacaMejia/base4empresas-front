import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { GenericDataTableComponent, TableConfig, TableAction } from '../generic-data-table/generic-data-table.component';
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
    ProductFormComponent,
    GenericDataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  private allProducts: Product[] = []; // Copia de todos los productos sin filtrar
  loading = false;
  error: string | null = null;
  showForm = false;
  successMessage: string | null = null;
  private destroy$ = new Subject<void>();

  tableConfig: TableConfig = {
    columns: [
      { key: 'sku', label: 'SKU', sortable: true, width: '120px' },
      { key: 'name', label: 'Producto', sortable: true },
      { key: 'sale_price', label: 'Precio Venta', type: 'currency', sortable: true, width: '130px' },
      { key: 'purchase_price', label: 'Precio Compra', type: 'currency', sortable: true, width: '130px' },
      { key: 'min_stock', label: 'Stock Mín.', type: 'number', sortable: true, width: '100px' },
      { key: 'is_active', label: 'Estado', type: 'badge', sortable: true, width: '100px' }
    ],
    actions: [
      {
        id: 'view',
        label: 'Ver detalle',
        icon: 'visibility'
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: 'edit'
      },
      {
        id: 'delete',
        label: 'Eliminar',
        icon: 'delete',
        color: 'danger'
      }
    ],
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showSearch: true,
    searchPlaceholder: 'Buscar por nombre o SKU...'
  };

  constructor(
    private productService: ProductsService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router
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
      this.products = [...this.allProducts];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.products = this.allProducts.filter(product =>
        product.sku.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term)
      );
      console.log(`🔍 Productos filtrados: ${this.products.length} de ${this.allProducts.length}`);
    }
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(searchTerm || undefined).subscribe({
      next: (data) => {
        this.products = data;
        this.allProducts = data;
        this.loading = false;
        if (data.length === 0) {
          this.notificationService.info(`No se encontraron productos para "${searchTerm}"`);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al buscar productos.';
        this.loading = false;
        this.notificationService.error('Error al buscar productos. Por favor, intenta nuevamente.');
      }
    });
  }

  onTableAction(event: { action: string; row: Product }): void {
    switch (event.action) {
      case 'view':
        this.onViewProduct(event.row);
        break;
      case 'edit':
        this.onEditProduct(event.row);
        break;
      case 'delete':
        this.onDeleteProduct(event.row);
        break;
    }
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  onEditProduct(product: Product): void {
    console.log('Edit product:', product);
    // TODO: Implementar edición
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      console.log('Delete product:', product);
      this.notificationService.warning('Producto marcado para eliminar (función en desarrollo)');
      // TODO: Implementar eliminación
    }
  }

  onNewProduct(): void {
    this.showForm = true;
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onProductCreated(): void {
    this.showForm = false;
    this.notificationService.success('✓ Producto creado exitosamente');
    this.loadProducts();
  }
}
