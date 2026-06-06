import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { ApiConfigService } from './api-config.service';
import { Order, OrderCreate, OrderFilters } from '../models/order.model';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;
  let apiConfigService: ApiConfigService;

  const mockOrder: Order = {
    id: '1',
    order_number: 'ORD-001',
    customer_id: 'cust-1',
    sales_channel_id: 'channel-1',
    status: 'DRAFT',
    total_amount: 1000,
    paid_amount: 0,
    currency: 'PEN',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        quantity: 2,
        unit_price: 500,
        subtotal: 1000
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService, ApiConfigService]
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfigService = TestBed.inject(ApiConfigService);

    spyOn(apiConfigService, 'buildUrl').and.returnValue('http://localhost:8001/orders');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('listOrders', () => {
    it('should fetch orders without filters', () => {
      service.listOrders().subscribe((orders) => {
        expect(orders.length).toBe(1);
        expect(orders[0].id).toBe('1');
      });

      const req = httpMock.expectOne('http://localhost:8001/orders');
      expect(req.request.method).toBe('GET');
      req.flush([mockOrder]);
    });

    it('should fetch orders with status filter', () => {
      const filters: OrderFilters = { status: 'SEPARATED' };
      service.listOrders(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === 'http://localhost:8001/orders' &&
          request.params.has('status') &&
          request.params.get('status') === 'SEPARATED'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should fetch orders with multiple filters', () => {
      const filters: OrderFilters = {
        status: 'SEPARATED',
        sales_channel_id: 'channel-1',
        customer_id: 'cust-1'
      };
      service.listOrders(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === 'http://localhost:8001/orders' &&
          request.params.get('status') === 'SEPARATED' &&
          request.params.get('sales_channel_id') === 'channel-1' &&
          request.params.get('customer_id') === 'cust-1'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getOrder', () => {
    it('should fetch a single order by id', () => {
      service.getOrder('1').subscribe((order) => {
        expect(order.id).toBe('1');
        expect(order.order_number).toBe('ORD-001');
      });

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });

    it('should encode special characters in order id', () => {
      service.getOrder('special/id').subscribe();

      const req = httpMock.expectOne('http://localhost:8001/orders/special%2Fid');
      req.flush(mockOrder);
    });
  });

  describe('createOrder', () => {
    it('should create a new order', () => {
      const payload: OrderCreate = {
        customer_id: 'cust-1',
        sales_channel_id: 'channel-1',
        items: [
          {
            product_id: 'prod-1',
            quantity: 2,
            unit_price: 500
          }
        ],
        initial_payment_amount: 500
      };

      service.createOrder(payload).subscribe((order) => {
        expect(order.id).toBe('1');
        expect(order.status).toBe('DRAFT');
      });

      const req = httpMock.expectOne('http://localhost:8001/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', () => {
      const updatedOrder = { ...mockOrder, status: 'SEPARATED' as const };

      service.updateOrderStatus('1', { status: 'SEPARATED' }).subscribe((order) => {
        expect(order.status).toBe('SEPARATED');
      });

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'SEPARATED' });
      req.flush(updatedOrder);
    });
  });

  describe('convenience methods', () => {
    it('should mark order as separated', () => {
      service.markAsSeparated('1').subscribe();

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.body).toEqual({ status: 'SEPARATED' });
      req.flush(mockOrder);
    });

    it('should cancel order', () => {
      service.cancel('1').subscribe();

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.body).toEqual({ status: 'CANCELLED' });
      req.flush(mockOrder);
    });

    it('should mark as pending invoice', () => {
      service.markAsPendingInvoice('1').subscribe();

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.body).toEqual({ status: 'PENDING_INVOICE' });
      req.flush(mockOrder);
    });

    it('should mark as invoiced', () => {
      service.markAsInvoiced('1').subscribe();

      const req = httpMock.expectOne('http://localhost:8001/orders/1');
      expect(req.request.body).toEqual({ status: 'INVOICED' });
      req.flush(mockOrder);
    });
  });
});
