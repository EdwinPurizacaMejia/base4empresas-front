import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { OrdersListComponent } from './orders-list.component';
import { OrdersService } from '../../services/orders.service';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { Order } from '../../models/order.model';

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let channelsService: jasmine.SpyObj<SalesChannelsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const mockOrders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-001',
      customer_id: 'cust-1',
      sales_channel_id: 'channel-1',
      status: 'SEPARATED',
      total_amount: 1000,
      paid_amount: 500,
      currency: 'PEN',
      items: []
    },
    {
      id: '2',
      order_number: 'ORD-002',
      customer_id: 'cust-2',
      sales_channel_id: 'channel-1',
      status: 'INVOICED',
      total_amount: 2000,
      paid_amount: 2000,
      currency: 'PEN',
      items: []
    }
  ];

  const mockChannels = [
    { id: 'channel-1', name: 'Tienda Online' },
    { id: 'channel-2', name: 'Mostrador' }
  ];

  beforeEach(async () => {
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', ['listOrders']);
    const channelsServiceSpy = jasmine.createSpyObj('SalesChannelsService', ['getChannels']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrdersListComponent, ReactiveFormsModule],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: SalesChannelsService, useValue: channelsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    channelsService = TestBed.inject(SalesChannelsService) as jasmine.SpyObj<SalesChannelsService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    ordersService.listOrders.and.returnValue(of(mockOrders));
    channelsService.getChannels.and.returnValue(of(mockChannels));

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load channels and orders on init', () => {
      fixture.detectChanges();

      expect(channelsService.getChannels).toHaveBeenCalled();
      expect(ordersService.listOrders).toHaveBeenCalled();
    });

    it('should populate orders list', () => {
      fixture.detectChanges();

      expect(component.orders.length).toBe(2);
      expect(component.orders[0].order_number).toBe('ORD-001');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reload orders when status filter changes', () => {
      ordersService.listOrders.calls.reset();

      component.filters.patchValue({ status: 'SEPARATED' });

      expect(ordersService.listOrders).toHaveBeenCalledWith({
        status: 'SEPARATED',
        sales_channel_id: ''
      });
    });

    it('should reload orders when channel filter changes', () => {
      ordersService.listOrders.calls.reset();

      component.filters.patchValue({ sales_channel_id: 'channel-1' });

      expect(ordersService.listOrders).toHaveBeenCalledWith({
        status: '',
        sales_channel_id: 'channel-1'
      });
    });

    it('should clear filters', () => {
      component.filters.patchValue({ status: 'SEPARATED', sales_channel_id: 'channel-1' });

      component.clearFilters();

      expect(component.filters.value.status).toBe(null);
      expect(component.filters.value.sales_channel_id).toBe(null);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to detail view', () => {
      component.viewDetail('ord-1');

      expect(router.navigate).toHaveBeenCalledWith(['/pedidos', 'ord-1']);
    });

    it('should navigate to create order', () => {
      component.createOrder();

      expect(router.navigate).toHaveBeenCalledWith(['/pedidos/crear']);
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get channel name', () => {
      const name = component.getChannelName('channel-1');
      expect(name).toBe('Tienda Online');
    });

    it('should return channel id if not found', () => {
      const name = component.getChannelName('unknown');
      expect(name).toBe('unknown');
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

  describe('error handling', () => {
    it('should handle load error', () => {
      ordersService.listOrders.and.returnValue(
        new Observable((observer) => observer.error('Error'))
      );
      fixture.detectChanges();

      expect(notificationService.error).toHaveBeenCalledWith('Error al cargar las órdenes');
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reload orders', () => {
      ordersService.listOrders.calls.reset();

      component.onRefresh();

      expect(ordersService.listOrders).toHaveBeenCalled();
    });
  });
});

import { Observable } from 'rxjs';
