import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Warehouse } from '../models/warehouse.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/warehouses');
  }

  /**
   * Backend: GET /warehouses?search=&is_active=
   */
  getWarehouses(options?: { search?: string; isActive?: boolean }): Observable<Warehouse[]> {
    let params = new HttpParams();

    if (options?.search) params = params.set('search', options.search);

    if (typeof options?.isActive === 'boolean') {
      params = params.set('is_active', String(options.isActive));
    }

    return this.http.get<Warehouse[]>(this.apiUrl, { params });
  }

  getWarehouseById(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  createWarehouse(payload: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, payload);
  }

  updateWarehouse(id: string, payload: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/${encodeURIComponent(id)}`, payload);
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
