import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogListResponse,
  AuditableEntityType
} from '../models/audit-log.model';

/**
 * Servicio de Auditoría - FASE 5
 * 
 * Gestiona consultas de registros de auditoría del backend.
 * Proporciona métodos para obtener historial de cambios por entidad.
 * 
 * Endpoints esperados:
 * - GET /api/audit-logs?entity_type=...&entity_id=...
 * - GET /api/audit-logs/{id}
 */
@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.baseUrl = this.apiConfig.buildUrl('/audit-logs');
  }

  /**
   * Obtener logs de auditoría por entidad
   * 
   * @param entityType - Tipo de entidad (ORDER, PAYMENT, SHIPMENT, etc.)
   * @param entityId - ID de la entidad
   * @param filters - Filtros adicionales (paginación, rango de fechas, etc.)
   * @returns Observable con lista de AuditLog ordenados por timestamp DESC
   */
  getLogsByEntity(
    entityType: AuditableEntityType,
    entityId: string,
    filters?: Partial<AuditLogFilters>
  ): Observable<AuditLog[]> {
    let params = new HttpParams();
    params = params.set('entity_type', entityType);
    params = params.set('entity_id', encodeURIComponent(entityId));

    if (filters) {
      if (filters.action) {
        params = params.set('action', filters.action);
      }
      if (filters.severity) {
        params = params.set('severity', filters.severity);
      }
      if (filters.actor_id) {
        params = params.set('actor_id', encodeURIComponent(filters.actor_id));
      }
      if (filters.start_date) {
        params = params.set('start_date', filters.start_date);
      }
      if (filters.end_date) {
        params = params.set('end_date', filters.end_date);
      }
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset !== undefined) {
        params = params.set('offset', filters.offset.toString());
      }
    }

    return this.http.get<AuditLog[]>(this.baseUrl, { params });
  }

  /**
   * Obtener un registro de auditoría específico por ID
   * 
   * @param id - ID del registro de auditoría
   * @returns Observable con el AuditLog
   */
  getLogById(id: string): Observable<AuditLog> {
    const url = `${this.baseUrl}/${encodeURIComponent(id)}`;
    return this.http.get<AuditLog>(url);
  }

  /**
   * Obtener logs de auditoría con búsqueda avanzada y paginación
   * 
   * @param filters - Filtros de búsqueda
   * @returns Observable con respuesta paginada
   */
  searchLogs(filters: AuditLogFilters): Observable<AuditLogListResponse> {
    let params = new HttpParams();

    if (filters.entity_type) {
      params = params.set('entity_type', filters.entity_type);
    }
    if (filters.entity_id) {
      params = params.set('entity_id', encodeURIComponent(filters.entity_id));
    }
    if (filters.actor_id) {
      params = params.set('actor_id', encodeURIComponent(filters.actor_id));
    }
    if (filters.action) {
      params = params.set('action', filters.action);
    }
    if (filters.severity) {
      params = params.set('severity', filters.severity);
    }
    if (filters.start_date) {
      params = params.set('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params = params.set('end_date', filters.end_date);
    }
    if (filters.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.offset !== undefined) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<AuditLogListResponse>(this.baseUrl, { params });
  }
}
