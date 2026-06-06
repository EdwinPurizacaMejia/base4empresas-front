/**
 * Customer (Cliente)
 * 
 * Representa un cliente con validación externa (RENIEC/SUNAT)
 */

export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'OTHER';

export interface Customer {
  id: string;
  document_type: DocumentType;
  document_number: string;
  full_name?: string | null;
  business_name?: string | null;
  validated: boolean;
  validation_source?: string | null;
  validated_at?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCreate {
  document_type: DocumentType;
  document_number: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerUpdate {
  email?: string;
  phone?: string;
  address?: string;
}
