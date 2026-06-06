/**
 * Shipment Model
 * Defines types and interfaces for shipment management (FASE 4)
 */

/**
 * Shipping methods available for orders
 */
export type ShippingMethod =
  | 'MOTORBIKE'
  | 'COURIER_OLVA'
  | 'COURIER_SHALOM'
  | 'COURIER_OTHER'
  | 'PICKUP_STORE';

/**
 * Shipment status throughout its lifecycle
 */
export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Shipment entity - complete representation
 */
export interface Shipment {
  id: string;
  order_id: string;
  shipping_method: ShippingMethod;
  carrier_name?: string | null;
  tracking_number?: string | null;
  destination_address?: string | null;
  recipient_name: string;
  recipient_phone: string;
  status: ShipmentStatus;
  scheduled_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for creating a new shipment
 */
export interface ShipmentCreate {
  order_id: string;
  shipping_method: ShippingMethod;
  carrier_name?: string;
  tracking_number?: string;
  /**
   * Destination address for the shipment.
   * REQUIRED for all shipping methods except PICKUP_STORE.
   * Optional only when shipping_method is PICKUP_STORE.
   */
  destination_address?: string;
  recipient_name: string;
  recipient_phone: string;
  scheduled_date?: string;
}

/**
 * Payload for updating shipment status
 */
export interface ShipmentUpdateStatus {
  status: ShipmentStatus;
  tracking_number?: string;
}

/**
 * Filters for querying shipments
 */
export interface ShipmentFilters {
  status?: ShipmentStatus;
  shipping_method?: ShippingMethod;
}

/**
 * Get human-readable label for shipping method
 */
export function getShippingMethodLabel(method: ShippingMethod): string {
  const labels: Record<ShippingMethod, string> = {
    MOTORBIKE: 'Motorizado',
    COURIER_OLVA: 'Courier Olva',
    COURIER_SHALOM: 'Courier Shalom',
    COURIER_OTHER: 'Otro Courier',
    PICKUP_STORE: 'Retiro en Tienda'
  };
  return labels[method] || method;
}

/**
 * Get human-readable label for shipment status
 */
export function getShipmentStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    PENDING: 'Pendiente',
    IN_TRANSIT: 'En ruta',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  };
  return labels[status] || status;
}

/**
 * Get Material chip color for shipment status
 */
export function getShipmentStatusColor(status: ShipmentStatus): string {
  const colors: Record<ShipmentStatus, string> = {
    PENDING: 'warn',      // yellow/orange
    IN_TRANSIT: 'accent', // pink/secondary
    DELIVERED: 'primary', // blue
    CANCELLED: 'basic'    // gray
  };
  return colors[status] || 'basic';
}

/**
 * Check if shipping method requires destination address
 */
export function requiresDestinationAddress(method: ShippingMethod): boolean {
  return method !== 'PICKUP_STORE';
}

/**
 * Check if shipping method requires carrier name
 */
export function requiresCarrierName(method: ShippingMethod): boolean {
  return method !== 'PICKUP_STORE' && method !== 'MOTORBIKE';
}

/**
 * Get available shipping methods
 */
export function getAvailableShippingMethods(): ShippingMethod[] {
  return ['MOTORBIKE', 'COURIER_OLVA', 'COURIER_SHALOM', 'COURIER_OTHER', 'PICKUP_STORE'];
}

/**
 * Get valid status transitions for a given status
 */
export function getValidStatusTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
  const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
    PENDING: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: []
  };
  return transitions[currentStatus] || [];
}

/**
 * Check if status transition is allowed
 */
export function isStatusTransitionValid(
  currentStatus: ShipmentStatus,
  targetStatus: ShipmentStatus
): boolean {
  return getValidStatusTransitions(currentStatus).includes(targetStatus);
}
