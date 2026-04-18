export interface Stock {
  product_id: string;
  sku: string;
  name: string;
  stock: number;
  min_stock?: number;
}
