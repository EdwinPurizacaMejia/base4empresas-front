import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../services/customers.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { Order } from '../../models/order.model';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let customersService: jasmine.SpyObj<CustomersService>;
  let channelsService: jasmine.SpyObj<SalesChannelsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockOrder: Order = {
    id: '1',
    order_number: 'ORD-001',
    customer_id: 'cust-1',
    sales_channel_id: 'channel-1',
    status: 'SEPARATED',
    total_amount: 1000,
    paid_amount: 500,
    currency: 'PEN',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        quantity: 2,
        unit_price: 500,
        subtotal: 1000
      }
    ],
    separation_expiry_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    initial_payment_amount: 500
  };

  const mockCustomer = { id: 'cust-1', full_name: 'John Doe' };
  const mockChannel = { id: 'channel-1', name: 'Tienda Online' };
  const mockChannels = [mockChannel, { id: 'channel-2', name: 'Mostrador' }];

  beforeEach(async () => {
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'getOrder',
      'updateOrderStatus',
      'cancel',
      'markAsSeparated',
      'markAsInvoiced'
    ]);
    const customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getCustomer']);
    const channelsServiceSpy = jasmine.createSpyObj('SalesChannelsService', ['getChannels']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: SalesChannelsService, useValue: channelsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    customersService = TestBed.inject(CustomersService) as jasmine.SpyObj<CustomersService>;
    channelsService = TestBed.inject(SalesChannelsService) as jasmine.SpyObj<SalesChannelsService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    ordersService.getOrder.and.returnValue(of(mockOrder));
    customersService.getCustomer.and.returnValue(of(mockCustomer));
    channelsService.getChannels.and.returnValue(of(mockChannels));

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load order on init', () => {
      fixture.detectChanges();

      expect(ordersService.getOrder).toHaveBeenCalledWith('1');
      expect(component.order?.order_number).toBe('ORD-001');
    });

    it('should load customer and channel', () => {
      fixture.detectChanges();

      expect(customersService.getCustomer).toHaveBeenCalledWith('cust-1');
      expect(channelsService.getChannels).toHaveBeenCalled();
      expect(component.customer).toEqual(mockCustomer);
      expect(component.channel).toEqual(mockChannel);
    });
  });

  describe('status management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get available status transitions', () => {
      const transitions = component.getAvailableStatusTransitions();
      expect(transitions).toContain('PENDING_INVOICE');
      expect(transitions).toContain('CANCELLED');
      expect(transitions).toContain('INVOICED');
    });

    it('should update order status', () => {
      const updatedOrder = { ...mockOrder, status: 'PENDING_INVOICE' as const };
      ordersService.updateOrderStatus.and.returnValue(of(updatedOrder));

      component.updateStatus('PENDING_INVOICE');

      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith('1', {
        status: 'PENDING_INVOICE'
      });
      expect(notificationService.success).toHaveBeenCalled();
      expect(component.order?.status).toBe('PENDING_INVOICE');
    });

    it('should handle status update error', () => {
      ordersService.updateOrderStatus.and.returnValue(
        new Observable((observer) => observer.error('Error'))
      );

      component.updateStatus('PENDING_INVOICE');

      expect(notificationService.error).toHaveBeenCalledWith('Error al actualizar el estado');
    });
  });

  describe('quick actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark order as separated', () => {
      const updatedOrder = { ...mockOrder, status: 'SEPARATED' as const };
      ordersService.markAsSeparated.and.returnValue(of(updatedOrder));

      component.markAsSeparated();

      expect(ordersService.markAsSeparated).toHaveBeenCalledWith('1');
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should mark order as invoiced', () => {
      const updatedOrder = { ...mockOrder, status: 'INVOICED' as const };
      ordersService.markAsInvoiced.and.returnValue(of(updatedOrder));

      component.markAsInvoiced();

      expect(ordersService.markAsInvoiced).toHaveBeenCalledWith('1');
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should cancel order with confirmation', () => {
      const updatedOrder = { ...mockOrder, status: 'CANCELLED' as const };
      ordersService.cancel.and.returnValue(of(updatedOrder));
      spyOn(window, 'confirm').and.returnValue(true);

      component.cancelOrder();

      expect(ordersService.cancel).toHaveBeenCalledWith('1');
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should not cancel without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.cancelOrder();

      expect(ordersService.cancel).not.toHaveBeenCalled();
    });
  });

  describe('separation logic', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should detect expiring separation', () => {
      component.order = {
        ...mockOrder,
        separation_expiry_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(component.isSeparationExpiring()).toBe(true);
    });

    it('should detect expired separation', () => {
      component.order = {
        ...mockOrder,
        separation_expiry_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(component.isSeparationExpired()).toBe(true);
    });

    it('should not flag separation as expiring if far away', () => {
      component.order = {
        ...mockOrder,
        separation_expiry_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(component.isSeparationExpiring()).toBe(false);
    });
  });

  describe('calculations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate total balance', () => {
      const balance = component.getTotalBalance();
      expect(balance).toBe(mockOrder.total_amount - mockOrder.paid_amount);
    });

    it('should handle zero balance', () => {
      component.order = { ...mockOrder, paid_amount: mockOrder.total_amount };
      expect(component.getTotalBalance()).toBe(0);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back', () => {
      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/pedidos']);
    });

    it('should show warning for edit', () => {
      component.editOrder();

      expect(notificationService.warning).toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get status label', () => {
      const label = component.getStatusLabel('SEPARATED');
      expect(label).toBe('Separada');
    });

    it('should get status color', () => {
      const color = component.getStatusColor('SEPARATED');
      expect(color).toBeDefined();
    });
  });
});

import { Observable } from 'rxjs';
