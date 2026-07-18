import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { KardexService } from '../../services/kardex.service';
import { SearchService } from '../../services/search.service';
import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { Warehouse } from '../../models/warehouse.model';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryService } from '../../services/inventory.service';
import { InventoryKardexLine, InventoryValuationResponse } from '../../models/inventory.model';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit, OnDestroy {
  movements: InventoryKardexLine[] = [];
  private allMovements: InventoryKardexLine[] = []; // Copia de todos los movimientos sin filtrar

  // Valorización a fecha
  valuationAt = '';
  valuationResult: InventoryValuationResponse | null = null;
  valuationLoading = false;

  // Selects
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productSearch = '';
  selectedProductId = '';

  warehouses: Warehouse[] = [];
  selectedWarehouseId = '';

  loading = false;
  loadingProducts = false;
  loadingWarehouses = false;
  error: string | null = null;
  initialLoad = true;

  private destroy$ = new Subject<void>();

  constructor(
    private kardexService: KardexService,
    private inventoryService: InventoryService,
    private searchService: SearchService,
    private productsService: ProductsService,
    private warehouseService: WarehouseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Cargar almacenes desde API
    this.loadWarehouses();

    // Producto preseleccionado desde stock-list (ver query param product_id)
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const productId = params.get('product_id') || '';
      if (productId) {
        this.selectedProductId = productId;
      }

      // Si ya tenemos ambos seleccionados, cargar automáticamente
      if (this.selectedProductId && this.selectedWarehouseId) {
        this.loadKardex();
      }
    });

    // Cargar productos para el select con búsqueda
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
    this.loadingProducts = true;

    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.filteredProducts = [...this.products];
        this.loadingProducts = false;

        // Si vino preseleccionado y existe, setear texto de búsqueda para mostrar nombre
        if (this.selectedProductId) {
          const found = this.products.find(p => p.id === this.selectedProductId);
          if (found) {
            this.productSearch = found.name;
            this.filteredProducts = [found, ...this.products.filter(p => p.id !== found.id)];
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingProducts = false;
        // No bloquea: aún se puede consultar pegando IDs si se quisiera (aunque ya no se muestra input)
        this.error = 'No se pudo cargar la lista de productos.';
      }
    });
  }

  loadWarehouses(): void {
    this.loadingWarehouses = true;

    this.warehouseService.getWarehouses().subscribe({
      next: (data) => {
        // Mostrar solo activos
        this.warehouses = (data || []).filter(w => w.is_active);
        this.loadingWarehouses = false;

        // Preseleccionar el último usado si sigue existiendo
        if (typeof localStorage !== 'undefined') {
          const lastWarehouseId = localStorage.getItem('lastWarehouseId') || '';
          if (lastWarehouseId && this.warehouses.some(w => w.id === lastWarehouseId)) {
            this.selectedWarehouseId = lastWarehouseId;
          }
        }

        // Si ya hay producto seleccionado, autocargar
        if (this.selectedProductId && this.selectedWarehouseId) {
          this.loadKardex();
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingWarehouses = false;
        this.warehouses = [];
        this.error = 'No se pudo cargar la lista de almacenes.';
      }
    });
  }

  onProductSearchChange(value: string): void {
    this.productSearch = value;

    const term = value.toLowerCase().trim();
    if (!term) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(p =>
      (p.name || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  }

  onSelectProduct(productId: string): void {
    this.selectedProductId = productId;

    const found = this.products.find(p => p.id === productId);
    if (found) {
      this.productSearch = found.name;
    }

    // Autocargar si ya hay almacén
    if (this.selectedWarehouseId) {
      this.loadKardex();
    }
  }

  onSelectWarehouse(warehouseId: string): void {
    this.selectedWarehouseId = warehouseId;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastWarehouseId', warehouseId);
    }

    // Autocargar si ya hay producto
    if (this.selectedProductId) {
      this.loadKardex();
    }
  }

  loadKardex(): void {
    if (!this.selectedProductId.trim()) {
      this.error = 'Selecciona un producto';
      this.movements = [];
      this.allMovements = [];
      return;
    }

    if (!this.selectedWarehouseId.trim()) {
      this.error = 'Selecciona un almacén';
      this.movements = [];
      this.allMovements = [];
      return;
    }

    this.loading = true;
    this.error = null;
    this.initialLoad = false;
    this.valuationResult = null;

    this.kardexService
      .getKardex({
        warehouseId: this.selectedWarehouseId,
        productId: this.selectedProductId,
      })
      .subscribe({
        next: (data) => {
          this.allMovements = data || [];
          this.movements = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al cargar kardex. Verifica los datos e intenta nuevamente.';
          this.movements = [];
          this.allMovements = [];
          this.loading = false;
        },
      });
  }

  /**
   * Aplica el filtro de búsqueda global a los movimientos del kardex
   */
  private applyFilter(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.movements = [...this.allMovements];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.movements = this.allMovements.filter(movement => {
        const createdAt = (movement.created_at || '').toLowerCase();
        const reason = (movement.reason || '').toLowerCase();
        const referenceId = (movement.reference_id || '').toLowerCase();
        const movementType = (movement.movement_type || '').toLowerCase();
        const productName = (movement.product_name || '').toLowerCase();
        const productSku = (movement.product_sku || '').toLowerCase();

        return (
          createdAt.includes(term) ||
          reason.includes(term) ||
          referenceId.includes(term) ||
          movementType.includes(term) ||
          productName.includes(term) ||
          productSku.includes(term)
        );
      });
      console.log(`🔍 Movimientos filtrados: ${this.movements.length} de ${this.allMovements.length}`);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.loadKardex();
    }
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  get totalIn(): number {
    return this.movements.reduce(
      (sum, m) => sum + (m.movement_type === 'IN' ? this.toNumber(m.quantity) : 0),
      0
    );
  }

  get totalOut(): number {
    return this.movements.reduce(
      (sum, m) => sum + (m.movement_type === 'OUT' ? this.toNumber(m.quantity) : 0),
      0
    );
  }

  get balance(): number {
    return this.totalIn - this.totalOut;
  }

  get totalInValue(): number {
    return this.movements.reduce(
      (sum, m) => sum + (m.movement_type === 'IN' ? this.toNumber(m.line_value) : 0),
      0
    );
  }

  get totalOutValue(): number {
    return this.movements.reduce(
      (sum, m) => sum + (m.movement_type === 'OUT' ? this.toNumber(m.line_value) : 0),
      0
    );
  }

  onValuationAtDate(): void {
    if (!this.selectedProductId.trim()) {
      this.error = 'Selecciona un producto';
      return;
    }
    if (!this.selectedWarehouseId.trim()) {
      this.error = 'Selecciona un almacén';
      return;
    }
    if (!this.valuationAt.trim()) {
      this.error = 'Selecciona una fecha para valorar';
      return;
    }

    this.valuationLoading = true;
    this.error = null;

    const atIso = new Date(this.valuationAt).toISOString();

    this.inventoryService.getValuationAt(this.selectedWarehouseId, this.selectedProductId, atIso).subscribe({
      next: (data) => {
        this.valuationResult = data;
        this.valuationLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.valuationResult = null;
        this.valuationLoading = false;
        this.error = 'Error al valorizar. Verifica los datos e intenta nuevamente.';
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  getMovementTypeLabel(type: string): string {
    return type === 'IN' ? 'Entrada' : 'Salida';
  }

  getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'PURCHASE': 'Compra',
      'SALE': 'Venta',
      'ADJUSTMENT': 'Ajuste',
      'RETURN': 'Devolución',
      'OTHER': 'Otro'
    };
    return labels[reason] || reason;
  }
}
