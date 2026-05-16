import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  PurchaseCreate,
  PurchaseResponse,
  Purchase,
  PurchaseListItem,
} from '../models/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  createPurchase(payload: PurchaseCreate): Observable<PurchaseResponse> {
    return this.http
      .post<PurchaseResponse>(this.apiUrl, payload)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getPurchases(): Observable<PurchaseListItem[]> {
    return this.http
      .get<PurchaseListItem[]>(this.apiUrl)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getPurchaseById(purchaseId: string): Observable<Purchase> {
    return this.http
      .get<Purchase>(`${this.apiUrl}/${purchaseId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.status === 0
        ? `No se pudo conectar con el servidor de compras (${this.apiUrl}). Verifica que el backend esté encendido y respondiendo.`
        : error.error?.detail || error.message || 'Error inesperado en compras';

    return throwError(() => ({ ...error, userMessage: message }));
  }
}
