import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order, OrderCreate, OrderUpdateStatus, OrderFilters, OrderUpdate } from '../models/order.model';
import { ApiConfigService } from './api-config.service';

/**
 * Interfaz para respuesta paginada del backend
 */
interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/orders');
  }

  /**
   * Obtener lista de órdenes con filtros opcionales
   * Backend: GET /orders - Devuelve respuesta paginada
   */
  listOrders(filters?: OrderFilters): Observable<Order[]> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.sales_channel_id) {
      params = params.set('sales_channel_id', filters.sales_channel_id);
    }

    if (filters?.customer_id) {
      params = params.set('customer_id', filters.customer_id);
    }

    // Backend devuelve {total, skip, limit, items}, extraemos items
    return this.http.get<PaginatedResponse<Order>>(this.apiUrl, { params }).pipe(
      map(response => response.items || [])
    );
  }

  /**
   * Obtener detalle de una orden específica
   * Backend: GET /orders/{id}
   */
  getOrder(id: string): Observable<Order> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Order>(url);
  }

  /**
   * Crear una nueva orden
   * Backend: POST /orders
   */
  createOrder(payload: OrderCreate): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, payload);
  }

  /**
   * Actualizar el estado de una orden
   * Backend: PATCH /orders/{id} — Editar información general del pedido.
   * items solo editables en estado DRAFT o SEPARATED.
   */
  updateOrder(orderId: string, payload: OrderUpdate): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}`, payload);
  }

  /**
   * Backend: PATCH /orders/{id}/status
   */
  updateOrderStatus(id: string, payload: OrderUpdateStatus): Observable<Order> {
    const url = `${this.apiUrl}/${encodeURIComponent(id)}/status`;
    return this.http.patch<Order>(url, payload);
  }

  /**
   * Cambiar estado de una orden a SEPARATED
   */
  markAsSeparated(id: string): Observable<Order> {
    return this.updateOrderStatus(id, { status: 'SEPARATED' });
  }

  /**
   * Cambiar estado de una orden a CANCELLED
   */
  cancel(id: string): Observable<Order> {
    return this.updateOrderStatus(id, { status: 'CANCELLED' });
  }

  /**
   * Cambiar estado de una orden a PENDING_INVOICE
   */
  markAsPendingInvoice(id: string): Observable<Order> {
    return this.updateOrderStatus(id, { status: 'PENDING_INVOICE' });
  }

  /**
   * Cambiar estado de una orden a INVOICED
   */
  markAsInvoiced(id: string): Observable<Order> {
    return this.updateOrderStatus(id, { status: 'INVOICED' });
  }
}
