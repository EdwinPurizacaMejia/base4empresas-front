import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';

/**
 * Interfaz para respuesta paginada del backend
 */
interface PaginatedDocumentResponse {
  total: number;
  skip: number;
  limit: number;
  items: any[];
}

/**
 * Filtros para listar documentos electrónicos
 */
export interface ElectronicDocumentFilters {
  page?: number;
  page_size?: number;
  status?: string;
  document_type?: string;
  search?: string;
}

/**
 * Servicio para gestión de documentos electrónicos
 * Endpoint: /api/v1/electronic-documents
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronicDocumentsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/api/v1/electronic-documents');
  }

  /**
   * Obtener lista de documentos electrónicos con filtros opcionales
   * Backend: GET /api/v1/electronic-documents - Devuelve respuesta paginada
   * 
   * @param filters - Filtros opcionales (page, page_size, status, document_type, search)
   * @returns Observable con respuesta paginada
   */
  listDocuments(filters?: ElectronicDocumentFilters): Observable<PaginatedDocumentResponse> {
    let params = new HttpParams();

    if (filters?.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }

    if (filters?.page_size !== undefined) {
      params = params.set('page_size', filters.page_size.toString());
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.document_type) {
      params = params.set('document_type', filters.document_type);
    }

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<PaginatedDocumentResponse>(this.apiUrl, { params });
  }
}
