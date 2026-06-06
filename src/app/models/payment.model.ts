/**
 * Payment Model
 * Tipos, interfaces y helpers para gestión de pagos
 * FASE 3 - Pagos y validación
 */

/**
 * Métodos de pago soportados
 */
export type PaymentMethod = 'YAPE' | 'TRANSFER' | 'CARD' | 'CASH' | 'OTHER';

/**
 * Estados de validación de pago
 */
export type PaymentStatus = 'PENDING_VALIDATION' | 'VALIDATED' | 'REJECTED';

/**
 * Interfaz completa de pago (desde backend)
 */
export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  operation_number?: string | null;
  status: PaymentStatus;
  paid_at: string;
  validated_by?: string | null;
  validated_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload para crear un pago
 */
export interface PaymentCreate {
  order_id: string;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  operation_number?: string;
  paid_at?: string;
}

/**
 * Payload para validar/rechazar un pago
 */
export interface PaymentValidate {
  status: PaymentStatus; // VALIDATED o REJECTED
  validated_by: string;
}

/**
 * Interfaz para filtros de pago (opcional para futuras expansiones)
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

/**
 * Helper: Obtener etiqueta legible en español para método de pago
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    YAPE: 'Yape',
    TRANSFER: 'Transferencia Bancaria',
    CARD: 'Tarjeta de Crédito',
    CASH: 'Efectivo',
    OTHER: 'Otro'
  };
  return labels[method] || method;
}

/**
 * Helper: Obtener etiqueta legible en español para estado de pago
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING_VALIDATION: 'Pendiente de Validación',
    VALIDATED: 'Validado',
    REJECTED: 'Rechazado'
  };
  return labels[status] || status;
}

/**
 * Helper: Obtener color Material para estado de pago
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING_VALIDATION: 'warn',
    VALIDATED: 'accent',
    REJECTED: 'warn'
  };
  return colors[status] || 'primary';
}

/**
 * Helper: Verificar si el método requiere número de operación
 */
export function requiresOperationNumber(method: PaymentMethod): boolean {
  return ['YAPE', 'TRANSFER', 'CARD'].includes(method);
}

/**
 * Obtener lista de métodos de pago disponibles
 */
export function getAvailablePaymentMethods(): PaymentMethod[] {
  return ['YAPE', 'TRANSFER', 'CARD', 'CASH', 'OTHER'];
}
