export type InventoryMovementType = 'IN' | 'OUT';

export interface InventoryStockCurrentItem {
  warehouse_id: string;
  product_id: string;

  // Datos del producto (provienen del backend)
  sku?: string | null;
  name?: string | null;

  quantity_on_hand: number;
  avg_unit_cost: number;
  stock_value: number;
  updated_at?: string;
}

export interface InventoryKardexLine {
  id: number;
  created_at: string;
  movement_type: InventoryMovementType;
  reason: string;

  reference_type?: string | null;
  reference_id?: string | null;

  // Campos de producto (nuevos desde backend)
  product_id: string;
  product_sku?: string | null;
  product_name?: string | null;

  quantity: number;
  unit_cost: number;
  line_value: number;

  running_qty: number;
  running_value: number;
}

export interface InventoryValuationResponse {
  warehouse_id: string;
  product_id: string;
  at: string;

  quantity_on_hand: number;
  avg_unit_cost: number;
  stock_value: number;
}
