/**
 * Modelo de Documentos Electrónicos
 *
 * Refleja la estructura del backend: /api/v1/electronic-documents/
 * Tipos de documentos soportados: factura, nota de crédito, nota de débito
 * La distinción boleta/factura la determina el backend según el tipo de
 * documento del cliente (DNI → Boleta, RUC → Factura).
 */

export type ElectronicDocumentType = "invoice" | "credit_note" | "debit_note";

export type ElectronicDocumentStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface ElectronicDocument {
  id: string;
  /** UUID del pedido origen (si fue creado desde un pedido) */
  order_id: string | null;
  /** UUID de la venta origen (si fue creado desde una venta) */
  sale_id: string | null;
  document_type: ElectronicDocumentType;
  /** Número completo del comprobante, ej: "B001-00000001" */
  full_number: string | null;
  status: ElectronicDocumentStatus;
  /** Proveedor de facturación electrónica utilizado */
  provider: string | null;
  provider_document_id: string | null;
  provider_status: string | null;
  /** URL del PDF del comprobante (disponible tras emisión exitosa) */
  pdf_url: string | null;
  /** URL del XML del comprobante (disponible tras emisión exitosa) */
  xml_url: string | null;
  /** URL del CDR - Constancia de Recepción SUNAT */
  cdr_url: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmitDocumentRequest {
  /** Modo de operación: 'sandbox' para pruebas, 'production' para producción */
  provider_mode?: "sandbox" | "production";
}

export interface EmitDocumentResponse {
  success: boolean;
  provider_document_id: string | null;
  provider_status: string | null;
  status: ElectronicDocumentStatus;
  /** Mensaje de respuesta de SUNAT (incluye motivo de rechazo si aplica) */
  message: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  cdr_url: string | null;
}

export interface CancelDocumentRequest {
  /** Motivo de anulación requerido por SUNAT */
  reason: string;
  provider_mode?: "sandbox" | "production";
}

export interface PaginatedDocumentResponse {
  items: ElectronicDocument[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ElectronicDocumentFilters {
  page?: number;
  page_size?: number;
  status?: ElectronicDocumentStatus | "";
  document_type?: ElectronicDocumentType | "";
  search?: string;
}

/**
 * Labels para mostrar en la UI
 */
export const DOCUMENT_TYPE_LABELS: Record<ElectronicDocumentType, string> = {
  invoice: "Factura/Boleta",
  credit_note: "Nota de Crédito",
  debit_note: "Nota de Débito",
};

export const DOCUMENT_STATUS_LABELS: Record<
  ElectronicDocumentStatus,
  string
> = {
  draft: "Borrador",
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  cancelled: "Anulado",
};

export const DOCUMENT_STATUS_COLORS: Record<ElectronicDocumentStatus, string> =
  {
    draft: "default",
    pending: "accent",
    accepted: "primary",
    rejected: "warn",
    cancelled: "default",
  };
