import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PaymentsService } from './payments.service';
import { ApiConfigService } from './api-config.service';
import { Payment, PaymentCreate, PaymentValidate } from '../models/payment.model';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;
  let apiConfig: jasmine.SpyObj<ApiConfigService>;

  const mockBaseUrl = 'http://localhost:8001/api';
  const mockPayment: Payment = {
    id: 'pay-1',
    order_id: 'ord-1',
    method: 'YAPE',
    amount: 500,
    currency: 'PEN',
    operation_number: 'YP-12345',
    status: 'PENDING_VALIDATION',
    paid_at: '2026-05-26T10:00:00Z',
    validated_by: null,
    validated_at: null,
    created_at: '2026-05-26T10:00:00Z',
    updated_at: '2026-05-26T10:00:00Z'
  };

  beforeEach(() => {
    const apiConfigSpy = jasmine.createSpyObj('ApiConfigService', ['buildUrl']);
    apiConfigSpy.buildUrl.and.returnValue(`${mockBaseUrl}/payments`);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PaymentsService,
        { provide: ApiConfigService, useValue: apiConfigSpy }
      ]
    });

    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfig = TestBed.inject(ApiConfigService) as jasmine.SpyObj<ApiConfigService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createPayment', () => {
    it('should create a payment', () => {
      const payload: PaymentCreate = {
        order_id: 'ord-1',
        method: 'YAPE',
        amount: 500,
        operation_number: 'YP-12345'
      };

      service.createPayment(payload).subscribe((result) => {
        expect(result).toEqual(mockPayment);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/payments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockPayment);
    });

    it('should include optional currency field', () => {
      const payload: PaymentCreate = {
        order_id: 'ord-1',
        method: 'TRANSFER',
        amount: 1000,
        currency: 'USD',
        operation_number: 'TRANS-999'
      };

      service.createPayment(payload).subscribe();

      const req = httpMock.expectOne(`${mockBaseUrl}/payments`);
      expect(req.request.body.currency).toBe('USD');
      req.flush(mockPayment);
    });
  });

  describe('getPaymentsByOrder', () => {
    it('should get payments by order ID', () => {
      const orderId = 'ord-1';
      const mockPayments: Payment[] = [mockPayment];

      service.getPaymentsByOrder(orderId).subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('pay-1');
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${mockBaseUrl}/payments` && r.params.has('order_id')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('order_id')).toBe(encodeURIComponent(orderId));
      req.flush(mockPayments);
    });

    it('should encode special characters in order ID', () => {
      const orderId = 'ord-1/special&chars';

      service.getPaymentsByOrder(orderId).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === `${mockBaseUrl}/payments` && r.params.has('order_id')
      );
      expect(req.request.params.get('order_id')).toBe(encodeURIComponent(orderId));
      req.flush([]);
    });

    it('should return empty array when no payments exist', () => {
      service.getPaymentsByOrder('ord-1').subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${mockBaseUrl}/payments` && r.params.has('order_id')
      );
      req.flush([]);
    });
  });

  describe('getPayment', () => {
    it('should get a single payment by ID', () => {
      const paymentId = 'pay-1';

      service.getPayment(paymentId).subscribe((result) => {
        expect(result.id).toBe('pay-1');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/payments/pay-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPayment);
    });

    it('should encode special characters in payment ID', () => {
      const paymentId = 'pay-1/special';

      service.getPayment(paymentId).subscribe();

      const req = httpMock.expectOne(
        `${mockBaseUrl}/payments/${encodeURIComponent(paymentId)}`
      );
      req.flush(mockPayment);
    });
  });

  describe('validatePayment', () => {
    it('should validate a payment', () => {
      const paymentId = 'pay-1';
      const payload: PaymentValidate = {
        status: 'VALIDATED',
        validated_by: 'admin-demo'
      };
      const validatedPayment = { ...mockPayment, status: 'VALIDATED' as const };

      service.validatePayment(paymentId, payload).subscribe((result) => {
        expect(result.status).toBe('VALIDATED');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/payments/pay-1/validate`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(validatedPayment);
    });

    it('should reject a payment', () => {
      const paymentId = 'pay-1';
      const payload: PaymentValidate = {
        status: 'REJECTED',
        validated_by: 'admin-demo'
      };
      const rejectedPayment = { ...mockPayment, status: 'REJECTED' as const };

      service.validatePayment(paymentId, payload).subscribe((result) => {
        expect(result.status).toBe('REJECTED');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/payments/pay-1/validate`);
      expect(req.request.body.status).toBe('REJECTED');
      req.flush(rejectedPayment);
    });

    it('should encode special characters in payment ID for validation', () => {
      const paymentId = 'pay-1/special';
      const payload: PaymentValidate = {
        status: 'VALIDATED',
        validated_by: 'admin'
      };

      service.validatePayment(paymentId, payload).subscribe();

      const req = httpMock.expectOne(
        `${mockBaseUrl}/payments/${encodeURIComponent(paymentId)}/validate`
      );
      req.flush(mockPayment);
    });
  });

  describe('convenience methods', () => {
    it('should approve payment', () => {
      const paymentId = 'pay-1';

      service.approvePayment(paymentId, 'admin-demo').subscribe();

      const req = httpMock.expectOne(`${mockBaseUrl}/payments/pay-1/validate`);
      expect(req.request.body).toEqual({
        status: 'VALIDATED',
        validated_by: 'admin-demo'
      });
      req.flush(mockPayment);
    });

    it('should reject payment', () => {
      const paymentId = 'pay-1';

      service.rejectPayment(paymentId, 'admin-demo').subscribe();

      const req = httpMock.expectOne(`${mockBaseUrl}/payments/pay-1/validate`);
      expect(req.request.body).toEqual({
        status: 'REJECTED',
        validated_by: 'admin-demo'
      });
      req.flush(mockPayment);
    });
  });
});
