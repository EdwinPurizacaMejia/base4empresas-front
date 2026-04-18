import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient) {}

  getStock(warehouseId: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/${warehouseId}`);
  }
}
