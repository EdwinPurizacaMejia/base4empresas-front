import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of, debounceTime } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Order, OrderCreate } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../services/customers.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { ProductsService } from '../../services/products.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss']
})
export class OrderCreateComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  loadingData = false;
  submitting = false;

  customers: any[] = [];
  channels: any[] = [];
  products: any[] = [];

  // Propiedades cacheadas para evitar change detection infinito
  itemsDataSource: any[] = [];
  totalAmount = 0;
  balanceAmount = 0;
  itemSubtotals: number[] = [];

  itemsDisplayedColumns = ['product', 'quantity', 'unitPrice', 'discount', 'subtotal', 'actions'];

  private destroy$ = new Subject<void>();

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get selectedCurrency(): string {
    return this.form.get('currency')?.value || 'PEN';
  }

  /** Cuando el componente se usa como diálogo, este ref estará disponible */
  get isDialogMode(): boolean { return !!this.dialogRef; }

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private channelsService: SalesChannelsService,
    private productsService: ProductsService,
    private notificationService: NotificationService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<OrderCreateComponent>
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadFormData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configurar listeners para recalcular automáticamente
   */
  private setupFormListeners(): void {
    // Escuchar cambios en items
    this.items.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.recalculateTotals();
      });

    // Escuchar cambios en monto inicial
    this.form.get('initial_payment_amount')?.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.recalculateTotals();
      });
  }

  /**
   * Recalcular totales y actualizar cache
   */
  private recalculateTotals(): void {
    // Leer items una sola vez
    const itemsValues = this.items.value;
    
    // Calcular subtotales por ítem
    this.itemSubtotals = itemsValues.map((item: any) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      return subtotal - (item.discount || 0);
    });

    // Calcular total
    this.totalAmount = this.itemSubtotals.reduce((sum, subtotal) => sum + subtotal, 0);

    // Calcular saldo
    const initialPayment = this.form.get('initial_payment_amount')?.value || 0;
    this.balanceAmount = this.totalAmount - initialPayment;

    // Actualizar dataSource con copia estable
    this.itemsDataSource = [...this.items.controls];
  }

  private createForm(): FormGroup {
    return this.fb.group({
      customer_id: ['', Validators.required],
      sales_channel_id: ['', Validators.required],
      initial_payment_amount: [null, [Validators.min(0)]],
      currency: ['PEN', Validators.required],
      items: this.fb.array([])
    });
  }

  private loadFormData(): void {
    this.loadingData = true;

    // Inicializar arrays vacíos para evitar errores
    this.customers = [];
    this.channels = [];
    this.products = [];

    // Usar forkJoin para esperar a que TODOS los servicios completen
    forkJoin({
      customers: this.customersService.getCustomers().pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Error loading customers:', err);
          return of([]);
        })
      ),
      channels: this.channelsService.getChannels().pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Error loading channels:', err);
          return of([]);
        })
      ),
      products: this.productsService.getProducts().pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Error loading products:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (result) => {
        this.customers = result.customers || [];
        this.channels = result.channels || [];
        this.products = result.products || [];
        
        if (this.items.length === 0) {
          this.addItem();
        }
        
        // Recalcular después de inicializar
        this.recalculateTotals();
        
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error loading form data:', err);
        this.notificationService.error('Error al cargar los datos del formulario');
        
        if (this.items.length === 0) {
          this.addItem();
        }
        
        this.recalculateTotals();
        this.loadingData = false;
      }
    });
  }

  addItem(): void {
    const itemForm = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0)]]
    });

    this.items.push(itemForm);
    this.recalculateTotals();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.recalculateTotals();
    } else {
      this.notificationService.warning('Debe haber al menos un ítem en la orden');
    }
  }

  getProductName(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : 'Producto no encontrado';
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find((c) => c.id === customerId);
    return customer ? customer.full_name || customer.business_name || customerId : 'Cliente no encontrado';
  }

  getChannelName(channelId: string): string {
    const channel = this.channels.find((c) => c.id === channelId);
    return channel ? channel.name : 'Canal no encontrado';
  }

  getItemControl(index: number, fieldName: string): any {
    return this.items.at(index).get(fieldName);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.error('Por favor completa los campos requeridos');
      return;
    }

    this.submitting = true;

    const formValue = this.form.value;
    const payload: OrderCreate = {
      customer_id: formValue.customer_id,
      sales_channel_id: formValue.sales_channel_id,
      currency: formValue.currency,
      items: formValue.items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount || undefined
      })),
      initial_payment_amount: formValue.initial_payment_amount || undefined
    };

    this.ordersService
      .createOrder(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order: Order) => {
          this.submitting = false;
          this.notificationService.success(`Orden ${order.order_number} creada exitosamente`);
          if (this.isDialogMode) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/ventas/pedidos', order.id]);
          }
        },
        error: (err) => {
          console.error('Error creating order:', err);
          this.notificationService.error('Error al crear la orden');
          this.submitting = false;
        }
      });
  }

  onCancel(): void {
    if (this.isDialogMode) {
      this.dialogRef.close(false);
    } else {
      this.router.navigate(['/ventas/pedidos']);
    }
  }
}
