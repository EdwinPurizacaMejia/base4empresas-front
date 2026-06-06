import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InventoryValuationResponse } from '../models/inventory.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private valuationUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Obtener URL base del servicio centralizado
    this.valuationUrl = this.apiConfig.buildUrl('/inventory/valuation');
  }

  /**
   * GET /inventory/valuation?warehouse_id=...&product_id=...&at=...
   */
  getValuationAt(
    warehouseId: string,
    productId: string,
    atIso: string
  ): Observable<InventoryValuationResponse> {
    const params = new HttpParams()
      .set('warehouse_id', warehouseId)
      .set('product_id', productId)
      .set('at', atIso);

    return this.http.get<InventoryValuationResponse>(this.valuationUrl, { params });
  }
}
