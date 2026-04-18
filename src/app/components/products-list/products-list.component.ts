import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductFormComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];
  search = '';
  loading = false;
  error: string | null = null;
  searchInput = '';
  showForm = false;
  successMessage: string | null = null;

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.search = this.searchInput;

    this.productService.getProducts(this.search).subscribe({
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

  onSearch(): void {
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchInput = '';
    this.search = '';
    this.loadProducts();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
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

    // Limpiar mensaje de éxito después de 4 segundos
    setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }
}
