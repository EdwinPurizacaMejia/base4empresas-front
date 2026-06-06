import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { OrderPaymentsComponent } from './order-payments.component';
import { PaymentsService } from '../../../services/payments.service';
import { NotificationService } from '../../../services/notification.service';
import { Payment } from '../../../models/payment.model';

describe('OrderPaymentsComponent', () => {
  let component: OrderPaymentsComponent;
  let fixture: ComponentFixture<OrderPaymentsComponent>;
  let paymentsService: jasmine.SpyObj<PaymentsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

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

  const validatedPayment: Payment = {
    ...mockPayment,
    id: 'pay-2',
    status: 'VALIDATED',
    validated_by: 'admin-demo',
    validated_at: '2026-05-26T11:00:00Z'
  };

  beforeEach(async () => {
    const paymentsServiceSpy = jasmine.createSpyObj('PaymentsService', [
      'getPaymentsByOrder',
      'createPayment',
      'validatePayment',
      'approvePayment',
      'rejectPayment'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning'
    ]);

    await TestBed.configureTestingModule({
      imports: [OrderPaymentsComponent, ReactiveFormsModule],
      providers: [
        { provide: PaymentsService, useValue: paymentsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    paymentsService = TestBed.inject(PaymentsService) as jasmine.SpyObj<PaymentsService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    paymentsService.getPaymentsByOrder.and.returnValue(of([mockPayment, validatedPayment]));

    fixture = TestBed.createComponent(OrderPaymentsComponent);
    component = fixture.componentInstance;
    component.orderId = 'ord-1';
    component.orderTotalAmount = 1500;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load payments on init', () => {
      fixture.detectChanges();

      expect(paymentsService.getPaymentsByOrder).toHaveBeenCalledWith('ord-1');
      expect(component.payments.length).toBe(2);
    });

    it('should initialize form with default values', () => {
      fixture.detectChanges();

      expect(component.paymentForm.get('method')?.value).toBe('');
      expect(component.paymentForm.get('currency')?.value).toBe('PEN');
    });

    it('should show error if orderId is missing', () => {
      component.orderId = '';
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should require method field', () => {
      const methodControl = component.paymentForm.get('method');
      methodControl?.setValue('');

      expect(methodControl?.hasError('required')).toBe(true);
    });

    it('should require amount field', () => {
      const amountControl = component.paymentForm.get('amount');
      amountControl?.setValue('');

      expect(amountControl?.hasError('required')).toBe(true);
    });

    it('should validate amount is positive', () => {
      const amountControl = component.paymentForm.get('amount');
      amountControl?.setValue(-100);

      expect(amountControl?.hasError('min')).toBe(true);
    });

    it('should require operation_number for YAPE', () => {
      component.paymentForm.patchValue({ method: 'YAPE' });
      const opControl = component.paymentForm.get('operation_number');

      expect(opControl?.hasError('required')).toBe(true);
    });

    it('should require operation_number for TRANSFER', () => {
      component.paymentForm.patchValue({ method: 'TRANSFER' });
      const opControl = component.paymentForm.get('operation_number');

      expect(opControl?.hasError('required')).toBe(true);
    });

    it('should require operation_number for CARD', () => {
      component.paymentForm.patchValue({ method: 'CARD' });
      const opControl = component.paymentForm.get('operation_number');

      expect(opControl?.hasError('required')).toBe(true);
    });

    it('should NOT require operation_number for CASH', () => {
      component.paymentForm.patchValue({ method: 'CASH', operation_number: '' });
      component.paymentForm.get('operation_number')?.updateValueAndValidity();
      const opControl = component.paymentForm.get('operation_number');

      expect(opControl?.hasError('required')).toBe(false);
    });

    it('should NOT require operation_number for OTHER', () => {
      component.paymentForm.patchValue({ method: 'OTHER', operation_number: '' });
      component.paymentForm.get('operation_number')?.updateValueAndValidity();
      const opControl = component.paymentForm.get('operation_number');

      expect(opControl?.hasError('required')).toBe(false);
    });
  });

  describe('payment creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create payment with valid form', () => {
      const newPayment = { ...mockPayment, id: 'pay-3' };
      paymentsService.createPayment.and.returnValue(of(newPayment));

      component.paymentForm.patchValue({
        method: 'YAPE',
        amount: 500,
        operation_number: 'YP-12345'
      });

      component.onSubmitPayment();

      expect(paymentsService.createPayment).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(
        'Pago registrado exitosamente'
      );
      expect(component.payments.length).toBe(3);
    });

    it('should not create payment with invalid form', () => {
      component.paymentForm.patchValue({
        method: '',
        amount: ''
      });

      component.onSubmitPayment();

      expect(paymentsService.createPayment).not.toHaveBeenCalled();
      expect(notificationService.warning).toHaveBeenCalled();
    });

    it('should reset form after successful payment creation', () => {
      paymentsService.createPayment.and.returnValue(of(mockPayment));

      component.paymentForm.patchValue({
        method: 'TRANSFER',
        amount: 1000,
        operation_number: 'TR-999'
      });

      component.onSubmitPayment();

      expect(component.paymentForm.get('method')?.value).toBe('');
      expect(component.paymentForm.get('amount')?.value).toBe('');
    });

    it('should handle payment creation error', () => {
      paymentsService.createPayment.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.paymentForm.patchValue({
        method: 'CASH',
        amount: 100
      });

      component.onSubmitPayment();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error al registrar el pago'
      );
    });
  });

  describe('payment validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should approve payment', () => {
      const approvedPayment = { ...mockPayment, status: 'VALIDATED' as const };
      paymentsService.approvePayment.and.returnValue(of(approvedPayment));
      spyOn(window, 'confirm').and.returnValue(true);

      component.validatePayment(mockPayment);

      expect(paymentsService.approvePayment).toHaveBeenCalledWith('pay-1', 'admin-demo');
      expect(notificationService.success).toHaveBeenCalledWith(
        'Pago validado exitosamente'
      );
    });

    it('should not approve without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.validatePayment(mockPayment);

      expect(paymentsService.approvePayment).not.toHaveBeenCalled();
    });

    it('should reject payment', () => {
      const rejectedPayment = { ...mockPayment, status: 'REJECTED' as const };
      paymentsService.rejectPayment.and.returnValue(of(rejectedPayment));
      spyOn(window, 'confirm').and.returnValue(true);

      component.rejectPayment(mockPayment);

      expect(paymentsService.rejectPayment).toHaveBeenCalledWith('pay-1', 'admin-demo');
      expect(notificationService.success).toHaveBeenCalledWith('Pago rechazado');
    });

    it('should handle validation error', () => {
      paymentsService.approvePayment.and.returnValue(
        throwError(() => new Error('Error'))
      );
      spyOn(window, 'confirm').and.returnValue(true);

      component.validatePayment(mockPayment);

      expect(notificationService.error).toHaveBeenCalledWith('Error al validar el pago');
    });

    it('should update payments list after validation', () => {
      const approvedPayment = { ...mockPayment, status: 'VALIDATED' as const };
      paymentsService.approvePayment.and.returnValue(of(approvedPayment));
      spyOn(window, 'confirm').and.returnValue(true);

      component.validatePayment(mockPayment);

      expect(component.payments[0].status).toBe('VALIDATED');
    });
  });

  describe('calculations', () => {
    beforeEach(() => {
      component.payments = [mockPayment, validatedPayment];
    });

    it('should calculate total paid', () => {
      const totalPaid = component.getTotalPaid();

      expect(totalPaid).toBe(validatedPayment.amount);
    });

    it('should calculate balance pending', () => {
      component.orderTotalAmount = 1500;
      const balance = component.getBalancePending();

      expect(balance).toBe(1500 - validatedPayment.amount);
    });

    it('should return zero balance when fully paid', () => {
      component.orderTotalAmount = validatedPayment.amount;

      expect(component.getBalancePending()).toBe(0);
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get payment method label', () => {
      const label = component.getPaymentMethodLabel('YAPE');
      expect(label).toBe('Yape');
    });

    it('should get payment status label', () => {
      const label = component.getPaymentStatusLabel('VALIDATED');
      expect(label).toBe('Validado');
    });

    it('should get payment status color', () => {
      const color = component.getPaymentStatusColor('VALIDATED');
      expect(color).toBeDefined();
    });

    it('should check if operation number is required', () => {
      expect(component.requiresOperationNumber('YAPE')).toBe(true);
      expect(component.requiresOperationNumber('CASH')).toBe(false);
    });

    it('should check if payment can be validated', () => {
      expect(component.canValidate(mockPayment)).toBe(true);
      expect(component.canValidate(validatedPayment)).toBe(false);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle load error', () => {
      paymentsService.getPaymentsByOrder.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.ngOnInit();

      expect(notificationService.error).toHaveBeenCalledWith('Error al cargar los pagos');
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
