import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { KardexMovement } from '../models/kardex.model';

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  private apiUrl = `${environment.apiUrl}/stock/kardex`;

  constructor(private http: HttpClient) {}

  getKardex(productId: string, warehouseId: string): Observable<KardexMovement[]> {
    return this.http.get<KardexMovement[]>(`${this.apiUrl}/${productId}/${warehouseId}`);
  }
}
