import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  productId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;

    // Simulación: en producción, obtendría del servicio
    // Por ahora, usamos los productos del listado
    this.productsService.getProducts().subscribe({
      next: (products) => {
        const found = products.find((p) => p.id === id);
        if (found) {
          this.product = found;
          this.loading = false;
        } else {
          this.error = 'Producto no encontrado';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al cargar el producto';
        this.loading = false;
        this.notificationService.error('Error al cargar el producto');
      },
    });
  }

  onEdit(): void {
    if (this.product) {
      this.router.navigate(['/productos'], {
        queryParams: { editId: this.product.id },
      });
      this.notificationService.info('Abriendo editor...');
    }
  }

  onGoBack(): void {
    this.router.navigate(['/productos']);
  }

  onRetry(): void {
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Activo' : 'Inactivo';
  }

  getStatusColor(status: boolean): string {
    return status ? 'primary' : 'accent';
  }
}
