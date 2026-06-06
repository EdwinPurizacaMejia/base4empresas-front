import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StockAdjustmentCreate, StockAdjustmentResponse, TransferCreate, TransferResponse } from '../models/stock-operations.model';
import { ApiConfigService } from './api-config.service';

/**
 * Servicio para operaciones de stock: Ajustes y Transferencias
 * Backend: POST /stock/adjustments y POST /stock/transfers
 */
@Injectable({
  providedIn: 'root'
})
export class StockOperationsService {
  private adjustmentsUrl: string;
  private transfersUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.adjustmentsUrl = this.apiConfig.buildUrl('/stock/adjustments');
    this.transfersUrl = this.apiConfig.buildUrl('/stock/transfers');
  }

  /**
   * Crear un ajuste de inventario
   * POST /stock/adjustments
   * 
   * El ajuste se registra en stock_movements con reference_type='ADJUSTMENT'
   * 
   * IMPORTANTE:
   * - quantity debe ser SIEMPRE > 0 (positiva)
   * - movement_type define dirección: "IN" (entrada) o "OUT" (salida)
   * - unit_cost es OBLIGATORIO para movement_type="IN"
   * - unit_cost se IGNORA para movement_type="OUT" (calculado por backend)
   */
  createAdjustment(payload: StockAdjustmentCreate): Observable<StockAdjustmentResponse> {
    return this.http.post<StockAdjustmentResponse>(this.adjustmentsUrl, payload);
  }

  /**
   * Crear una transferencia entre almacenes
   * POST /stock/transfers
   * 
   * La transferencia se registra en stock_movements con reference_type='TRANSFER'
   * 
   * IMPORTANTE:
   * - warehouse_from_id !== warehouse_to_id (validado por backend)
   * - quantity debe ser SIEMPRE > 0 (positiva)
   * - Backend valida stock disponible en almacén origen
   * - Soporta múltiples items en un mismo request
   * - Es transaccional: todo o nada (rollback automático si falla)
   */
  createTransfer(payload: TransferCreate): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(this.transfersUrl, payload);
  }
}
