/**
 * Modelo de Auditoría - FASE 5
 * 
 * Define las interfaces para registros de auditoría (logs) que registran
 * cambios y acciones sobre entidades principales (Order, Payment, Shipment, etc.)
 */

/**
 * Tipos de entidades que pueden ser auditadas
 */
export type AuditableEntityType = 
  | 'ORDER'
  | 'PAYMENT'
  | 'SHIPMENT'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'PRODUCT'
  | 'INVENTORY'
  | 'SALES_CHANNEL'
  | 'USER';

/**
 * Tipos de acciones que se registran en auditoría
 */
export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'APPROVED'
  | 'EXPORTED'
  | 'IMPORTED'
  | 'LOCKED'
  | 'UNLOCKED';

/**
 * Tipo de actor que ejecutó la acción (usuario, sistema, etc.)
 */
export type ActorType =
  | 'USER'
  | 'SYSTEM'
  | 'API'
  | 'BATCH_PROCESS';

/**
 * Nivel de severidad de la acción auditada
 */
export type AuditSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

/**
 * Metadatos genéricos de auditoría
 * Contiene información adicional sobre el cambio realizado
 */
export interface AuditMetadata {
  // Cambios de estado (ej: OLD_STATUS -> NEW_STATUS)
  old_value?: any;
  new_value?: any;

  // Cambios de campos específicos
  changed_fields?: string[];
  
  // Información de montos (para pagos, etc.)
  amount?: number;
  currency?: string;
  
  // Información de transacciones
  transaction_id?: string;
  
  // Detalles adicionales
  reason?: string;
  notes?: string;
  
  // Datos dinámicos
  [key: string]: any;
}

/**
 * Registro de Auditoría (AuditLog)
 * Representa un evento auditado en el sistema
 */
export interface AuditLog {
  // Identificadores
  id: string;
  
  // Información del actor (quién hizo la acción)
  actor_id?: string | null;
  actor_type: ActorType;
  actor_name?: string | null;
  
  // Información de la entidad afectada
  entity_type: AuditableEntityType;
  entity_id: string;
  
  // Acción realizada
  action: AuditAction;
  severity: AuditSeverity;
  
  // Metadatos del cambio
  metadata?: AuditMetadata | null;
  
  // Información técnica
  ip_address?: string | null;
  user_agent?: string | null;
  endpoint?: string | null;
  
  // Timestamps
  created_at: string; // ISO 8601 format
  updated_at?: string | null;
}

/**
 * Filtros para buscar registros de auditoría
 */
export interface AuditLogFilters {
  entity_type?: AuditableEntityType;
  entity_id?: string;
  actor_id?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Respuesta de listado de auditoría con paginación
 */
export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Helper para obtener label de una acción de auditoría
 */
export function getAuditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    'CREATED': 'Creado',
    'UPDATED': 'Actualizado',
    'DELETED': 'Eliminado',
    'STATUS_CHANGED': 'Estado cambiado',
    'VALIDATED': 'Validado',
    'REJECTED': 'Rechazado',
    'CANCELLED': 'Cancelado',
    'APPROVED': 'Aprobado',
    'EXPORTED': 'Exportado',
    'IMPORTED': 'Importado',
    'LOCKED': 'Bloqueado',
    'UNLOCKED': 'Desbloqueado',
  };
  return labels[action] || action;
}

/**
 * Helper para obtener label de tipo de entidad
 */
export function getEntityTypeLabel(entityType: AuditableEntityType): string {
  const labels: Record<AuditableEntityType, string> = {
    'ORDER': 'Pedido',
    'PAYMENT': 'Pago',
    'SHIPMENT': 'Envío',
    'CUSTOMER': 'Cliente',
    'SUPPLIER': 'Proveedor',
    'PRODUCT': 'Producto',
    'INVENTORY': 'Inventario',
    'SALES_CHANNEL': 'Canal de Venta',
    'USER': 'Usuario',
  };
  return labels[entityType] || entityType;
}

/**
 * Helper para obtener color de severidad (para UI)
 */
export function getAuditSeverityColor(severity: AuditSeverity): string {
  const colors: Record<AuditSeverity, string> = {
    'LOW': '#4caf50',      // Verde
    'MEDIUM': '#ff9800',   // Naranja
    'HIGH': '#f44336',     // Rojo
    'CRITICAL': '#9c27b0', // Púrpura
  };
  return colors[severity] || '#999';
}

/**
 * Helper para obtener label de severidad
 */
export function getAuditSeverityLabel(severity: AuditSeverity): string {
  const labels: Record<AuditSeverity, string> = {
    'LOW': 'Bajo',
    'MEDIUM': 'Medio',
    'HIGH': 'Alto',
    'CRITICAL': 'Crítico',
  };
  return labels[severity] || severity;
}
