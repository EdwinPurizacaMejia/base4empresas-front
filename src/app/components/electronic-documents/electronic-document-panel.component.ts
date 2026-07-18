import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";

import {
  ElectronicDocument,
  ElectronicDocumentStatus,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
} from "../../models/electronic-document.model";
import { ElectronicDocumentsService } from "../../services/electronic-documents.service";
import { NotificationService } from "../../services/notification.service";
import { AppCurrencyPipe } from "../../shared/pipes/app-currency.pipe";
import {
  GenerateDocumentDialogComponent,
  GenerateDocumentDialogResult,
} from "./generate-document-dialog.component";

/**
 * Panel de Documentos Electrónicos
 *
 * Componente reutilizable que muestra los comprobantes asociados a una venta
 * y permite crear, emitir, descargar y anular documentos electrónicos.
 *
 * Uso:
 *   <app-electronic-document-panel [saleId]="sale.id" />
 */
@Component({
  selector: "app-electronic-document-panel",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    AppCurrencyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ed-panel">
      <!-- Encabezado -->
      <div class="ed-panel__header">
        <h3 class="ed-panel__title">
          <mat-icon class="ed-panel__title-icon">receipt_long</mat-icon>
          Documentos Electrónicos
        </h3>
        <div class="ed-panel__actions">
          <button
            mat-stroked-button
            color="primary"
            [disabled]="loading || readonly"
            (click)="onGenerateDocument()"
            matTooltip="Generar Boleta o Factura para esta venta"
          >
            <mat-icon>add</mat-icon>
            Generar Comprobante
          </button>
          <button
            mat-icon-button
            [disabled]="loading"
            (click)="loadDocuments()"
            matTooltip="Actualizar"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider />

      <!-- Estado de carga -->
      <div class="ed-panel__loading" *ngIf="loading">
        <mat-spinner diameter="32" />
        <span>Cargando comprobantes...</span>
      </div>

      <!-- Sin documentos -->
      <div
        class="ed-panel__empty"
        *ngIf="!loading && documents.length === 0"
      >
        <mat-icon class="ed-panel__empty-icon">receipt</mat-icon>
        <p>No hay comprobantes generados para esta venta.</p>
        <p class="ed-panel__empty-hint">
          Haz clic en "Generar Comprobante" para crear la Boleta o Factura.
        </p>
      </div>

      <!-- Lista de documentos -->
      <div class="ed-panel__list" *ngIf="!loading && documents.length > 0">
        <div class="ed-doc" *ngFor="let doc of documents">
          <!-- Info del documento -->
          <div class="ed-doc__info">
            <span class="ed-doc__number">
              {{ doc.full_number || "Sin número" }}
            </span>
            <span class="ed-doc__type">
              {{ getTypeLabel(doc.document_type) }}
            </span>
            <mat-chip
              [color]="getStatusColor(doc.status)"
              highlighted
              class="ed-doc__status"
            >
              {{ getStatusLabel(doc.status) }}
            </mat-chip>
            <span class="ed-doc__amount" *ngIf="doc.total_amount !== null">
              {{ doc.total_amount | appCurrency }}
            </span>
            <span class="ed-doc__date" *ngIf="doc.created_at">
              {{ doc.created_at | date : "dd/MM/yyyy HH:mm" }}
            </span>
          </div>

          <!-- Acciones del documento -->
          <div class="ed-doc__buttons">
            <!-- Emitir (solo si está en borrador) -->
            <button
              mat-flat-button
              color="primary"
              *ngIf="canEmit(doc)"
              [disabled]="actionLoading[doc.id]"
              (click)="onEmitDocument(doc)"
              matTooltip="Enviar a SUNAT"
            >
              <mat-spinner
                *ngIf="actionLoading[doc.id] === 'emit'"
                diameter="18"
              />
              <mat-icon *ngIf="actionLoading[doc.id] !== 'emit'">send</mat-icon>
              Emitir
            </button>

            <!-- Ver PDF -->
            <button
              mat-stroked-button
              *ngIf="doc.pdf_url"
              [disabled]="actionLoading[doc.id] === 'pdf'"
              (click)="onDownloadPdf(doc)"
              matTooltip="Ver PDF del comprobante"
            >
              <mat-spinner
                *ngIf="actionLoading[doc.id] === 'pdf'"
                diameter="18"
              />
              <mat-icon *ngIf="actionLoading[doc.id] !== 'pdf'">
                picture_as_pdf
              </mat-icon>
              PDF
            </button>

            <!-- Descargar XML -->
            <button
              mat-icon-button
              *ngIf="doc.xml_url"
              [disabled]="actionLoading[doc.id] === 'xml'"
              (click)="onDownloadXml(doc)"
              matTooltip="Descargar XML"
            >
              <mat-icon>code</mat-icon>
            </button>

            <!-- Descargar CDR -->
            <button
              mat-icon-button
              *ngIf="doc.cdr_url"
              [disabled]="actionLoading[doc.id] === 'cdr'"
              (click)="onDownloadCdr(doc)"
              matTooltip="Descargar CDR (Constancia SUNAT)"
            >
              <mat-icon>verified</mat-icon>
            </button>

            <!-- Actualizar estado -->
            <button
              mat-icon-button
              *ngIf="canCheckStatus(doc)"
              [disabled]="actionLoading[doc.id] === 'status'"
              (click)="onCheckStatus(doc)"
              matTooltip="Consultar estado en SUNAT"
            >
              <mat-icon>sync</mat-icon>
            </button>

            <!-- Anular -->
            <button
              mat-icon-button
              color="warn"
              *ngIf="canCancel(doc)"
              [disabled]="actionLoading[doc.id] === 'cancel'"
              (click)="onCancelDocument(doc)"
              matTooltip="Anular comprobante"
            >
              <mat-icon>cancel</mat-icon>
            </button>
          </div>

          <!-- Mensaje de error de SUNAT si fue rechazado -->
          <div
            class="ed-doc__error"
            *ngIf="doc.status === 'rejected' && doc.provider_status"
          >
            <mat-icon>error</mat-icon>
            <span>{{ doc.provider_status }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ed-panel {
        margin-top: 1.5rem;
      }

      .ed-panel__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0 0.75rem;
      }

      .ed-panel__title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .ed-panel__title-icon {
        color: #3b82f6;
      }

      .ed-panel__actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .ed-panel__loading {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        color: #64748b;
      }

      .ed-panel__empty {
        padding: 2rem;
        text-align: center;
        color: #64748b;
      }

      .ed-panel__empty-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        opacity: 0.4;
      }

      .ed-panel__empty-hint {
        font-size: 0.85rem;
        opacity: 0.7;
      }

      .ed-panel__list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.75rem 0;
      }

      .ed-doc {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        background: #f8fafc;
      }

      .ed-doc__info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }

      .ed-doc__number {
        font-weight: 700;
        font-size: 0.95rem;
        color: #1e293b;
      }

      .ed-doc__type {
        font-size: 0.85rem;
        color: #475569;
        background: #e2e8f0;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .ed-doc__amount {
        font-weight: 600;
        color: #059669;
        margin-left: auto;
      }

      .ed-doc__date {
        font-size: 0.8rem;
        color: #94a3b8;
      }

      .ed-doc__buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .ed-doc__error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #fef2f2;
        border-radius: 4px;
        color: #dc2626;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class ElectronicDocumentPanelComponent implements OnInit, OnDestroy {
  /** ID de la venta para la que se muestran los documentos */
  @Input({ required: true }) saleId!: string;

  /** Número visible de la venta (ej: "BOL-000006") para mostrar en el dialog */
  @Input() saleNumber?: string;

  /** Si es true, se oculta el botón "Generar Comprobante" */
  @Input() readonly = false;

  documents: ElectronicDocument[] = [];
  loading = false;
  /** Mapa de estado de carga por acción: { [documentId]: 'emit' | 'pdf' | ... } */
  actionLoading: Record<string, string | null> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private documentsService: ElectronicDocumentsService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    if (!this.saleId) return;
    this.loading = true;
    this.cdr.markForCheck();

    this.documentsService
      .getDocumentsBySaleId(this.saleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.documents = response.items || [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error cargando documentos:", err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onGenerateDocument(): void {
    if (!this.saleId) return;

    const dialogRef = this.dialog.open(GenerateDocumentDialogComponent, {
      width: "440px",
      disableClose: false,
      data: { saleNumber: this.saleNumber },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: GenerateDocumentDialogResult | undefined) => {
        if (!result) return; // Usuario canceló

        this.loading = true;
        this.cdr.markForCheck();

        this.documentsService
          .createFromSale(this.saleId, result.documentType)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (doc) => {
              this.notificationService.success(
                `Comprobante creado: ${doc.full_number || doc.id}. Ahora puedes emitirlo a SUNAT.`
              );
              this.loadDocuments();
            },
            error: (err) => {
              console.error("Error creando documento:", err);
              const msg =
                err?.error?.detail ||
                "Error al generar el comprobante. Verifica que la venta tenga cliente con documento de identidad.";
              this.notificationService.error(msg);
              this.loading = false;
              this.cdr.markForCheck();
            },
          });
      });
  }

  onEmitDocument(doc: ElectronicDocument): void {
    this.actionLoading[doc.id] = "emit";
    this.cdr.markForCheck();

    this.documentsService
      .emitDocument(doc.id, { provider_mode: "sandbox" })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(
              `Documento emitido exitosamente. Estado: ${response.status}`
            );
          } else {
            this.notificationService.error(
              `SUNAT rechazó el documento: ${response.message || "Sin detalle"}`
            );
          }
          this.actionLoading[doc.id] = null;
          this.loadDocuments();
        },
        error: (err) => {
          console.error("Error emitiendo documento:", err);
          this.notificationService.error(
            err?.error?.detail || "Error al emitir el documento a SUNAT"
          );
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  onDownloadPdf(doc: ElectronicDocument): void {
    this.actionLoading[doc.id] = "pdf";
    this.cdr.markForCheck();

    this.documentsService
      .downloadPdf(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          ElectronicDocumentsService.openOrDownloadBlob(
            blob,
            `comprobante-${doc.full_number || doc.id}.pdf`,
            true
          );
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error descargando PDF:", err);
          this.notificationService.error("Error al descargar el PDF");
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  onDownloadXml(doc: ElectronicDocument): void {
    this.actionLoading[doc.id] = "xml";
    this.cdr.markForCheck();

    this.documentsService
      .downloadXml(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          ElectronicDocumentsService.openOrDownloadBlob(
            blob,
            `comprobante-${doc.full_number || doc.id}.xml`,
            false
          );
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error descargando XML:", err);
          this.notificationService.error("Error al descargar el XML");
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  onDownloadCdr(doc: ElectronicDocument): void {
    this.actionLoading[doc.id] = "cdr";
    this.cdr.markForCheck();

    this.documentsService
      .downloadCdr(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          ElectronicDocumentsService.openOrDownloadBlob(
            blob,
            `cdr-${doc.full_number || doc.id}.zip`,
            false
          );
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error descargando CDR:", err);
          this.notificationService.error("Error al descargar el CDR");
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  onCheckStatus(doc: ElectronicDocument): void {
    this.actionLoading[doc.id] = "status";
    this.cdr.markForCheck();

    this.documentsService
      .checkDocumentStatus(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.notificationService.success(
            `Estado actualizado: ${DOCUMENT_STATUS_LABELS[updated.status] || updated.status}`
          );
          this.actionLoading[doc.id] = null;
          this.loadDocuments();
        },
        error: (err) => {
          console.error("Error consultando estado:", err);
          this.notificationService.error("Error al consultar estado en SUNAT");
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  onCancelDocument(doc: ElectronicDocument): void {
    const reason = prompt("Ingresa el motivo de anulación:");
    if (!reason?.trim()) return;

    this.actionLoading[doc.id] = "cancel";
    this.cdr.markForCheck();

    this.documentsService
      .cancelDocument(doc.id, { reason: reason.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success("Documento anulado correctamente");
          this.actionLoading[doc.id] = null;
          this.loadDocuments();
        },
        error: (err) => {
          console.error("Error anulando documento:", err);
          this.notificationService.error(
            err?.error?.detail || "Error al anular el documento"
          );
          this.actionLoading[doc.id] = null;
          this.cdr.markForCheck();
        },
      });
  }

  // ── Helpers de visibilidad ────────────────────────────────────────────────

  canEmit(doc: ElectronicDocument): boolean {
    return doc.status === "draft";
  }

  canCancel(doc: ElectronicDocument): boolean {
    return doc.status === "accepted" || doc.status === "pending";
  }

  canCheckStatus(doc: ElectronicDocument): boolean {
    return doc.status === "pending";
  }

  getTypeLabel(type: string): string {
    return DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] || type;
  }

  getStatusLabel(status: string): string {
    return DOCUMENT_STATUS_LABELS[status as ElectronicDocumentStatus] || status;
  }

  getStatusColor(status: string): string {
    return DOCUMENT_STATUS_COLORS[status as ElectronicDocumentStatus] || "default";
  }
}
