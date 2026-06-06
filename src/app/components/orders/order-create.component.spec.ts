import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { OrderCreateComponent } from './order-create.component';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../services/customers.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { ProductsService } from '../../services/products.service';
import { NotificationService } from '../../services/notification.service';

describe('OrderCreateComponent', () => {
  let component: OrderCreateComponent;
  let fixture: ComponentFixture<OrderCreateComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let customersService: jasmine.SpyObj<CustomersService>;
  let channelsService: jasmine.SpyObj<SalesChannelsService>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const mockCustomers = [
    { id: '1', full_name: 'John Doe' },
    { id: '2', business_name: 'Acme Corp' }
  ];

  const mockChannels = [
    { id: '1', name: 'Tienda Online' },
    { id: '2', name: 'Mostrador' }
  ];

  const mockProducts = [
    { id: '1', name: 'Producto 1', price: 100 },
    { id: '2', name: 'Producto 2', price: 200 }
  ];

  const mockOrder = {
    id: 'ord-1',
    order_number: 'ORD-001',
    customer_id: '1',
    sales_channel_id: '1',
    status: 'DRAFT',
    total_amount: 200,
    paid_amount: 0,
    currency: 'PEN',
    items: []
  };

  beforeEach(async () => {
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', ['createOrder']);
    const customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getCustomers']);
    const channelsServiceSpy = jasmine.createSpyObj('SalesChannelsService', ['getChannels']);
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', ['listProducts']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrderCreateComponent, ReactiveFormsModule],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: SalesChannelsService, useValue: channelsServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    customersService = TestBed.inject(CustomersService) as jasmine.SpyObj<CustomersService>;
    channelsService = TestBed.inject(SalesChannelsService) as jasmine.SpyObj<SalesChannelsService>;
    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    customersService.getCustomers.and.returnValue(of(mockCustomers));
    channelsService.getChannels.and.returnValue(of(mockChannels));
    productsService.listProducts.and.returnValue(of(mockProducts));

    fixture = TestBed.createComponent(OrderCreateComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load customers, channels, and products on init', () => {
      fixture.detectChanges();

      expect(customersService.getCustomers).toHaveBeenCalled();
      expect(channelsService.getChannels).toHaveBeenCalled();
      expect(productsService.listProducts).toHaveBeenCalled();
    });

    it('should add first item after loading data', () => {
      fixture.detectChanges();

      expect(component.items.length).toBe(1);
    });
  });

  describe('form management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add item to form', () => {
      const initialLength = component.items.length;
      component.addItem();

      expect(component.items.length).toBe(initialLength + 1);
    });

    it('should not allow removing the last item', () => {
      component.items.clear();
      component.addItem();

      component.removeItem(0);

      expect(notificationService.warning).toHaveBeenCalled();
      expect(component.items.length).toBe(1);
    });

    it('should remove item from form', () => {
      component.addItem();
      const initialLength = component.items.length;

      component.removeItem(0);

      expect(component.items.length).toBe(initialLength - 1);
    });
  });

  describe('total calculation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate total amount correctly', () => {
      const itemControl = component.items.at(0);
      itemControl.patchValue({
        quantity: 2,
        unitPrice: 100,
        discount: 10
      });

      const expectedTotal = 2 * 100 - 10; // 190
      expect(component.totalAmount).toBe(expectedTotal);
    });

    it('should handle multiple items in total', () => {
      component.items.at(0).patchValue({
        quantity: 2,
        unitPrice: 100
      });
      component.addItem();
      component.items.at(1).patchValue({
        quantity: 1,
        unitPrice: 50
      });

      const expectedTotal = 2 * 100 + 1 * 50; // 250
      expect(component.totalAmount).toBe(expectedTotal);
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error if form is invalid', () => {
      component.onSubmit();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Por favor completa los campos requeridos'
      );
    });

    it('should create order with valid form', () => {
      ordersService.createOrder.and.returnValue(of(mockOrder));

      component.form.patchValue({
        customer_id: '1',
        sales_channel_id: '1'
      });

      component.items.at(0).patchValue({
        product_id: '1',
        quantity: 2,
        unitPrice: 100
      });

      component.onSubmit();

      expect(ordersService.createOrder).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/pedidos', 'ord-1']);
    });

    it('should handle creation error', () => {
      ordersService.createOrder.and.returnValue(
        new Observable((observer) => observer.error('Error'))
      );

      component.form.patchValue({
        customer_id: '1',
        sales_channel_id: '1'
      });

      component.items.at(0).patchValue({
        product_id: '1',
        quantity: 1,
        unitPrice: 100
      });

      component.onSubmit();

      expect(notificationService.error).toHaveBeenCalledWith('Error al crear la orden');
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get customer name', () => {
      const name = component.getCustomerName('1');
      expect(name).toBe('John Doe');
    });

    it('should get channel name', () => {
      const name = component.getChannelName('1');
      expect(name).toBe('Tienda Online');
    });

    it('should get product name', () => {
      const name = component.getProductName('1');
      expect(name).toBe('Producto 1');
    });
  });

  describe('cancel', () => {
    it('should navigate back to list on cancel', () => {
      fixture.detectChanges();
      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/pedidos']);
    });
  });
});

import { Observable } from 'rxjs';
