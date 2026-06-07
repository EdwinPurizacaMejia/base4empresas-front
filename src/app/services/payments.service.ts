import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Payment, PaymentCreate, PaymentValidate } from '../models/payment.model';
import { ApiConfigService } from './api-config.service';

/**
 * PaymentsService
 * Gestión de pagos - FASE 3
 * 
 * Responsabilidades:
 * - Crear pagos (POST)
 * - Obtener pagos por orden (GET con filtro)
 * - Validar/rechazar pagos (PATCH)
 * 
 * Buenas prácticas:
 * - ✓ Inyectable en raíz (providedIn: 'root')
 * - ✓ Tipar todas las respuestas HTTP
 * - ✓ Constructor-based dependency injection
 * - ✓ Usar encodeURIComponent para parámetros de URL
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly baseUrl = this.apiConfig.buildUrl('/payments');

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Crear un nuevo pago
   */
  createPayment(payload: PaymentCreate): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payload);
  }

  /**
   * Obtener pagos de una orden específica
   * Backend: GET /payments/orders/{order_id}/list?skip=0&limit=100
   * Respuesta: { payments: [...], total: number, skip: number, limit: number }
   * @param orderId ID de la orden
   * @param skip Número de registros a saltar (paginación)
   * @param limit Número de registros a retornar
   */
  getPaymentsByOrder(orderId: string, skip: number = 0, limit: number = 100): Observable<Payment[]> {
    const url = this.apiConfig.buildUrl(`/payments/orders/${encodeURIComponent(orderId)}/list`);
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<{ payments: Payment[]; total: number; skip: number; limit: number }>(url, { params })
      .pipe(
        map((response) => response.payments || [])
      );
  }

  /**
   * Obtener un pago específico
   * @param id ID del pago
   */
  getPayment(id: string): Observable<Payment> {
    const url = `${this.baseUrl}/${encodeURIComponent(id)}`;
    return this.http.get<Payment>(url);
  }

  /**
   * Validar o rechazar un pago
   * @param id ID del pago
   * @param payload Estado (VALIDATED/REJECTED) y usuario que valida
   */
  validatePayment(id: string, payload: PaymentValidate): Observable<Payment> {
    const url = `${this.baseUrl}/${encodeURIComponent(id)}/validate`;
    return this.http.post<Payment>(url, payload);
  }

  /**
   * Métodos de conveniencia para validar/rechazar
   */

  /**
   * Marcar pago como validado
   */
  approvePayment(id: string, validatedBy: string): Observable<Payment> {
    return this.validatePayment(id, {
      status: 'VALIDATED',
      validated_by: validatedBy
    });
  }

  /**
   * Marcar pago como rechazado
   */
  rejectPayment(id: string, validatedBy: string): Observable<Payment> {
    return this.validatePayment(id, {
      status: 'REJECTED',
      validated_by: validatedBy
    });
  }
}
