import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InventoryKardexLine } from '../models/inventory.model';
import { ApiConfigService } from './api-config.service';

/**
 * Tipos de referencia para filtrar movimientos de Kardex
 */
export type KardexReferenceType = 
  | 'ADJUSTMENT'    // Ajustes de inventario
  | 'TRANSFER'      // Transferencias entre almacenes
  | 'ORDER'         // Órdenes de venta
  | 'CANCELLATION'  // Cancelaciones
  | 'PURCHASE';     // Compras

@Injectable({
  providedIn: 'root',
})
export class KardexService {
  private inventoryKardexUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.inventoryKardexUrl = this.apiConfig.buildUrl('/inventory/kardex');
  }

  /**
   * GET /inventory/kardex con filtros opcionales
   * Permite filtrar por tipo de movimiento (reference_type)
   */
  getKardex(params: {
    warehouseId: string;
    productId?: string;
    fromDate?: string;
    toDate?: string;
    referenceType?: KardexReferenceType;  // Nuevo filtro
  }): Observable<InventoryKardexLine[]> {
    let httpParams = new HttpParams().set('warehouse_id', params.warehouseId);

    if (params.productId) httpParams = httpParams.set('product_id', params.productId);
    if (params.fromDate) httpParams = httpParams.set('from_date', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('to_date', params.toDate);
    if (params.referenceType) httpParams = httpParams.set('reference_type', params.referenceType);

    return this.http.get<InventoryKardexLine[]>(this.inventoryKardexUrl, { params: httpParams });
  }
}
