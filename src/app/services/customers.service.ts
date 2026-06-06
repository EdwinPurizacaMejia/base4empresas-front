import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Customer, CustomerCreate, CustomerUpdate } from '../models/customer.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/customers');
  }

  /**
   * Obtener lista de clientes
   * Backend: GET /customers
   */
  getCustomers(options?: { search?: string; validated?: boolean }): Observable<Customer[]> {
    let params = new HttpParams();

    if (options?.search) {
      params = params.set('search', options.search);
    }

    if (typeof options?.validated === 'boolean') {
      params = params.set('validated', String(options.validated));
    }

    return this.http.get<Customer[]>(this.apiUrl, { params });
  }

  /**
   * Obtener detalle de un cliente
   * Backend: GET /customers/{id}
   */
  getCustomerById(id: string): Observable<Customer> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Customer>(url);
  }

  /**
   * Crear un nuevo cliente
   * Backend: POST /customers (con validación automática de RENIEC/SUNAT)
   */
  createCustomer(payload: CustomerCreate): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, payload);
  }

  /**
   * Actualizar datos de un cliente
   * Backend: PATCH /customers/{id}
   */
  updateCustomer(id: string, payload: CustomerUpdate): Observable<Customer> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.patch<Customer>(url, payload);
  }

  /**
   * Validar un DNI (llamada opcional si el backend expone endpoint separado)
   * Backend: POST /customers/validate-dni (opcional)
   */
  validateDni(dni: string): Observable<{ full_name: string; validated: boolean }> {
    const validateUrl = `${this.apiUrl}/validate-dni`;
    return this.http.post<{ full_name: string; validated: boolean }>(validateUrl, { document_number: dni });
  }

  /**
   * Validar un RUC (llamada opcional si el backend expone endpoint separado)
   * Backend: POST /customers/validate-ruc (opcional)
   */
  validateRuc(ruc: string): Observable<{ business_name: string; validated: boolean }> {
    const validateUrl = `${this.apiUrl}/validate-ruc`;
    return this.http.post<{ business_name: string; validated: boolean }>(validateUrl, { document_number: ruc });
  }
}
