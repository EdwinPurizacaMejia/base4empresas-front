import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, ProductCreate } from '../models/product.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Obtener URL base del servicio centralizado
    this.apiUrl = this.apiConfig.buildUrl('/products');
  }

  /**
   * Backend: GET /products?search=&is_active=
   * (mantenemos compat con el parámetro legacy q, pero preferimos search)
   */
  getProducts(options?: {
    search?: string;
    isActive?: boolean;
    q?: string; // legacy
  }): Observable<Product[]> {
    let params = new HttpParams();

    const search = options?.search ?? options?.q;
    if (search) params = params.set('search', search);

    if (typeof options?.isActive === 'boolean') {
      params = params.set('is_active', String(options.isActive));
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Product>(url);
  }

  createProduct(payload: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload);
  }

  updateProduct(id: string, payload: Partial<ProductCreate>): Observable<Product> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.put<Product>(url, payload);
  }

  deleteProduct(id: string): Observable<void> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.delete<void>(url);
  }
}
