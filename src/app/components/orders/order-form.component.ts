import { Component, OnInit, OnDestroy, Optional, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Subject, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from "rxjs/operators";
import { OrdersService } from "../../services/orders.service";
import { CustomersService } from "../../services/customers.service";
import { ProductsService } from "../../services/products.service";
import { SalesChannelsService } from "../../services/sales-channels.service";
import { NotificationService } from "../../services/notification.service";
import { Order, OrderUpdate } from "../../models/order.model";
import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";
import { AppCurrencyPipe } from "../../shared/pipes/app-currency.pipe";

@Component({
  selector: "app-order-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule,
    MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule, AppCurrencyPipe],
  template: `
<h2 mat-dialog-title class="of-title">
  <span>Editar Pedido <span class="of-badge">{{ data?.order?.order_number }}</span></span>
  <button mat-icon-button (click)="onCancel()" [disabled]="loading"><mat-icon>close</mat-icon></button>
</h2>

<mat-dialog-content class="of-content">
  <div class="of-error" *ngIf="errorMessage">
    <mat-icon>warning</mat-icon><span>{{ errorMessage }}</span>
  </div>

  <form [formGroup]="form">
    <div class="of-section">
      <div class="of-section-label"><mat-icon>info_outline</mat-icon>Datos generales</div>
      <div class="of-two-cols">
        <mat-form-field appearance="outline" class="of-fw">
          <mat-label>Cliente</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput [formControl]="customerSearch" [matAutocomplete]="customerAuto" placeholder="Buscar cliente..."/>
          <mat-spinner matSuffix diameter="18" *ngIf="loadingCustomers"/>
          <mat-autocomplete #customerAuto="matAutocomplete" (optionSelected)="onCustomerSelected($event.option.value)">
            <mat-option *ngFor="let c of filteredCustomers" [value]="c">{{ getCustomerLabel(c) }}</mat-option>
            <mat-option disabled *ngIf="filteredCustomers.length===0 && !loadingCustomers">Sin resultados</mat-option>
          </mat-autocomplete>
        </mat-form-field>
        <mat-form-field appearance="outline" class="of-fw">
          <mat-label>Canal de Venta</mat-label>
          <mat-icon matPrefix>storefront</mat-icon>
          <mat-select formControlName="sales_channel_id">
            <mat-option value="">— Sin canal —</mat-option>
            <mat-option *ngFor="let ch of channels" [value]="ch.id">{{ ch.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="of-fw">
        <mat-label>Monto Inicial (separación)</mat-label>
        <mat-icon matPrefix>payments</mat-icon>
        <input matInput type="number" formControlName="initial_payment_amount" min="0" step="0.01" placeholder="0.00"/>
        <mat-hint>Monto esperado para separar el pedido</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline" class="of-fw">
        <mat-label>Notas</mat-label>
        <mat-icon matPrefix>note</mat-icon>
        <textarea matInput formControlName="notes" rows="2" placeholder="Notas internas del pedido"></textarea>
      </mat-form-field>
    </div>

    <div class="of-section">
      <div class="of-section-header">
        <div class="of-section-label"><mat-icon>shopping_bag</mat-icon>Items del Pedido</div>
        <span *ngIf="!canEditItems" class="of-readonly-badge"><mat-icon>lock</mat-icon>Solo lectura ({{ data?.order?.status }})</span>
        <button *ngIf="canEditItems" type="button" mat-mini-fab color="primary" (click)="addItem()" [disabled]="loading" matTooltip="Agregar producto"><mat-icon>add</mat-icon></button>
      </div>

      <div formArrayName="items" class="of-items-list">
        <div *ngFor="let item of items.controls; let i = index" class="of-item-card" [class.of-item-ro]="!canEditItems" [formGroupName]="i">
          <div class="of-item-idx">{{ i + 1 }}</div>
          <div class="of-item-fields">
            <mat-form-field appearance="outline" class="of-fw">
              <mat-label>Producto *</mat-label>
              <mat-icon matPrefix>inventory_2</mat-icon>
              <input matInput [formControl]="productSearchControls[i]" [matAutocomplete]="productAuto" placeholder="Buscar producto..." [readonly]="!canEditItems"/>
              <mat-autocomplete #productAuto="matAutocomplete" (optionSelected)="onProductSelected($event.option.value, i)">
                <mat-option *ngFor="let p of filteredProducts[i]" [value]="p">
                  <strong>{{ p.name }}</strong><small *ngIf="p.sku" style="color:#64748b;margin-left:6px">{{ p.sku }}</small>
                </mat-option>
              </mat-autocomplete>
              <mat-error *ngIf="item.get('product_id')?.invalid && item.get('product_id')?.touched">Selecciona un producto</mat-error>
            </mat-form-field>
            <div class="of-item-row2">
              <mat-form-field appearance="outline" class="of-qty">
                <mat-label>Cantidad *</mat-label>
                <mat-icon matPrefix>numbers</mat-icon>
                <input matInput type="number" formControlName="quantity" min="0.01" [readonly]="!canEditItems" placeholder="1"/>
              </mat-form-field>
              <mat-form-field appearance="outline" class="of-price">
                <mat-label>Precio *</mat-label>
                <span matPrefix class="of-prefix">S/&nbsp;</span>
                <input matInput type="number" formControlName="unit_price" min="0" step="0.01" [readonly]="!canEditItems" placeholder="0.00"/>
              </mat-form-field>
              <div class="of-subtotal">
                <span class="of-sub-lbl">Subtotal</span>
                <span class="of-sub-amt">S/ {{ getItemSubtotal(i).toFixed(2) }}</span>
              </div>
              <button *ngIf="canEditItems" type="button" mat-icon-button (click)="removeItem(i)" [disabled]="items.length===1" matTooltip="Eliminar"><mat-icon>delete_outline</mat-icon></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="of-total-bar">
      <span class="of-total-lbl">TOTAL ESTIMADO</span>
      <span class="of-total-amt">S/ {{ calculateTotal.toFixed(2) }}</span>
    </div>
  </form>
</mat-dialog-content>

<mat-dialog-actions align="end" class="of-actions">
  <button mat-stroked-button (click)="onCancel()" [disabled]="loading">Cancelar</button>
  <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || form.invalid">
    <mat-icon *ngIf="!loading">save</mat-icon>
    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
  </button>
</mat-dialog-actions>
  `,
  styles: [`
    .of-title { display:flex; justify-content:space-between; align-items:center; margin:0; padding:20px 24px; font-size:20px; font-weight:700; color:#0f172a; background:#fff; border-bottom:1px solid #e2e8f0; }
    .of-badge { font-size:13px; font-weight:600; color:#3b82f6; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:2px 8px; margin-left:8px; vertical-align:middle; }
    .of-content { padding:20px 24px 8px !important; background:#f8fafc !important; max-height:72vh !important; overflow-y:auto !important; display:flex; flex-direction:column; gap:16px; }
    .of-error { display:flex; align-items:center; gap:10px; padding:12px 16px; background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #ef4444; border-radius:8px; color:#b91c1c; font-size:14px; font-weight:500; }
    .of-section { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:16px; }
    .of-section-label { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.6px; padding-bottom:4px; border-bottom:1px solid #f1f5f9; }
    .of-section-label mat-icon { font-size:18px; width:18px; height:18px; color:#3b82f6; }
    .of-section-header { display:flex; justify-content:space-between; align-items:center; }
    .of-two-cols { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .of-fw { width:100%; }
    .of-readonly-badge { display:flex; align-items:center; gap:4px; font-size:12px; color:#64748b; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:4px 10px; }
    .of-readonly-badge mat-icon { font-size:14px; width:14px; height:14px; }
    .of-items-list { display:flex; flex-direction:column; gap:12px; }
    .of-item-card { display:flex; align-items:flex-start; gap:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; }
    .of-item-ro { opacity:0.8; }
    .of-item-idx { display:flex; align-items:center; justify-content:center; min-width:28px; height:28px; background:#3b82f6; color:#fff; border-radius:50%; font-size:11px; font-weight:700; margin-top:14px; flex-shrink:0; }
    .of-item-fields { flex:1; display:flex; flex-direction:column; gap:10px; min-width:0; }
    .of-item-row2 { display:grid; grid-template-columns:1fr 1fr auto auto; align-items:center; gap:12px; }
    .of-qty, .of-price { width:100%; }
    .of-prefix { font-weight:600; color:#475569; font-size:14px; }
    .of-subtotal { display:flex; flex-direction:column; align-items:flex-end; padding:6px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; white-space:nowrap; min-width:110px; }
    .of-sub-lbl { font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; }
    .of-sub-amt { font-size:15px; font-weight:700; color:#1d4ed8; }
    .of-total-bar { display:flex; justify-content:flex-end; align-items:center; gap:20px; padding:16px 20px; background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%); border:1px solid #bfdbfe; border-radius:12px; }
    .of-total-lbl { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.8px; }
    .of-total-amt { font-size:26px; font-weight:800; color:#1d4ed8; min-width:120px; text-align:right; }
    .of-actions { padding:16px 24px !important; border-top:1px solid #e2e8f0 !important; background:#fff !important; gap:12px !important; }
    .of-actions button { min-width:130px; font-weight:600 !important; border-radius:8px !important; }
    @media(max-width:640px) { .of-two-cols { grid-template-columns:1fr; } .of-item-row2 { grid-template-columns:1fr 1fr; } }
  `],
})
export class OrderFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  errorMessage = "";
  canEditItems = false;

  customerSearch = new FormControl("");
  filteredCustomers: Customer[] = [];
  loadingCustomers = false;
  productSearchControls: FormControl[] = [];
  filteredProducts: Product[][] = [];
  channels: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private channelsService: SalesChannelsService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<OrderFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { order: Order }
  ) {}

  ngOnInit(): void {
    const order = this.data?.order;
    this.canEditItems = ['DRAFT', 'SEPARATED'].includes(order?.status ?? '');
    this.initForm(order);
    this.loadChannels();
    this.setupCustomerAutocomplete();
    if (order?.customer_id) {
      this.customersService.getCustomerById(order.customer_id)
        .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
        .subscribe(c => { if (c) this.customerSearch.setValue(this.getCustomerLabel(c), { emitEvent: false }); });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private initForm(order: Order): void {
    const itemControls = (order?.items ?? []).map((it, i) => {
      // Inicializar con el nombre si ya viene en el objeto product, si no se carga después
      const productLabel = it.product?.name || it.product?.sku || "";
      this.productSearchControls.push(new FormControl(productLabel));
      this.filteredProducts.push([]);

      // Si no hay nombre, cargarlo vía API
      if (!productLabel && it.product_id) {
        const idx = i;
        this.productsService.getProductById(it.product_id)
          .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
          .subscribe(p => {
            if (p) {
              const label = p.name || p.sku || it.product_id;
              this.productSearchControls[idx].setValue(label, { emitEvent: false });
            }
          });
      }

      return this.fb.group({
        product_id: [it.product_id, Validators.required],
        quantity: [it.quantity, [Validators.required, Validators.min(0.01)]],
        unit_price: [it.unit_price, [Validators.required, Validators.min(0)]],
        discount: [it.discount ?? 0],
      });
    });
    if (itemControls.length === 0) {
      this.productSearchControls.push(new FormControl(""));
      this.filteredProducts.push([]);
      itemControls.push(this.fb.group({
        product_id: ["", Validators.required],
        quantity: [1, [Validators.required, Validators.min(0.01)]],
        unit_price: [0, [Validators.required, Validators.min(0)]],
        discount: [0],
      }));
    }
    this.form = this.fb.group({
      customer_id: [order?.customer_id ?? ""],
      sales_channel_id: [order?.sales_channel_id ?? ""],
      initial_payment_amount: [order?.initial_payment_amount ?? null],
      notes: [(order as any)?.notes ?? ""],
      items: this.fb.array(itemControls),
    });
    itemControls.forEach((_, i) => setTimeout(() => this.setupProductAutocomplete(i), 0));
  }

  private loadChannels(): void {
    this.channelsService.getChannels().pipe(takeUntil(this.destroy$))
      .subscribe(ch => this.channels = ch || []);
  }

  private setupCustomerAutocomplete(): void {
    this.customerSearch.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      switchMap(term => { this.loadingCustomers = true; return this.customersService.getCustomers({ search: term || "" }).pipe(catchError(() => of([]))); }),
      takeUntil(this.destroy$)
    ).subscribe(customers => { this.filteredCustomers = customers as Customer[]; this.loadingCustomers = false; });
    this.customersService.getCustomers().pipe(takeUntil(this.destroy$)).subscribe(c => this.filteredCustomers = c);
  }

  private setupProductAutocomplete(index: number): void {
    const ctrl = this.productSearchControls[index];
    if (!ctrl) return;
    ctrl.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      switchMap(term => this.productsService.getProducts({ search: term || "", isActive: true }).pipe(catchError(() => of([])))),
      takeUntil(this.destroy$)
    ).subscribe(products => this.filteredProducts[index] = products as Product[]);
    this.productsService.getProducts({ isActive: true }).pipe(takeUntil(this.destroy$)).subscribe(p => this.filteredProducts[index] = p);
  }

  onCustomerSelected(customer: Customer): void {
    this.form.get("customer_id")?.setValue(customer.id);
    this.customerSearch.setValue(this.getCustomerLabel(customer), { emitEvent: false });
  }

  getCustomerLabel(customer: Customer): string {
    const name = customer.full_name || customer.business_name || "";
    const doc = customer.document_number ? ` (${customer.document_number})` : "";
    return `${name}${doc}`.trim();
  }

  onProductSelected(product: Product, index: number): void {
    const itemGroup = this.items.at(index) as FormGroup;
    itemGroup.get("product_id")?.setValue(product.id);
    this.productSearchControls[index].setValue(product.name, { emitEvent: false });
  }

  get items(): FormArray { return this.form.get("items") as FormArray; }

  addItem(): void {
    this.productSearchControls.push(new FormControl(""));
    this.filteredProducts.push([]);
    this.items.push(this.fb.group({
      product_id: ["", Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
    }));
    const idx = this.items.length - 1;
    setTimeout(() => this.setupProductAutocomplete(idx), 0);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.productSearchControls.splice(index, 1);
      this.filteredProducts.splice(index, 1);
    }
  }

  get calculateTotal(): number {
    return this.items.controls.reduce((total, ctrl) => {
      if (ctrl instanceof FormGroup) {
        const qty = ctrl.get("quantity")?.value || 0;
        const price = ctrl.get("unit_price")?.value || 0;
        const disc = ctrl.get("discount")?.value || 0;
        return total + (qty * price - disc);
      }
      return total;
    }, 0);
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index) as FormGroup;
    const qty = item.get("quantity")?.value || 0;
    const price = item.get("unit_price")?.value || 0;
    const disc = item.get("discount")?.value || 0;
    return qty * price - disc;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = "";
    const payload: OrderUpdate = {
      customer_id: this.form.get("customer_id")?.value || undefined,
      sales_channel_id: this.form.get("sales_channel_id")?.value || undefined,
      initial_payment_amount: this.form.get("initial_payment_amount")?.value ?? null,
      notes: this.form.get("notes")?.value || null,
    };
    if (this.canEditItems) { payload.items = this.items.value; }
    this.ordersService.updateOrder(this.data.order.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.loading = false; this.dialogRef.close(true); },
        error: (err) => {
          this.loading = false;
          const status = err?.status;
          const detail = err?.error?.detail;
          if (status === 409) { this.errorMessage = detail || "No se pueden modificar los ítems en el estado actual."; }
          else if (status === 422) { this.errorMessage = detail || "El pedido está cancelado y no puede editarse."; }
          else if (detail) { this.errorMessage = String(detail); }
          else { this.errorMessage = "Error al actualizar el pedido. Intenta de nuevo."; }
        },
      });
  }

  onCancel(): void { this.dialogRef.close(false); }
}
