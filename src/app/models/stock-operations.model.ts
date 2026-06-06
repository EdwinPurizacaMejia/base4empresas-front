/**
 * Modelos para operaciones de stock: Ajustes y Transferencias
 * Alineados con backend FastAPI
 * Endpoint: POST /stock/adjustments
 * Schema: app/schemas/stock_adjustment.py
 */

/**
 * Tipo de movimiento de stock
 */
export enum MovementType {
  IN = 'IN',   // Entrada de stock (incremento)
  OUT = 'OUT'  // Salida de stock (decremento)
}

/**
 * Razones para ajustes de inventario (valores del backend en español)
 */
export enum AdjustmentReason {
  MERMA = 'MERMA',                           // Pérdidas, roturas, vencimientos, daños
  REGULARIZACION = 'REGULARIZACION',         // Correcciones de inventario, ajustes por conteo físico
  INVENTARIO_INICIAL = 'INVENTARIO_INICIAL', // Carga inicial de stock en el sistema
  OTRO = 'OTRO'                              // Motivos no categorizados (valor por defecto)
}

/**
 * Item individual en un ajuste de stock
 * IMPORTANTE: quantity es SIEMPRE POSITIVA (movement_type del padre define dirección)
 */
export interface StockAdjustmentItem {
  product_id: string;
  quantity: number;      // SIEMPRE > 0 (positivo)
  unit_cost?: number;    // OBLIGATORIO para movement_type=IN, IGNORADO para OUT
}

/**
 * Payload para crear un ajuste de inventario
 * POST /stock/adjustments
 */
export interface StockAdjustmentCreate {
  warehouse_id: string;
  movement_type: MovementType;   // "IN" o "OUT" (requerido)
  reason?: AdjustmentReason;     // Default: OTRO
  note?: string;                 // Nota opcional (singular, no "notes")
  items: StockAdjustmentItem[];  // Mínimo 1 ítem
}

/**
 * Item en la respuesta del backend (con costos calculados)
 */
export interface StockAdjustmentItemResponse {
  product_id: string;
  quantity: number;
  unit_cost: number;         // Calculado por backend (para OUT usa método de costeo)
  line_total_cost: number;   // quantity * unit_cost
}

/**
 * Respuesta del backend al crear un ajuste
 */
export interface StockAdjustmentResponse {
  reference_id: string;      // UUID del ajuste (agrupa todos los ítems)
  movement_type: string;     // "IN" o "OUT"
  reason: string;            // Motivo del ajuste
  warehouse_id: string;      // UUID del almacén
  items: StockAdjustmentItemResponse[];
}

/**
 * Helper para obtener labels en español
 */
export function getAdjustmentReasonLabel(reason: AdjustmentReason): string {
  const labels: Record<AdjustmentReason, string> = {
    [AdjustmentReason.MERMA]: 'Merma / Pérdida',
    [AdjustmentReason.REGULARIZACION]: 'Regularización',
    [AdjustmentReason.INVENTARIO_INICIAL]: 'Inventario Inicial',
    [AdjustmentReason.OTRO]: 'Otro',
  };
  return labels[reason] || reason;
}

/**
 * Helper para obtener label de movement type
 */
export function getMovementTypeLabel(type: MovementType): string {
  return type === MovementType.IN ? 'Entrada' : 'Salida';
}

/**
 * Helper para validar unit_cost según movement_type
 */
export function validateUnitCost(item: StockAdjustmentItem, movementType: MovementType): boolean {
  // Para IN: unit_cost es obligatorio
  if (movementType === MovementType.IN) {
    return item.unit_cost !== undefined && item.unit_cost !== null && item.unit_cost >= 0;
  }
  // Para OUT: unit_cost no se debe enviar (se ignora)
  return true;
}

// ==============================================
// TRANSFERENCIAS - Alineado con backend FastAPI
// ==============================================

/**
 * Item individual en una transferencia entre almacenes
 * IMPORTANTE: quantity es SIEMPRE POSITIVA
 */
export interface TransferItem {
  product_id: string;
  quantity: number;  // SIEMPRE > 0 (positivo)
}

/**
 * Payload para crear una transferencia entre almacenes
 * POST /stock/transfers
 * 
 * Reglas backend:
 * - warehouse_from_id !== warehouse_to_id
 * - quantity siempre positiva
 * - Valida stock disponible en almacén origen
 * - Soporta múltiples items
 * - Es transaccional (todo o nada)
 * - Registra en Kardex con reference_type="TRANSFER"
 */
export interface TransferCreate {
  warehouse_from_id: string;  // UUID del almacén origen (requerido)
  warehouse_to_id: string;    // UUID del almacén destino (requerido, debe ser diferente)
  note?: string;              // Nota opcional (singular)
  items: TransferItem[];      // Mínimo 1 ítem (requerido)
}

/**
 * Respuesta del backend al crear una transferencia
 * Interfaz mínima segura (campos confirmados)
 */
export interface TransferResponse {
  reference_id: string;       // UUID de la transferencia
  warehouse_from_id: string;  // UUID del almacén origen
  warehouse_to_id: string;    // UUID del almacén destino
  items: TransferItem[];      // Items transferidos
}
