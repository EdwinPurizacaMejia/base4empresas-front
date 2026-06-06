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
  /**
   * Fecha de compra (backend: purchase_date).
   * Mantener compat con created_at por si algunos entornos aún lo usan.
   */
  purchase_date?: string;
  created_at?: string;

  supplier_id: string;
  warehouse_id: string;
  total: number;
  status?: string;

  /**
   * Backend puede incluir el proveedor embebido:
   * { id, business_name }
   */
  supplier?: {
    id: string;
    business_name: string;
  };

  /**
   * Backend puede incluir el almacén embebido:
   * { id, name }
   */
  warehouse?: {
    id: string;
    name: string;
  };
}

export interface Purchase extends PurchaseListItem {
  notes?: string | null;
  items?: PurchaseItemCreate[];
}
