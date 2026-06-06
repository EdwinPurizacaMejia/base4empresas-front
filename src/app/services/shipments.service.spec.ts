import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ShipmentsService } from './shipments.service';
import { ApiConfigService } from './api-config.service';
import { Shipment, ShipmentCreate, ShipmentUpdateStatus } from '../models/shipment.model';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let httpMock: HttpTestingController;
  let apiConfigService: jasmine.SpyObj<ApiConfigService>;

  const mockShipment: Shipment = {
    id: 'ship-1',
    order_id: 'ord-1',
    shipping_method: 'MOTORBIKE',
    carrier_name: 'Motoboy Express',
    tracking_number: 'MB-123456',
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

  beforeEach(() => {
    const apiConfigServiceSpy = jasmine.createSpyObj('ApiConfigService', ['buildUrl']);
    apiConfigServiceSpy.buildUrl.and.returnValue('http://localhost:3000/api/shipments');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ShipmentsService,
        { provide: ApiConfigService, useValue: apiConfigServiceSpy }
      ]
    });

    service = TestBed.inject(ShipmentsService);
    apiConfigService = TestBed.inject(ApiConfigService) as jasmine.SpyObj<ApiConfigService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createShipment', () => {
    it('should POST to /shipments with payload', () => {
      const payload: ShipmentCreate = {
        order_id: 'ord-1',
        shipping_method: 'MOTORBIKE',
        carrier_name: 'Motoboy Express',
        tracking_number: 'MB-123456',
        destination_address: 'Av. Principal 123, Lima',
        recipient_name: 'Juan Pérez',
        recipient_phone: '987654321',
        scheduled_date: '2026-05-28'
      };

      service.createShipment(payload).subscribe((result) => {
        expect(result).toEqual(mockShipment);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shipments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockShipment);
    });

    it('should handle optional carrier_name', () => {
      const payload: ShipmentCreate = {
        order_id: 'ord-1',
        shipping_method: 'PICKUP_STORE',
        destination_address: 'Tienda Centro',
        recipient_name: 'María García',
        recipient_phone: '987654321'
      };

      service.createShipment(payload).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/shipments');
      expect(req.request.body.carrier_name).toBeUndefined();
      req.flush(mockShipment);
    });

    it('should handle optional scheduled_date', () => {
      const payload: ShipmentCreate = {
        order_id: 'ord-1',
        shipping_method: 'MOTORBIKE',
        carrier_name: 'Motoboy',
        destination_address: 'Av. 123',
        recipient_name: 'Juan',
        recipient_phone: '987654321'
      };

      service.createShipment(payload).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/shipments');
      expect(req.request.body.scheduled_date).toBeUndefined();
      req.flush(mockShipment);
    });
  });

  describe('updateShipmentStatus', () => {
    it('should PATCH to /shipments/{id}/status with new status', () => {
      const payload: ShipmentUpdateStatus = {
        status: 'IN_TRANSIT'
      };

      service.updateShipmentStatus('ship-1', payload).subscribe((result) => {
        expect(result.status).toBe('IN_TRANSIT');
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1/status'
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      const updatedShipment = { ...mockShipment, status: 'IN_TRANSIT' as const };
      req.flush(updatedShipment);
    });

    it('should include tracking_number when provided', () => {
      const payload: ShipmentUpdateStatus = {
        status: 'IN_TRANSIT',
        tracking_number: 'MB-999999'
      };

      service.updateShipmentStatus('ship-1', payload).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1/status'
      );
      expect(req.request.body.tracking_number).toBe('MB-999999');
      req.flush(mockShipment);
    });

    it('should URL encode shipment ID', () => {
      const payload: ShipmentUpdateStatus = {
        status: 'DELIVERED'
      };

      service.updateShipmentStatus('ship-1:special/char', payload).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1%3Aspecial%2Fchar/status'
      );
      req.flush(mockShipment);
    });

    it('should update to DELIVERED status', () => {
      const payload: ShipmentUpdateStatus = {
        status: 'DELIVERED'
      };

      service.updateShipmentStatus('ship-1', payload).subscribe((result) => {
        expect(result.status).toBe('DELIVERED');
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1/status'
      );
      const delivered = { ...mockShipment, status: 'DELIVERED' as const };
      req.flush(delivered);
    });

    it('should update to CANCELLED status', () => {
      const payload: ShipmentUpdateStatus = {
        status: 'CANCELLED'
      };

      service.updateShipmentStatus('ship-1', payload).subscribe((result) => {
        expect(result.status).toBe('CANCELLED');
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1/status'
      );
      const cancelled = { ...mockShipment, status: 'CANCELLED' as const };
      req.flush(cancelled);
    });
  });

  describe('getShipment', () => {
    it('should GET /shipments/{id}', () => {
      service.getShipment('ship-1').subscribe((result) => {
        expect(result).toEqual(mockShipment);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shipments/ship-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockShipment);
    });

    it('should URL encode shipment ID', () => {
      service.getShipment('ship-1:special/char').subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments/ship-1%3Aspecial%2Fchar'
      );
      req.flush(mockShipment);
    });
  });

  describe('getShipmentsByOrder', () => {
    it('should GET /shipments with order_id query param', () => {
      const mockShipments: Shipment[] = [mockShipment];

      service.getShipmentsByOrder('ord-1').subscribe((result) => {
        expect(result).toEqual(mockShipments);
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments?order_id=ord-1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockShipments);
    });

    it('should URL encode order ID in query param', () => {
      service.getShipmentsByOrder('ord-1:special/char').subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/shipments?order_id=ord-1%3Aspecial%2Fchar'
      );
      req.flush([]);
    });

    it('should return empty array when no shipments', () => {
      service.getShipmentsByOrder('ord-999').subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shipments?order_id=ord-999');
      req.flush([]);
    });

    it('should return multiple shipments for same order', () => {
      const shipment2: Shipment = {
        ...mockShipment,
        id: 'ship-2',
        shipping_method: 'COURIER_OLVA'
      };
      const mockShipments: Shipment[] = [mockShipment, shipment2];

      service.getShipmentsByOrder('ord-1').subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result).toEqual(mockShipments);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shipments?order_id=ord-1');
      req.flush(mockShipments);
    });
  });
});
