export interface PurchaseItemCreate {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseCreate {
  supplier_id: string;
  warehouse_id: string;
  notes?: string | null;
  items: PurchaseItemCreate[];
}

export interface PurchaseResponse {
  id: string;
  number: string;
  total: number;
}

export interface PurchaseListItem {
  id: string;
  number: string;
  created_at?: string;
  supplier_id: string;
  warehouse_id: string;
  total: number;
  status?: string;
}

export interface Purchase extends PurchaseListItem {
  notes?: string | null;
  items?: PurchaseItemCreate[];
}
