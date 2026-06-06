import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Order, OrderCreate } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../services/customers.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { ProductsService } from '../../services/products.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';

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
    LoadingSpinnerComponent
  ],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss'
})
export class OrderCreateComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  loadingData = false;
  submitting = false;

  customers: any[] = [];
  channels: any[] = [];
  products: any[] = [];

  itemsDisplayedColumns = ['product', 'quantity', 'unitPrice', 'discount', 'subtotal', 'actions'];

  private destroy$ = new Subject<void>();

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get totalAmount(): number {
    return this.items.value.reduce((sum: number, item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      const discounted = subtotal - (item.discount || 0);
      return sum + discounted;
    }, 0);
  }

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private channelsService: SalesChannelsService,
    private productsService: ProductsService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    forkJoin([
      this.customersService.getCustomers(),
      this.channelsService.getChannels(),
      this.productsService.getProducts()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([customers, channels, products]) => {
          this.customers = customers || [];
          this.channels = channels || [];
          this.products = products || [];
          this.loadingData = false;
          this.addItem();
        },
        error: (err) => {
          console.error('Error loading form data:', err);
          this.notificationService.error('Error al cargar datos del formulario');
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
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
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
          this.router.navigate(['/pedidos', order.id]);
        },
        error: (err) => {
          console.error('Error creating order:', err);
          this.notificationService.error('Error al crear la orden');
          this.submitting = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/pedidos']);
  }
}
