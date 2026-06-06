import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SalesChannel, SalesChannelCreate, SalesChannelUpdate } from '../models/sales-channel.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SalesChannelsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/sales-channels');
  }

  /**
   * Obtener lista de canales de venta
   * Backend: GET /sales-channels
   */
  getChannels(options?: { isActive?: boolean }): Observable<SalesChannel[]> {
    let params = new HttpParams();

    if (typeof options?.isActive === 'boolean') {
      params = params.set('is_active', String(options.isActive));
    }

    return this.http.get<SalesChannel[]>(this.apiUrl, { params });
  }

  /**
   * Obtener detalle de un canal
   * Backend: GET /sales-channels/{id}
   */
  getChannelById(id: string): Observable<SalesChannel> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<SalesChannel>(url);
  }

  /**
   * Crear un nuevo canal de venta
   * Backend: POST /sales-channels
   */
  createChannel(payload: SalesChannelCreate): Observable<SalesChannel> {
    return this.http.post<SalesChannel>(this.apiUrl, payload);
  }

  /**
   * Actualizar canal de venta
   * Backend: PATCH /sales-channels/{id}
   */
  updateChannel(id: string, payload: SalesChannelUpdate): Observable<SalesChannel> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.patch<SalesChannel>(url, payload);
  }

  /**
   * Activar/desactivar un canal
   * Backend: PATCH /sales-channels/{id}
   */
  toggleChannel(id: string, isActive: boolean): Observable<SalesChannel> {
    return this.updateChannel(id, { is_active: isActive });
  }
}
