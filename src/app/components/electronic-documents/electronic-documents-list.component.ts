import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ElectronicDocumentsService } from '../../services/electronic-documents.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-electronic-documents-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './electronic-documents-list.component.html',
  styleUrls: ['./electronic-documents-list.component.scss']
})
export class ElectronicDocumentsListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  loading = false;
  filters: FormGroup;

  // Paginación
  page = 1;
  pageSize = 20;
  total = 0;
  pageSizeOptions = [10, 20, 50, 100];

  displayedColumns = [
    'document_number',
    'document_type',
    'status',
    'total_amount',
    'issue_date',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private documentsService: ElectronicDocumentsService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.filters = this.fb.group({
      search: [''],
      status: [''],
      document_type: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocuments();

    this.filters.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.loadDocuments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(): void {
    this.loading = true;

    const filterValues = this.filters.value;
    const filters = {
      page: this.page,
      page_size: this.pageSize,
      search: filterValues.search || undefined,
      status: filterValues.status || undefined,
      document_type: filterValues.document_type || undefined
    };

    this.documentsService.listDocuments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.documents = response.items || [];
          this.total = response.total || 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar documentos electrónicos:', err);
          this.notificationService.error('Error al cargar documentos electrónicos');
          this.loading = false;
        }
      });
  }

  getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      '01': 'Factura',
      '03': 'Boleta',
      'invoice': 'Factura/Boleta',
      'credit_note': 'Nota de Crédito',
      'debit_note': 'Nota de Débito'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Borrador',
      'READY': 'Listo',
      'PENDING': 'Pendiente',
      'ACCEPTED': 'Aceptado',
      'REJECTED': 'Rechazado',
      'CANCELLED': 'Anulado',
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
      'cancelled': 'Anulado'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'DRAFT': 'default',
      'READY': 'accent',
      'PENDING': 'accent',
      'ACCEPTED': 'primary',
      'REJECTED': 'warn',
      'CANCELLED': 'default'
    };
    return colors[status] || 'default';
  }

  onRefresh(): void {
    this.page = 1;
    this.loadDocuments();
  }

  clearFilters(): void {
    this.page = 1;
    this.filters.reset();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadDocuments();
  }

  getStatusOptions(): string[] {
    return ['DRAFT', 'READY', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
  }

  getDocumentTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: '01', label: 'Factura' },
      { value: '03', label: 'Boleta' },
    ];
  }

  onView(document: any): void { }

  onEmit(document: any): void {
    if (!confirm(`¿Enviar "${document.full_number}" a SUNAT vía NubeFact?`)) return;

    this.documentsService.emitDocument(document.id, { provider_mode: 'sandbox' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`Documento ${document.full_number} emitido. Estado: ${response.status}`);
          } else {
            this.notificationService.error(`SUNAT rechazó: ${response.message || 'Sin detalle'}`);
          }
          this.loadDocuments();
        },
        error: (err) => {
          this.notificationService.error(err?.error?.detail || 'Error al emitir el documento');
        }
      });
  }

  onCancel(document: any): void { }
  onDownloadPdf(document: any): void { }
  onDownloadXml(document: any): void { }
  onDownloadCdr(document: any): void { }

  canEmit(document: any): boolean {
    const s = (document.status || '').toUpperCase();
    return s === 'DRAFT' || s === 'READY';
  }

  canCancel(document: any): boolean {
    const s = (document.status || '').toUpperCase();
    return s === 'ACCEPTED';
  }

  hasPdf(document: any): boolean { return !!document.pdf_url; }
  hasXml(document: any): boolean { return !!document.xml_url; }
  hasCdr(document: any): boolean { return !!document.cdr_url; }
}
