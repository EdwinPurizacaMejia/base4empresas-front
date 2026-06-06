/**
 * Supplier (Proveedor)
 * 
 * Representa un proveedor con validación externa (SUNAT para RUC, RENIEC para DNI)
 */

export type SupplierDocumentType = 'DNI' | 'RUC' | 'CE' | 'OTHER';

export interface Supplier {
  id: string;
  document_type: SupplierDocumentType;
  document_number: string;
  business_name?: string | null;
  full_name?: string | null;
  validated: boolean;
  validation_source?: string | null;
  validated_at?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierCreate {
  document_type: SupplierDocumentType;
  document_number: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierUpdate {
  email?: string;
  phone?: string;
  address?: string;
}
