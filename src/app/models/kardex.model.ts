export type MovementType = 'IN' | 'OUT';
export type Reason = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'OTHER';
export type ReferenceType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'OTHER';

export interface KardexMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  reason: Reason;
  reference_type: ReferenceType;
  reference_id: string;
  quantity: number;
  unit_cost: number;
  note: string;
  created_at: string;
}
