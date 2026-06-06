import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { CostingConfigService } from './costing-config.service';
import { environment } from '../../environments/environment';
import { CostingConfigUpdate } from '../models/costing-config.model';

describe('CostingConfigService', () => {
  let service: CostingConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CostingConfigService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CostingConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call GET /config/costing/{warehouse_id}', () => {
    service.getCostingConfig('W1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/config/costing/W1`);
    expect(req.request.method).toBe('GET');

    req.flush({ warehouse_id: 'W1', method: 'PP' });
  });

  it('should call PUT /config/costing/{warehouse_id} with payload', () => {
    const payload: CostingConfigUpdate = { method: 'FIFO' };

    service.updateCostingConfig('W1', payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/config/costing/W1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({ warehouse_id: 'W1', method: 'FIFO' });
  });
});
