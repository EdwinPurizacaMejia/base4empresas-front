import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { KardexService } from './kardex.service';
import { environment } from '../../environments/environment';

describe('KardexService', () => {
  let service: KardexService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KardexService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(KardexService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call inventory kardex with warehouse_id + product_id', () => {
    service
      .getKardex({
        warehouseId: 'W1',
        productId: 'P1',
      })
      .subscribe(() => {
        expect(true).toBeTrue(); // evita warning "has no expectations"
      });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/kardex` &&
        r.params.get('warehouse_id') === 'W1' &&
        r.params.get('product_id') === 'P1'
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`${environment.apiUrl}/inventory/kardex`);
    expect(req.request.params.get('warehouse_id')).toBe('W1');
    expect(req.request.params.get('product_id')).toBe('P1');

    req.flush([]);
  });

  it('should include from_date and to_date when provided', () => {
    service
      .getKardex({
        warehouseId: 'W1',
        productId: 'P1',
        fromDate: '2026-01-01T00:00:00.000Z',
        toDate: '2026-01-31T23:59:59.000Z',
      })
      .subscribe(() => {
        expect(true).toBeTrue(); // evita warning "has no expectations"
      });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/kardex` &&
        r.params.get('warehouse_id') === 'W1' &&
        r.params.get('product_id') === 'P1' &&
        r.params.get('from_date') === '2026-01-01T00:00:00.000Z' &&
        r.params.get('to_date') === '2026-01-31T23:59:59.000Z'
      );
    });

    expect(req.request.params.get('from_date')).toBe('2026-01-01T00:00:00.000Z');
    expect(req.request.params.get('to_date')).toBe('2026-01-31T23:59:59.000Z');

    req.flush([]);
  });

  it('should allow kardex call without product_id (optional)', () => {
    service
      .getKardex({
        warehouseId: 'W1',
      })
      .subscribe(() => {
        expect(true).toBeTrue(); // evita warning "has no expectations"
      });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/kardex` &&
        r.params.get('warehouse_id') === 'W1' &&
        !r.params.has('product_id')
      );
    });

    expect(req.request.params.has('product_id')).toBeFalse();

    req.flush([]);
  });
});
