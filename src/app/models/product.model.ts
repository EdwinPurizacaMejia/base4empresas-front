export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode?: string | null;
  description?: string | null;
  category_id?: string | null;
  unit_id?: string | null;
  sale_price: number;
  purchase_price: number;
  min_stock: number;
  is_active: boolean;
}

export interface ProductCreate {
  sku: string;
  name: string;
  barcode?: string | null;
  description?: string | null;
  category_id?: string | null;
  unit_id?: string | null;
  sale_price: number;
  purchase_price: number;
  min_stock: number;
}