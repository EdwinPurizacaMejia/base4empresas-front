import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { InventoryService } from './inventory.service';
import { environment } from '../../environments/environment';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventoryService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call valuation endpoint with warehouse_id, product_id and at', () => {
    service.getValuationAt('W1', 'P1', '2026-01-01T00:00:00.000Z').subscribe(() => {
      expect(true).toBeTrue(); // evita warning "has no expectations"
    });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/valuation` &&
        r.params.get('warehouse_id') === 'W1' &&
        r.params.get('product_id') === 'P1' &&
        r.params.get('at') === '2026-01-01T00:00:00.000Z'
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`${environment.apiUrl}/inventory/valuation`);
    expect(req.request.params.get('warehouse_id')).toBe('W1');
    expect(req.request.params.get('product_id')).toBe('P1');
    expect(req.request.params.get('at')).toBe('2026-01-01T00:00:00.000Z');

    req.flush({
      warehouse_id: 'W1',
      product_id: 'P1',
      at: '2026-01-01T00:00:00.000Z',
      quantity_on_hand: 0,
      avg_unit_cost: 0,
      stock_value: 0,
    });
  });
});
