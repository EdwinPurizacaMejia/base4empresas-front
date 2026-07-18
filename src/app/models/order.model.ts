/**
 * Order (Pedido)
 *
 * Modelo para gestión de órdenes de venta con estados y separaciones.
 * Estados: DRAFT, SEPARATED, CANCELLED, PENDING_INVOICE, INVOICED, SHIPPED, DELIVERED
 */

export type OrderStatus =
  | 'DRAFT'
  | 'SEPARATED'
  | 'CANCELLED'
  | 'PENDING_INVOICE'
  | 'INVOICED'
  | 'SHIPPED'
  | 'DELIVERED';

/**
 * Representa un ítem dentro de una orden
 */
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number | null;
  subtotal: number;
  product?: any; // ProductMini o información del producto si viene del backend
}

/**
 * Representa una orden completa
 */
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  sales_channel_id: string;
  status: OrderStatus;
  separation_expiry_at?: string | null;
  is_stock_reserved?: boolean;
  total_amount: number;
  initial_payment_amount?: number | null;
  paid_amount: number;
  currency: string;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
  // Opcionalmente: customer, sales_channel, etc. si el backend los retorna
}

/**
 * Payload para crear una nueva orden
 */
export interface OrderCreate {
  customer_id: string;
  sales_channel_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }>;
  initial_payment_amount?: number;
  currency?: string;
}

/**
 * Payload para actualizar el estado de una orden
 */
export interface OrderUpdateStatus {
  status: OrderStatus;
}

export interface OrderItemUpdate {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}

/**
 * Payload para editar la información general de una orden.
 * PATCH /orders/{order_id}
 * Todos los campos son opcionales.
 * items solo se puede editar si el pedido está en DRAFT o SEPARATED.
 */
export interface OrderUpdate {
  customer_id?: string;
  sales_channel_id?: string;
  currency?: string;
  initial_payment_amount?: number | null;
  notes?: string | null;
  items?: OrderItemUpdate[];
}

/**
 * Filtros opcionales para listar órdenes
 */
export interface OrderFilters {
  status?: OrderStatus;
  sales_channel_id?: string;
  customer_id?: string;
}

/**
 * Helper: Obtener etiqueta legible del estado
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    DRAFT: 'Borrador',
    SEPARATED: 'Separada',
    CANCELLED: 'Cancelada',
    PENDING_INVOICE: 'Pendiente Factura',
    INVOICED: 'Facturada',
    SHIPPED: 'Enviada',
    DELIVERED: 'Entregada'
  };
  return labels[status] || status;
}

/**
 * Helper: Obtener color para estado
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    DRAFT: 'primary',
    SEPARATED: 'warn',
    CANCELLED: 'accent',
    PENDING_INVOICE: 'primary',
    INVOICED: 'primary',
    SHIPPED: 'accent',
    DELIVERED: 'primary'
  };
  return colors[status] || 'primary';
}
