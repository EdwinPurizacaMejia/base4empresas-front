import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { GenericDataTableComponent, TableConfig, TableAction } from '../generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductFormComponent,
    GenericDataTableComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  successMessage: string | null = null;

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

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar productos. Intenta nuevamente.';
        this.products = [];
        this.loading = false;
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(searchTerm || undefined).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al buscar productos.';
        this.loading = false;
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
    console.log('View product:', product);
  }

  onEditProduct(product: Product): void {
    console.log('Edit product:', product);
    // TODO: Implementar edición
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      console.log('Delete product:', product);
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
    this.successMessage = '✓ Producto creado exitosamente';
    this.loadProducts();

    setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }
}
