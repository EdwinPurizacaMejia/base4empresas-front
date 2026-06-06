import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Shipment,
  ShipmentCreate,
  ShipmentUpdateStatus
} from '../models/shipment.model';
import { ApiConfigService } from './api-config.service';

/**
 * Servicio para gestión de envíos (Shipments)
 * Conecta con la API /shipments del backend
 */
@Injectable({
  providedIn: 'root',
})
export class ShipmentsService {
  private shipmentsUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.shipmentsUrl = this.apiConfig.buildUrl('/shipments');
  }

  /**
   * Crear un nuevo envío
   */
  createShipment(data: ShipmentCreate): Observable<Shipment> {
    return this.http.post<Shipment>(this.shipmentsUrl, data);
  }

  /**
   * Obtener un envío por ID
   */
  getShipment(id: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.shipmentsUrl}/${id}`);
  }

  /**
   * Listar todos los envíos de una orden
   */
  listShipmentsForOrder(orderId: string): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.shipmentsUrl}/orders/${orderId}/list`);
  }

  /**
   * Obtener resumen de envíos de una orden
   */
  getShipmentsSummary(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.shipmentsUrl}/orders/${orderId}/summary`);
  }

  /**
   * Actualizar estado de un envío
   */
  updateShipmentStatus(id: string, data: ShipmentUpdateStatus): Observable<Shipment> {
    return this.http.patch<Shipment>(`${this.shipmentsUrl}/${id}/status`, data);
  }

  /**
   * Obtener envío de una orden específica (validando que pertenezca a la orden)
   */
  getShipmentForOrder(orderId: string, shipmentId: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.shipmentsUrl}/orders/${orderId}/shipments/${shipmentId}`);
  }
}
