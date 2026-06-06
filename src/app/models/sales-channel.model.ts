/**
 * Sales Channel (Canal de Venta)
 * 
 * Representa un canal de venta (LIVE, B2B, IN_HOUSE, WHOLESALE, WHATSAPP, etc.)
 * Utilizado para clasificar y gestionar órdenes por canal.
 */

export interface SalesChannel {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesChannelCreate {
  code: string;
  name: string;
  description?: string | null;
}

export interface SalesChannelUpdate {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}
