import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { ElectronicDocumentsService } from '../../services/electronic-documents.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-electronic-documents-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './electronic-documents-list.component.html',
  styleUrl: './electronic-documents-list.component.scss'
})
export class ElectronicDocumentsListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  loading = false;

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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocuments(): void {
    this.loading = true;

    this.documentsService
      .listDocuments()
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
}
