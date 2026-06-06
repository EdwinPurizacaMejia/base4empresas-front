import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { OrderShipmentsComponent } from './order-shipments.component';
import { ShipmentsService } from '../../../services/shipments.service';
import { NotificationService } from '../../../services/notification.service';
import { Shipment } from '../../../models/shipment.model';

describe('OrderShipmentsComponent', () => {
  let component: OrderShipmentsComponent;
  let fixture: ComponentFixture<OrderShipmentsComponent>;
  let shipmentsService: jasmine.SpyObj<ShipmentsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockShipment: Shipment = {
    id: 'ship-1',
    order_id: 'ord-1',
    shipping_method: 'MOTORBIKE',
    carrier_name: 'Motoboy Express',
    tracking_number: 'MB-12345',
    destination_address: 'Av. Principal 123, Lima',
    recipient_name: 'Juan Pérez',
    recipient_phone: '987654321',
    status: 'PENDING',
    scheduled_date: '2026-05-28',
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    created_at: '2026-05-26T10:00:00Z',
    updated_at: '2026-05-26T10:00:00Z'
  };

  const pickupShipment: Shipment = {
    ...mockShipment,
    id: 'ship-2',
    shipping_method: 'PICKUP_STORE',
    carrier_name: null,
    destination_address: 'Tienda Centro'
  };

  beforeEach(async () => {
    const shipmentsServiceSpy = jasmine.createSpyObj('ShipmentsService', [
      'getShipmentsByOrder',
      'createShipment',
      'updateShipmentStatus'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning'
    ]);

    await TestBed.configureTestingModule({
      imports: [OrderShipmentsComponent, ReactiveFormsModule],
      providers: [
        { provide: ShipmentsService, useValue: shipmentsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    shipmentsService = TestBed.inject(ShipmentsService) as jasmine.SpyObj<ShipmentsService>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    shipmentsService.getShipmentsByOrder.and.returnValue(of([mockShipment, pickupShipment]));

    fixture = TestBed.createComponent(OrderShipmentsComponent);
    component = fixture.componentInstance;
    component.orderId = 'ord-1';
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load shipments on init', () => {
      fixture.detectChanges();

      expect(shipmentsService.getShipmentsByOrder).toHaveBeenCalledWith('ord-1');
      expect(component.shipments.length).toBe(2);
    });

    it('should initialize form with default values', () => {
      fixture.detectChanges();

      expect(component.shipmentForm.get('shipping_method')?.value).toBe('');
      expect(component.shipmentForm.get('scheduled_date')?.value).toBeTruthy();
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

    it('should require shipping_method field', () => {
      const methodControl = component.shipmentForm.get('shipping_method');
      methodControl?.setValue('');

      expect(methodControl?.hasError('required')).toBe(true);
    });

    it('should require recipient_name field', () => {
      const nameControl = component.shipmentForm.get('recipient_name');
      nameControl?.setValue('');

      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should require recipient_phone field', () => {
      const phoneControl = component.shipmentForm.get('recipient_phone');
      phoneControl?.setValue('');

      expect(phoneControl?.hasError('required')).toBe(true);
    });

    it('should validate recipient_phone has minimum length', () => {
      const phoneControl = component.shipmentForm.get('recipient_phone');
      phoneControl?.setValue('123');

      expect(phoneControl?.hasError('minlength')).toBe(true);
    });

    it('should validate recipient_phone only accepts digits', () => {
      const phoneControl = component.shipmentForm.get('recipient_phone');
      phoneControl?.setValue('98765abc');

      expect(phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should require destination_address for MOTORBIKE method', () => {
      component.shipmentForm.patchValue({ shipping_method: 'MOTORBIKE' });
      const destControl = component.shipmentForm.get('destination_address');

      expect(destControl?.hasError('required')).toBe(true);
    });

    it('should NOT require destination_address for PICKUP_STORE method', () => {
      component.shipmentForm.patchValue({
        shipping_method: 'PICKUP_STORE',
        destination_address: ''
      });
      component.shipmentForm.get('destination_address')?.updateValueAndValidity();
      const destControl = component.shipmentForm.get('destination_address');

      expect(destControl?.hasError('required')).toBe(false);
    });

    it('should require carrier_name for COURIER_OLVA method', () => {
      component.shipmentForm.patchValue({ shipping_method: 'COURIER_OLVA' });
      const carrierControl = component.shipmentForm.get('carrier_name');

      expect(carrierControl?.hasError('required')).toBe(true);
    });

    it('should NOT require carrier_name for PICKUP_STORE method', () => {
      component.shipmentForm.patchValue({
        shipping_method: 'PICKUP_STORE',
        carrier_name: ''
      });
      component.shipmentForm.get('carrier_name')?.updateValueAndValidity();
      const carrierControl = component.shipmentForm.get('carrier_name');

      expect(carrierControl?.hasError('required')).toBe(false);
    });
  });

  describe('shipment creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create shipment with valid form', () => {
      const newShipment = { ...mockShipment, id: 'ship-3' };
      shipmentsService.createShipment.and.returnValue(of(newShipment));

      component.shipmentForm.patchValue({
        shipping_method: 'MOTORBIKE',
        carrier_name: 'Motoboy',
        destination_address: 'Av. 123, Lima',
        recipient_name: 'Juan Pérez',
        recipient_phone: '987654321'
      });

      component.onSubmitShipment();

      expect(shipmentsService.createShipment).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Envío registrado exitosamente');
      expect(component.shipments.length).toBe(3);
    });

    it('should not create shipment with invalid form', () => {
      component.shipmentForm.patchValue({
        shipping_method: '',
        recipient_name: ''
      });

      component.onSubmitShipment();

      expect(shipmentsService.createShipment).not.toHaveBeenCalled();
      expect(notificationService.warning).toHaveBeenCalled();
    });

    it('should reset form after successful shipment creation', () => {
      shipmentsService.createShipment.and.returnValue(of(mockShipment));

      component.shipmentForm.patchValue({
        shipping_method: 'COURIER_OLVA',
        carrier_name: 'Olva',
        destination_address: 'Av. 456',
        recipient_name: 'María García',
        recipient_phone: '912345678'
      });

      component.onSubmitShipment();

      expect(component.shipmentForm.get('shipping_method')?.value).toBe('');
      expect(component.shipmentForm.get('recipient_name')?.value).toBe('');
    });

    it('should emit shipmentCreated event after creation', (done) => {
      shipmentsService.createShipment.and.returnValue(of(mockShipment));

      component.shipmentCreated.subscribe((shipment) => {
        expect(shipment.id).toBe('ship-1');
        done();
      });

      component.shipmentForm.patchValue({
        shipping_method: 'MOTORBIKE',
        carrier_name: 'Moto',
        destination_address: 'Av. 123',
        recipient_name: 'Juan',
        recipient_phone: '987654321'
      });

      component.onSubmitShipment();
    });

    it('should handle shipment creation error', () => {
      shipmentsService.createShipment.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.shipmentForm.patchValue({
        shipping_method: 'PICKUP_STORE',
        destination_address: 'Tienda',
        recipient_name: 'Juan',
        recipient_phone: '987654321'
      });

      component.onSubmitShipment();

      expect(notificationService.error).toHaveBeenCalledWith('Error al crear el envío');
    });
  });

  describe('shipment status updates', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update from PENDING to IN_TRANSIT', () => {
      const updatedShipment = { ...mockShipment, status: 'IN_TRANSIT' as const };
      shipmentsService.updateShipmentStatus.and.returnValue(of(updatedShipment));
      spyOn(window, 'confirm').and.returnValue(true);

      component.updateStatus(mockShipment, 'IN_TRANSIT');

      expect(shipmentsService.updateShipmentStatus).toHaveBeenCalledWith('ship-1', {
        status: 'IN_TRANSIT'
      });
      expect(notificationService.success).toHaveBeenCalledWith('Envío marcado como En ruta');
    });

    it('should update from IN_TRANSIT to DELIVERED', () => {
      const inTransit = { ...mockShipment, status: 'IN_TRANSIT' as const };
      const delivered = { ...inTransit, status: 'DELIVERED' as const };
      shipmentsService.updateShipmentStatus.and.returnValue(of(delivered));
      spyOn(window, 'confirm').and.returnValue(true);

      component.updateStatus(inTransit, 'DELIVERED');

      expect(shipmentsService.updateShipmentStatus).toHaveBeenCalledWith('ship-1', {
        status: 'DELIVERED'
      });
      expect(notificationService.success).toHaveBeenCalledWith(
        'Envío marcado como Entregado'
      );
    });

    it('should cancel PENDING shipment', () => {
      const cancelled = { ...mockShipment, status: 'CANCELLED' as const };
      shipmentsService.updateShipmentStatus.and.returnValue(of(cancelled));
      spyOn(window, 'confirm').and.returnValue(true);

      component.updateStatus(mockShipment, 'CANCELLED');

      expect(shipmentsService.updateShipmentStatus).toHaveBeenCalledWith('ship-1', {
        status: 'CANCELLED'
      });
    });

    it('should not update without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.updateStatus(mockShipment, 'IN_TRANSIT');

      expect(shipmentsService.updateShipmentStatus).not.toHaveBeenCalled();
    });

    it('should prevent invalid transitions', () => {
      const delivered = { ...mockShipment, status: 'DELIVERED' as const };

      component.updateStatus(delivered, 'PENDING');

      expect(notificationService.warning).toHaveBeenCalledWith(
        'Transición de estado no permitida'
      );
    });

    it('should emit shipmentUpdated event after update', (done) => {
      const updated = { ...mockShipment, status: 'IN_TRANSIT' as const };
      shipmentsService.updateShipmentStatus.and.returnValue(of(updated));
      spyOn(window, 'confirm').and.returnValue(true);

      component.shipmentUpdated.subscribe((shipment) => {
        expect(shipment.status).toBe('IN_TRANSIT');
        done();
      });

      component.updateStatus(mockShipment, 'IN_TRANSIT');
    });

    it('should handle status update error', () => {
      shipmentsService.updateShipmentStatus.and.returnValue(
        throwError(() => new Error('Error'))
      );
      spyOn(window, 'confirm').and.returnValue(true);

      component.updateStatus(mockShipment, 'IN_TRANSIT');

      expect(notificationService.error).toHaveBeenCalledWith('Error al actualizar el envío');
    });

    it('should update shipments list after status change', () => {
      component.shipments = [mockShipment];
      const updated = { ...mockShipment, status: 'IN_TRANSIT' as const };
      shipmentsService.updateShipmentStatus.and.returnValue(of(updated));
      spyOn(window, 'confirm').and.returnValue(true);

      component.updateStatus(mockShipment, 'IN_TRANSIT');

      expect(component.shipments[0].status).toBe('IN_TRANSIT');
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get shipping method label', () => {
      const label = component.getShippingMethodLabel('MOTORBIKE');
      expect(label).toBe('Motorizado');
    });

    it('should get shipment status label', () => {
      const label = component.getShipmentStatusLabel('IN_TRANSIT');
      expect(label).toBe('En ruta');
    });

    it('should get shipment status color', () => {
      const color = component.getShipmentStatusColor('PENDING');
      expect(color).toBe('warn');
    });

    it('should check destination address requirement', () => {
      expect(component.requiresDestinationAddress('MOTORBIKE')).toBe(true);
      expect(component.requiresDestinationAddress('PICKUP_STORE')).toBe(false);
    });

    it('should check carrier name requirement', () => {
      expect(component.requiresCarrierName('COURIER_OLVA')).toBe(true);
      expect(component.requiresCarrierName('PICKUP_STORE')).toBe(false);
    });

    it('should get available transitions from PENDING', () => {
      const transitions = component.getAvailableTransitions('PENDING');
      expect(transitions).toContain('IN_TRANSIT');
      expect(transitions).toContain('CANCELLED');
    });

    it('should get available transitions from IN_TRANSIT', () => {
      const transitions = component.getAvailableTransitions('IN_TRANSIT');
      expect(transitions).toContain('DELIVERED');
      expect(transitions).toContain('CANCELLED');
    });

    it('should get no transitions from DELIVERED', () => {
      const transitions = component.getAvailableTransitions('DELIVERED');
      expect(transitions.length).toBe(0);
    });

    it('should verify status transition validity', () => {
      expect(component.canTransitionTo('PENDING', 'IN_TRANSIT')).toBe(true);
      expect(component.canTransitionTo('PENDING', 'DELIVERED')).toBe(false);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle load error', () => {
      shipmentsService.getShipmentsByOrder.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.loadShipments();

      expect(notificationService.error).toHaveBeenCalledWith('Error al cargar los envíos');
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
