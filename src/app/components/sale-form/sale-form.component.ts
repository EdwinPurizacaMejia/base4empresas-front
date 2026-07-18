import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  Optional,
  Inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { Subject, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  catchError,
} from "rxjs/operators";

import { SalesService } from "../../services/sales.service";
import { WarehouseService } from "../../services/warehouse.service";
import { CustomersService } from "../../services/customers.service";
import { ProductsService } from "../../services/products.service";
import { SaleCreate, SaleListItem, SaleUpdate } from "../../models/sale.model";
import { Warehouse } from "../../models/warehouse.model";
import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";

@Component({
  selector: "app-sale-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./sale-form.component.html",
  styleUrls: ["./sale-form.component.scss"],
})
export class SaleFormComponent implements OnInit, OnDestroy {
  @Output() saleCreated = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  /** Modo edición: true cuando se pasa una venta existente via data.sale */
  isEditMode = false;

  form!: FormGroup;
  loading = false;
  errorMessage = "";
  successMessage = "";

  // ── Autocomplete: Almacén ────────────────────────────────────────────────
  warehouseSearch = new FormControl("");
  filteredWarehouses: Warehouse[] = [];
  loadingWarehouses = false;

  // ── Autocomplete: Cliente ────────────────────────────────────────────────
  customerSearch = new FormControl("");
  filteredCustomers: Customer[] = [];
  loadingCustomers = false;

  // ── Autocomplete: Productos (uno por item del array) ─────────────────────
  productSearchControls: FormControl[] = [];
  filteredProducts: Product[][] = [];
  loadingProducts: boolean[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private warehouseService: WarehouseService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private dialogRef: MatDialogRef<SaleFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { sale?: SaleListItem }
  ) {
    this.isEditMode = !!data?.sale;
    this.initForm();
  }

