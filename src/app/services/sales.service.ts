import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SaleCreate, SaleResponse, SaleListItem, SaleDetail } from '../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  createSale(payload: SaleCreate): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.apiUrl, payload);
  }

  getSales(): Observable<SaleListItem[]> {
    return this.http.get<SaleListItem[]>(this.apiUrl);
  }

  getSaleById(id: string): Observable<SaleDetail> {
    return this.http.get<SaleDetail>(`${this.apiUrl}/${id}`);
  }
}
