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

export interface SaleItemUpdate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface SaleUpdate {
  customer_id?: string | null;
  notes?: string | null;
  items?: SaleItemUpdate[];
}

/**
 * Nota: backend actual devuelve SaleResponse (GET /sales y GET /sales/{id}) con:
 * - sale_date (datetime)
 * - subtotal, tax, total
 * - status, payment_status
 * - items con unit_cost y total_cost (COGS)
 *
 * El POST /sales devuelve { id, number, total } (response_model=dict)
 */

export interface SaleResponse {
  id: string;
  number: string;
  customer_id: string | null;
  customer_name: string | null;
  warehouse_id: string;
  warehouse_name: string | null;
  sale_date: string;
  status: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  items: SaleDetailItem[];
}

/**
 * Respuesta simplificada del POST /sales.
 */
export interface SaleCreateResponse {
  id: string;
  number: string;
  total: number;
}

/**
 * Campos derivados para UI (no necesariamente vienen del backend).
 */
export interface SaleCostsSummary {
  cost_total?: number;
  gross_profit?: number;
  gross_margin_pct?: number;
}

export interface SaleListItem extends SaleResponse, SaleCostsSummary {}

export interface SaleDetail extends SaleResponse, SaleCostsSummary {}

export interface SaleDetailItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;

  // COGS (backend)
  unit_cost?: number;
  total_cost?: number;

  subtotal?: number;
  tax?: number;
  total?: number;
}
