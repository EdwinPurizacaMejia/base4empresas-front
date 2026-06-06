import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { StockService } from './stock.service';
import { environment } from '../../environments/environment';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StockService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call inventory stock current with warehouse_id', () => {
    service.getStockCurrent('W1').subscribe(() => {
      expect(true).toBeTrue(); // evita warning "has no expectations"
    });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/stock/current` &&
        r.params.get('warehouse_id') === 'W1' &&
        !r.params.has('product_id')
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`${environment.apiUrl}/inventory/stock/current`);
    expect(req.request.params.get('warehouse_id')).toBe('W1');
    expect(req.request.params.has('product_id')).toBeFalse();

    req.flush([]);
  });

  it('should include product_id when provided', () => {
    service.getStockCurrent('W1', 'P1').subscribe(() => {
      expect(true).toBeTrue(); // evita warning "has no expectations"
    });

    const req = httpMock.expectOne((r) => {
      return (
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/inventory/stock/current` &&
        r.params.get('warehouse_id') === 'W1' &&
        r.params.get('product_id') === 'P1'
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`${environment.apiUrl}/inventory/stock/current`);
    expect(req.request.params.get('warehouse_id')).toBe('W1');
    expect(req.request.params.get('product_id')).toBe('P1');

    req.flush([]);
  });
});
