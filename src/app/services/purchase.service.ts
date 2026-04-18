import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PurchaseCreate, PurchaseResponse, Purchase, PurchaseListItem } from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private apiUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  createPurchase(payload: PurchaseCreate): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(this.apiUrl, payload);
  }

  getPurchases(): Observable<PurchaseListItem[]> {
    return this.http.get<PurchaseListItem[]>(this.apiUrl);
  }

  getPurchaseById(purchaseId: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.apiUrl}/${purchaseId}`);
  }
}
