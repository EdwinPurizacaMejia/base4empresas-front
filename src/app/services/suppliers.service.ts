import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Supplier, SupplierCreate, SupplierUpdate } from '../models/supplier.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/suppliers');
  }

  /**
   * Obtener lista de proveedores
   * Backend: GET /suppliers
   */
  getSuppliers(options?: { search?: string; validated?: boolean }): Observable<Supplier[]> {
    let params = new HttpParams();

    if (options?.search) {
      params = params.set('search', options.search);
    }

    if (typeof options?.validated === 'boolean') {
      params = params.set('validated', String(options.validated));
    }

    return this.http.get<Supplier[]>(this.apiUrl, { params });
  }

  /**
   * Obtener detalle de un proveedor
   * Backend: GET /suppliers/{id}
   */
  getSupplierById(id: string): Observable<Supplier> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Supplier>(url);
  }

  /**
   * Crear un nuevo proveedor
   * Backend: POST /suppliers (con validación automática de SUNAT/RENIEC)
   */
  createSupplier(payload: SupplierCreate): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, payload);
  }

  /**
   * Actualizar datos de un proveedor
   * Backend: PATCH /suppliers/{id}
   */
  updateSupplier(id: string, payload: SupplierUpdate): Observable<Supplier> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.patch<Supplier>(url, payload);
  }

  /**
   * Validar un RUC (llamada opcional si el backend expone endpoint separado)
   * Backend: POST /suppliers/validate-ruc (opcional)
   */
  validateRuc(ruc: string): Observable<{ business_name: string; validated: boolean }> {
    const validateUrl = `${this.apiUrl}/validate-ruc`;
    return this.http.post<{ business_name: string; validated: boolean }>(validateUrl, { document_number: ruc });
  }

  /**
   * Validar un DNI (llamada opcional si el backend expone endpoint separado)
   * Backend: POST /suppliers/validate-dni (opcional)
   */
  validateDni(dni: string): Observable<{ full_name: string; validated: boolean }> {
    const validateUrl = `${this.apiUrl}/validate-dni`;
    return this.http.post<{ full_name: string; validated: boolean }>(validateUrl, { document_number: dni });
  }
}
