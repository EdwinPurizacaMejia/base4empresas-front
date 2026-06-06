import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CostingConfigResponse, CostingConfigUpdate } from '../models/costing-config.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class CostingConfigService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/config/costing');
  }

  getCostingConfig(warehouseId: string): Observable<CostingConfigResponse> {
    return this.http.get<CostingConfigResponse>(`${this.apiUrl}/${encodeURIComponent(warehouseId)}`);
  }

  updateCostingConfig(warehouseId: string, payload: CostingConfigUpdate): Observable<CostingConfigResponse> {
    return this.http.put<CostingConfigResponse>(`${this.apiUrl}/${encodeURIComponent(warehouseId)}`, payload);
  }
}
