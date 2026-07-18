import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { NotificationService } from '../../services/notification.service';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    CustomerFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  customers: Customer[] = [];
  dataSource = new MatTableDataSource<Customer>([]);
  displayedColumns = ['document_type', 'document_number', 'full_name', 'email', 'validated', 'created_at', 'actions'];
  loading = false;
  error: string | null = null;
  pageSizeOptions = [5, 10, 25, 50];
  private destroy$ = new Subject<void>();

  constructor(
    private customersService: CustomersService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = null;

    this.customersService
      .getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Customer[]) => {
          this.customers = data;
          this.dataSource.data = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading customers:', err);
          this.error = 'Error al cargar los clientes';
          this.notificationService.error(this.error);
          this.loading = false;
        }
      });
  }

  openCreateForm(): void {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      width: '600px',
      data: { customer: null }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadCustomers();
          this.notificationService.success('Cliente creado exitosamente');
        }
      });
  }

  openEditForm(customer: Customer): void {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      width: '600px',
      data: { customer }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadCustomers();
          this.notificationService.success('Cliente actualizado exitosamente');
        }
      });
  }

  getValidationLabel(validated: boolean): string {
    return validated ? 'Validado' : 'No validado';
  }

  getValidationColor(validated: boolean): string {
    return validated ? 'accent' : 'warn';
  }

  getDocumentLabel(docType: string): string {
    const labels: { [key: string]: string } = {
      DNI: 'DNI',
      RUC: 'RUC',
      CE: 'Carné de Extranjería',
      OTHER: 'Otro'
    };
    return labels[docType] || docType;
  }
}