  ngOnInit(): void {
    this.setupWarehouseAutocomplete();
    this.setupCustomerAutocomplete();
    this.setupProductAutocomplete(0);

    // Pre-llenar formulario si es modo edición
    if (this.isEditMode && this.data?.sale) {
      this.prefillForm(this.data.sale);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Inicialización del formulario ─────────────────────────────────────────

  private initForm(): void {
    this.form = this.fb.group({
      customer_id: ["", []],
      warehouse_id: ["", this.isEditMode ? [] : [Validators.required]],
      notes: ["", []],
      items: this.fb.array(
        [this.createItemControl()],
        [Validators.required, Validators.minLength(1)]
      ),
    });
    this.productSearchControls = [new FormControl("")];
    this.filteredProducts = [[]];
    this.loadingProducts = [false];
  }

  /** Pre-llena el formulario con los datos de la venta a editar */
  private prefillForm(sale: SaleListItem): void {
    // Campos de cabecera
    this.form.patchValue({
      customer_id: sale.customer_id ?? "",
      warehouse_id: sale.warehouse_id,
      notes: sale.notes ?? "",
    });

    // Pre-cargar items si la venta tiene items
    const saleItems = (sale as any).items ?? [];
    if (saleItems.length > 0) {
      // Limpiar el array y recrear con los items existentes
      this.items.clear();
      this.productSearchControls = [];
      this.filteredProducts = [];
      this.loadingProducts = [];

      saleItems.forEach((item: any, i: number) => {
        this.items.push(this.fb.group({
          product_id: [item.product_id ?? "", [Validators.required]],
          quantity: [item.quantity ?? 1, [Validators.required, Validators.min(1)]],
          unit_price: [item.unit_price ?? 0, [Validators.required, Validators.min(0)]],
        }));
        this.productSearchControls.push(new FormControl(""));
        this.filteredProducts.push([]);
        this.loadingProducts.push(false);
        setTimeout(() => this.setupProductAutocomplete(i), 0);

        // Cargar el nombre del producto para mostrar en el autocomplete
        if (item.product_id) {
          const idx = i;
          this.productsService.getProductById(item.product_id)
            .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
            .subscribe(product => {
              if (product) {
                const label = product.name || product.sku || item.product_id;
                this.productSearchControls[idx].setValue(label, { emitEvent: false });
              }
            });
        }
      });
    }

    // Cargar los labels del cliente y almacén para el autocomplete
    if (sale.customer_id) {
      this.customersService.getCustomerById(sale.customer_id)
        .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
        .subscribe(customer => {
          if (customer) {
            const label = customer.full_name || customer.business_name || customer.document_number;
            this.customerSearch.setValue(label ?? "", { emitEvent: false });
          }
        });
    }
    if (sale.warehouse_id) {
      this.warehouseService.getWarehouseById(sale.warehouse_id)
        .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
        .subscribe(warehouse => {
          if (warehouse) {
            this.warehouseSearch.setValue(warehouse.name, { emitEvent: false });
          }
        });
    }
  }

  private createItemControl(): FormGroup {
    return this.fb.group({
      product_id: ["", [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  // ── Autocomplete: Almacén ─────────────────────────────────────────────────

  private setupWarehouseAutocomplete(): void {
    this.warehouseSearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loadingWarehouses = true;
          return this.warehouseService
            .getWarehouses({ search: term || "", isActive: true })
            .pipe(catchError(() => of([])));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((warehouses) => {
        this.filteredWarehouses = warehouses as Warehouse[];
        this.loadingWarehouses = false;
      });

    this.warehouseService
      .getWarehouses({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((w) => (this.filteredWarehouses = w));
  }

  onWarehouseSelected(warehouse: Warehouse): void {
    this.form.get("warehouse_id")?.setValue(warehouse.id);
    this.warehouseSearch.setValue(warehouse.name, { emitEvent: false });
  }

  // ── Autocomplete: Cliente ─────────────────────────────────────────────────

  private setupCustomerAutocomplete(): void {
    this.customerSearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loadingCustomers = true;
          return this.customersService
            .getCustomers({ search: term || "" })
            .pipe(catchError(() => of([])));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((customers) => {
        this.filteredCustomers = customers as Customer[];
        this.loadingCustomers = false;
      });

    this.customersService
      .getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((c) => (this.filteredCustomers = c));
  }

  onCustomerSelected(customer: Customer): void {
    this.form.get("customer_id")?.setValue(customer.id);
    const label = customer.full_name || customer.business_name || customer.document_number;
    this.customerSearch.setValue(label ?? "", { emitEvent: false });
  }

  getCustomerLabel(customer: Customer): string {
    const name = customer.full_name || customer.business_name || "";
    const doc = customer.document_number ? ` (${customer.document_number})` : "";
    return `${name}${doc}`.trim();
  }

  // ── Autocomplete: Productos ───────────────────────────────────────────────

  private setupProductAutocomplete(index: number): void {
    const ctrl = this.productSearchControls[index];
    if (!ctrl) return;

    ctrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loadingProducts[index] = true;
          return this.productsService
            .getProducts({ search: term || "", isActive: true })
            .pipe(catchError(() => of([])));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((products) => {
        this.filteredProducts[index] = products as Product[];
        this.loadingProducts[index] = false;
      });

    this.productsService
      .getProducts({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => (this.filteredProducts[index] = p));
  }

  onProductSelected(product: Product, index: number): void {
    const itemGroup = this.items.at(index) as FormGroup;
    itemGroup.get("product_id")?.setValue(product.id);
    const price = (product as any).sale_price ?? (product as any).price ?? 0;
    if (price > 0) {
      itemGroup.get("unit_price")?.setValue(price);
    }
    const label = product.name || product.sku;
    this.productSearchControls[index].setValue(label, { emitEvent: false });
  }

  getProductLabel(product: Product): string {
    return product.sku ? `${product.name} (${product.sku})` : product.name;
  }

  // ── FormArray helpers ─────────────────────────────────────────────────────

  get items(): FormArray {
    return this.form.get("items") as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemControl());
    const idx = this.items.length - 1;
    this.productSearchControls.push(new FormControl(""));
    this.filteredProducts.push([]);
    this.loadingProducts.push(false);
    setTimeout(() => this.setupProductAutocomplete(idx), 0);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.productSearchControls.splice(index, 1);
      this.filteredProducts.splice(index, 1);
      this.loadingProducts.splice(index, 1);
    }
  }

  // ── Cálculos ──────────────────────────────────────────────────────────────

  get calculateTotal(): number {
    return this.items.controls.reduce((total, control) => {
      if (control instanceof FormGroup) {
        const qty = control.get("quantity")?.value || 0;
        const price = control.get("unit_price")?.value || 0;
        return total + qty * price;
      }
      return total;
    }, 0);
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index) as FormGroup;
    const qty = item.get("quantity")?.value || 0;
    const price = item.get("unit_price")?.value || 0;
    return qty * price;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    if (this.isEditMode && this.data?.sale) {
      // Modo edición: PATCH /sales/{id}
      const payload: SaleUpdate = {
        customer_id: this.form.get("customer_id")?.value || null,
        notes: this.form.get("notes")?.value || null,
        items: this.items.value,
      };

      this.salesService.updateSale(this.data.sale.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.saleCreated.emit();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          const status = error?.status;
          const detail = error?.error?.detail;
          if (status === 409) {
            this.errorMessage = detail || "No se pueden modificar los items: existe comprobante electrónico emitido o stock insuficiente.";
          } else if ((status === 400 || status === 422) && detail) {
            this.errorMessage = String(detail);
          } else {
            this.errorMessage = "Error al actualizar la venta. Intenta de nuevo.";
          }
        },
      });
    } else {
      // Modo creación: POST /sales
      const payload: SaleCreate = {
        customer_id: this.form.get("customer_id")?.value || null,
        warehouse_id: this.form.get("warehouse_id")?.value,
        notes: this.form.get("notes")?.value || null,
        items: this.items.value,
      };

      this.salesService.createSale(payload).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = `Venta ${response.number} registrada. Total: S/${response.total.toFixed(2)}`;
          this.resetForm();
          this.saleCreated.emit();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          const status = error?.status;
          const detail = error?.error?.detail;
          if (status === 409) {
            this.errorMessage = "Stock insuficiente para completar la venta.";
          } else if ((status === 400 || status === 422) && detail) {
            this.errorMessage = String(detail);
          } else {
            this.errorMessage = "Error al registrar la venta. Intenta de nuevo.";
          }
        },
      });
    }
  }

  onCancel(): void {
    this.resetForm();
    this.formClosed.emit();
    this.dialogRef.close(false);
  }

  private resetForm(): void {
    this.form.reset();
    this.items.clear();
    this.items.push(this.createItemControl());
    this.warehouseSearch.setValue("");
    this.customerSearch.setValue("");
    this.productSearchControls = [new FormControl("")];
    this.filteredProducts = [[]];
    this.loadingProducts = [false];
    this.errorMessage = "";
    this.successMessage = "";
    setTimeout(() => this.setupProductAutocomplete(0), 0);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((ctrl) => ctrl.markAsTouched());
    this.items.controls.forEach((item) => {
      if (item instanceof FormGroup) {
        Object.values(item.controls).forEach((ctrl) => ctrl.markAsTouched());
      }
    });
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Venta' : 'Nueva Venta';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Guardar Cambios' : 'Guardar Venta';
  }
}
