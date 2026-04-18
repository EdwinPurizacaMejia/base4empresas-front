import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Product, ProductCreate } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(q?: string): Observable<Product[]> {
    let params = new HttpParams();

    if (q) {
      params = params.set('q', q);
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  createProduct(payload: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload);
  }
}