import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Stock } from '../models/stock.model';
import { InventoryStockCurrentItem } from '../models/inventory.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private inventoryStockCurrentUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.inventoryStockCurrentUrl = this.apiConfig.buildUrl('/inventory/stock/current');
  }

  /**
   * GET /inventory/stock/current?warehouse_id=... (&product_id=...)
   */
  getStockCurrent(warehouseId: string, productId?: string): Observable<InventoryStockCurrentItem[]> {
    let params = new HttpParams().set('warehouse_id', warehouseId);
    if (productId) params = params.set('product_id', productId);

    return this.http.get<InventoryStockCurrentItem[]>(this.inventoryStockCurrentUrl, { params });
  }
}
