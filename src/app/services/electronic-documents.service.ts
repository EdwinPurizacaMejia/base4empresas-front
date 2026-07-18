import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import {
  ElectronicDocument,
  ElectronicDocumentFilters,
  ElectronicDocumentType,
  EmitDocumentRequest,
  EmitDocumentResponse,
  CancelDocumentRequest,
  PaginatedDocumentResponse,
} from "../models/electronic-document.model";

/**
 * Servicio para gestión de documentos electrónicos
 *
 * Endpoint base: /api/v1/electronic-documents/
 *
 * Flujo principal:
 * 1. createFromSale()  → Crea el documento a partir de una venta (estado: draft)
 * 2. emitDocument()    → Envía el documento a SUNAT (estado: pending → accepted/rejected)
 * 3. downloadPdf()     → Descarga el PDF del comprobante
 */
@Injectable({
  providedIn: "root",
})
export class ElectronicDocumentsService {
  private readonly baseUrl = "/api/v1/electronic-documents";

  constructor(private http: HttpClient) {}

  /**
   * Listar documentos electrónicos con paginación y filtros.
   * Backend: GET /api/v1/electronic-documents/
   */
  listDocuments(
    filters?: ElectronicDocumentFilters
  ): Observable<PaginatedDocumentResponse> {
    let params = new HttpParams();
    if (filters?.page !== undefined)
      params = params.set("page", filters.page.toString());
    if (filters?.page_size !== undefined)
      params = params.set("page_size", filters.page_size.toString());
    if (filters?.status) params = params.set("status", filters.status);
    if (filters?.document_type)
      params = params.set("document_type", filters.document_type);
    if (filters?.search) params = params.set("search", filters.search);

    return this.http.get<PaginatedDocumentResponse>(`${this.baseUrl}/`, {
      params,
    });
  }

  /**
   * Obtener un documento electrónico por su ID.
   * Backend: GET /api/v1/electronic-documents/{id}
   */
  getDocumentById(documentId: string): Observable<ElectronicDocument> {
    return this.http.get<ElectronicDocument>(`${this.baseUrl}/${documentId}`);
  }

  /**
   * Buscar documento por número completo (ej: "B001-00000001").
   * Backend: GET /api/v1/electronic-documents/by-number/{full_number}
   */
  getDocumentByNumber(fullNumber: string): Observable<ElectronicDocument> {
    return this.http.get<ElectronicDocument>(
      `${this.baseUrl}/by-number/${encodeURIComponent(fullNumber)}`
    );
  }

  /**
   * Crear documento electrónico a partir de una venta existente.
   * Backend: POST /api/v1/electronic-documents/from-sale/{sale_id}?document_type=invoice
   *
   * @param saleId       - ID de la venta origen
   * @param documentType - Tipo: 'invoice' (auto), '01' (Factura), '03' (Boleta), 'credit_note', 'debit_note'
   */
  createFromSale(
    saleId: string,
    documentType: string = 'invoice'
  ): Observable<ElectronicDocument> {
    const params = new HttpParams().set("document_type", documentType);
    return this.http.post<ElectronicDocument>(
      `${this.baseUrl}/from-sale/${saleId}`,
      {},
      { params }
    );
  }

  /**
   * Crear documento electrónico a partir de un pedido existente.
   * Backend: POST /api/v1/electronic-documents/from-order/{order_id}?document_type=invoice
   *
   * Detecta automáticamente Factura (01) si el cliente tiene RUC, o Boleta (03) si tiene DNI.
   * Actualiza el estado del pedido a INVOICED.
   *
   * @param orderId      - ID del pedido origen
   * @param documentType - Tipo: 'invoice' (auto), '01' (Factura), '03' (Boleta), 'credit_note', 'debit_note'
   */
  createFromOrder(
    orderId: string,
    documentType: string = 'invoice'
  ): Observable<ElectronicDocument> {
    const params = new HttpParams().set("document_type", documentType);
    return this.http.post<ElectronicDocument>(
      `${this.baseUrl}/from-order/${orderId}`,
      {},
      { params }
    );
  }

  /**
   * Emitir documento a SUNAT.
   * Backend: POST /api/v1/electronic-documents/{id}/emit
   *
   * @param documentId - ID del documento a emitir
   * @param request    - Configuración opcional (provider_mode: sandbox/production)
   */
  emitDocument(
    documentId: string,
    request?: EmitDocumentRequest
  ): Observable<EmitDocumentResponse> {
    return this.http.post<EmitDocumentResponse>(
      `${this.baseUrl}/${documentId}/emit`,
      request ?? {}
    );
  }

  /**
   * Anular documento electrónico.
   * Backend: POST /api/v1/electronic-documents/{id}/cancel
   *
   * @param documentId - ID del documento a anular
   * @param request    - Motivo de anulación (requerido por SUNAT)
   */
  cancelDocument(
    documentId: string,
    request: CancelDocumentRequest
  ): Observable<ElectronicDocument> {
    return this.http.post<ElectronicDocument>(
      `${this.baseUrl}/${documentId}/cancel`,
      request
    );
  }

  /**
   * Consultar estado actual del documento en SUNAT.
   * Backend: GET /api/v1/electronic-documents/{id}/status
   */
  checkDocumentStatus(documentId: string): Observable<ElectronicDocument> {
    return this.http.get<ElectronicDocument>(
      `${this.baseUrl}/${documentId}/status`
    );
  }

  /**
   * Descargar PDF del comprobante.
   * Backend: GET /api/v1/electronic-documents/{id}/pdf
   * Retorna un Blob para abrir en nueva pestaña o descargar.
   */
  downloadPdf(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${documentId}/pdf`, {
      responseType: "blob",
    });
  }

  /**
   * Descargar XML del comprobante.
   * Backend: GET /api/v1/electronic-documents/{id}/xml
   */
  downloadXml(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${documentId}/xml`, {
      responseType: "blob",
    });
  }

  /**
   * Descargar CDR (Constancia de Recepción SUNAT).
   * Backend: GET /api/v1/electronic-documents/{id}/cdr
   */
  downloadCdr(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${documentId}/cdr`, {
      responseType: "blob",
    });
  }

  /**
   * Obtener documentos asociados a una venta específica.
   * Usa el listado general con filtro de búsqueda por sale_id.
   * Backend: GET /api/v1/electronic-documents/?sale_id={saleId}
   */
  getDocumentsBySaleId(saleId: string): Observable<PaginatedDocumentResponse> {
    const params = new HttpParams()
      .set("sale_id", saleId)
      .set("page_size", "50");
    return this.http.get<PaginatedDocumentResponse>(`${this.baseUrl}/`, {
      params,
    });
  }

  /**
   * Helper: abre o descarga un Blob como archivo.
   *
   * @param blob     - El blob descargado
   * @param filename - Nombre del archivo
   * @param openInTab - Si true, abre en nueva pestaña (para PDF); si false, descarga
   */
  static openOrDownloadBlob(
    blob: Blob,
    filename: string,
    openInTab = false
  ): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    if (openInTab) {
      a.target = "_blank";
    } else {
      a.download = filename;
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
