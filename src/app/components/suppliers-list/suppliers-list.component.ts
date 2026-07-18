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

import { Supplier } from '../../models/supplier.model';
import { SuppliersService } from '../../services/suppliers.service';
import { NotificationService } from '../../services/notification.service';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-suppliers-list',
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
    SupplierFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  suppliers: Supplier[] = [];
  dataSource = new MatTableDataSource<Supplier>([]);
  displayedColumns = ['document_type', 'document_number', 'business_name', 'email', 'validated', 'actions'];
  loading = false;
  error: string | null = null;
  pageSizeOptions = [5, 10, 25, 50];
  private destroy$ = new Subject<void>();

  constructor(
    private suppliersService: SuppliersService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.error = null;

    this.suppliersService
      .getSuppliers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Supplier[]) => {
          this.suppliers = data;
          this.dataSource.data = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading suppliers:', err);
          this.error = 'Error al cargar los proveedores';
          this.notificationService.error(this.error);
          this.loading = false;
        }
      });
  }

  openCreateForm(): void {
    const dialogRef = this.dialog.open(SupplierFormComponent, {
      width: '600px',
      data: { supplier: null }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadSuppliers();
          this.notificationService.success('Proveedor creado exitosamente');
        }
      });
  }

  openEditForm(supplier: Supplier): void {
    const dialogRef = this.dialog.open(SupplierFormComponent, {
      width: '600px',
      data: { supplier }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadSuppliers();
          this.notificationService.success('Proveedor actualizado exitosamente');
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
