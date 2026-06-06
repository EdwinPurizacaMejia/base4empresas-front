import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { SalesService } from './sales.service';
import { environment } from '../../environments/environment';
import { SaleCreate } from '../models/sale.model';

describe('SalesService', () => {
  let service: SalesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SalesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getSales() should call GET /sales and enrich costs summary fields', () => {
    service.getSales().subscribe((rows) => {
      expect(rows.length).toBe(1);
      expect(rows[0].cost_total).toBeCloseTo(12.5, 6);
      expect(rows[0].gross_profit).toBeCloseTo(100 - 12.5, 6);
      expect(rows[0].gross_margin_pct).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sales`);
    expect(req.request.method).toBe('GET');

    req.flush([
      {
        id: 'S1',
        number: 'V-0001',
        customer_id: null,
        warehouse_id: 'W1',
        sale_date: '2026-05-24T00:00:00Z',
        status: 'CONFIRMED',
        payment_status: 'PAID',
        subtotal: 90,
        tax: 10,
        total: 100,
        notes: null,
        items: [
          {
            id: 'I1',
            product_id: 'P1',
            quantity: 2,
            unit_price: 50,
            unit_cost: 6.25,
            total_cost: 12.5,
            subtotal: 90,
            tax: 10,
            total: 100,
          },
        ],
      },
    ]);
  });

  it('getSaleById() should call GET /sales/{id} and enrich costs summary fields', () => {
    service.getSaleById('S1').subscribe((sale) => {
      expect(sale.id).toBe('S1');
      expect(sale.cost_total).toBeCloseTo(20, 6);
      expect(sale.gross_profit).toBeCloseTo(80, 6);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sales/S1`);
    expect(req.request.method).toBe('GET');

    req.flush({
      id: 'S1',
      number: 'V-0001',
      customer_id: null,
      warehouse_id: 'W1',
      sale_date: '2026-05-24T00:00:00Z',
      status: 'CONFIRMED',
      payment_status: 'PAID',
      subtotal: 90,
      tax: 10,
      total: 100,
      notes: null,
      items: [
        {
          id: 'I1',
          product_id: 'P1',
          quantity: 2,
          unit_price: 50,
          unit_cost: 10,
          total_cost: 20,
          subtotal: 90,
          tax: 10,
          total: 100,
        },
      ],
    });
  });

  it('createSale() should call POST /sales and return simplified response', () => {
    const payload: SaleCreate = {
      customer_id: null,
      warehouse_id: 'W1',
      notes: null,
      items: [{ product_id: 'P1', quantity: 1, unit_price: 100 }],
    };

    service.createSale(payload).subscribe((res) => {
      expect(res.id).toBe('S1');
      expect(res.number).toBe('V-0001');
      expect(res.total).toBe(100);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sales`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ id: 'S1', number: 'V-0001', total: 100 });
  });
});
