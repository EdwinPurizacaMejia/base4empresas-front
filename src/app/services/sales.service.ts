import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import {
  SaleCreate,
  SaleCreateResponse,
  SaleDetail,
  SaleListItem,
  SaleResponse,
  SaleCostsSummary,
} from '../models/sale.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Obtener URL base del servicio centralizado
    this.apiUrl = this.apiConfig.buildUrl('/sales');
  }

  /**
   * POST /sales devuelve un dict { id, number, total } (no el SaleResponse completo).
   */
  createSale(payload: SaleCreate): Observable<SaleCreateResponse> {
    return this.http.post<SaleCreateResponse>(this.apiUrl, payload);
  }

  getSales(): Observable<SaleListItem[]> {
    return this.http.get<SaleResponse[]>(this.apiUrl).pipe(
      map((rows) => rows.map((s) => this.enrichSaleCosts(s)))
    );
  }

  getSaleById(id: string): Observable<SaleDetail> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SaleResponse>(url).pipe(
      map((s) => this.enrichSaleCosts(s))
    );
  }

  private enrichSaleCosts<T extends SaleResponse>(sale: T): T & SaleCostsSummary {
    const items = sale.items || [];
    const cost_total = items.reduce((acc, it) => acc + (Number(it.total_cost) || 0), 0);
    const gross_profit = (Number(sale.total) || 0) - cost_total;
    const gross_margin_pct =
      (Number(sale.total) || 0) > 0
        ? (gross_profit / (Number(sale.total) || 1)) * 100
        : 0;

    return {
      ...(sale as any),
      cost_total,
      gross_profit,
      gross_margin_pct,
    };
  }
}
