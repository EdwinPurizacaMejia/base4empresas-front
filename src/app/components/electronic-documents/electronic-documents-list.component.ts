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
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './electronic-documents-list.component.html',
  styleUrl: './electronic-documents-list.component.scss'
})
export class ElectronicDocumentsListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  loading = false;
  filters: FormGroup;

  displayedColumns = [
    'document_number',
    'document_type',
    'status',
    'total_amount',
    'issue_date'
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
      .subscribe(() => this.loadDocuments());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(): void {
    this.loading = true;

    const filterValues = this.filters.value;
    const filters = {
      search: filterValues.search || undefined,
      status: filterValues.status || undefined,
      document_type: filterValues.document_type || undefined
    };

    this.documentsService
      .listDocuments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.documents = response.items || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading documents:', err);
          this.notificationService.error('Error al cargar documentos electrónicos');
          this.loading = false;
        }
      });
  }

  getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'INVOICE': 'Factura',
      'BOLETA': 'Boleta',
      'CREDIT_NOTE': 'Nota de Crédito',
      'DEBIT_NOTE': 'Nota de Débito'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Borrador',
      'ISSUED': 'Emitido',
      'SENT': 'Enviado',
      'ACCEPTED': 'Aceptado',
      'REJECTED': 'Rechazado',
      'CANCELLED': 'Anulado'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'DRAFT': 'accent',
      'ISSUED': 'primary',
      'SENT': 'primary',
      'ACCEPTED': 'primary',
      'REJECTED': 'warn',
      'CANCELLED': 'accent'
    };
    return colors[status] || 'primary';
  }

  onRefresh(): void {
    this.loadDocuments();
  }

  clearFilters(): void {
    this.filters.reset();
  }

  getStatusOptions(): string[] {
    return ['DRAFT', 'PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'OBSERVED', 'CANCELLED', 'ERROR'];
  }

  getDocumentTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'invoice', label: 'Factura' },
      { value: 'boleta', label: 'Boleta' },
      { value: 'credit_note', label: 'Nota de Crédito' },
      { value: 'debit_note', label: 'Nota de Débito' }
    ];
  }
}
