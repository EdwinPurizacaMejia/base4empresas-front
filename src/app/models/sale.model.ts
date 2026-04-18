export interface SaleItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  customer_id: string | null;
  warehouse_id: string;
  notes: string | null;
  items: SaleItemCreate[];
}

export interface SaleResponse {
  id: string;
  number: string;
  total: number;
}

export interface Sale {
  id: string;
  number: string;
  customer_id: string | null;
  warehouse_id: string;
  notes: string | null;
  total: number;
  created_at: string;
}

export interface SaleListItem extends Sale {
  status?: string;
  payment_status?: string;
}

export interface SaleDetail {
  id: string;
  number: string;
  customer_id: string | null;
  warehouse_id: string;
  notes: string | null;
  total: number;
  created_at: string;
  items: SaleDetailItem[];
}

export interface SaleDetailItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
