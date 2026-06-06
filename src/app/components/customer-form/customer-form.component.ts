import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { Customer, CustomerCreate, CustomerUpdate, DocumentType } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  validatingDocument = false;
  isEditMode = false;
  customer: Customer | null = null;
  documentTypes: DocumentType[] = ['DNI', 'RUC', 'CE', 'OTHER'];
  documentValidated = false;
  validationInfo: { full_name?: string; business_name?: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<CustomerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer | null }
  ) {
    this.customer = data?.customer || null;
    this.isEditMode = !!this.customer;

    this.form = this.fb.group({
      document_type: [
        this.customer?.document_type || 'DNI',
        [Validators.required]
      ],
      document_number: [
        this.customer?.document_number || '',
        [Validators.required, Validators.minLength(8)]
      ],
      full_name: [
        { value: this.customer?.full_name || '', disabled: true },
        [Validators.maxLength(100)]
      ],
      business_name: [
        { value: this.customer?.business_name || '', disabled: true },
        [Validators.maxLength(150)]
      ],
      email: [
        this.customer?.email || '',
        [Validators.email]
      ],
      phone: [
        this.customer?.phone || '',
        [Validators.minLength(7)]
      ],
      address: [
        this.customer?.address || '',
        [Validators.maxLength(250)]
      ]
    });

    if (this.isEditMode) {
      this.documentValidated = this.customer!.validated;
      this.validationInfo = {
        full_name: this.customer!.full_name || undefined,
        business_name: this.customer!.business_name || undefined
      };
      // En modo edición, desactivar cambios al documento
      this.form.get('document_type')?.disable();
      this.form.get('document_number')?.disable();
    }
  }

  ngOnInit(): void {}

  validateDocument(): void {
    const docType = this.form.get('document_type')?.value;
    const docNumber = this.form.get('document_number')?.value;

    if (!docType || !docNumber) {
      this.notificationService.error('Completa el tipo y número de documento');
      return;
    }

    this.validatingDocument = true;

    if (docType === 'DNI') {
      this.customersService.validateDni(docNumber).subscribe({
        next: (result) => {
          this.documentValidated = true;
          this.validationInfo = { full_name: result.full_name };
          this.form.get('full_name')?.setValue(result.full_name);
          this.notificationService.success(`DNI validado: ${result.full_name}`);
          this.validatingDocument = false;
        },
        error: (err) => {
          console.error('Error validating DNI:', err);
          this.documentValidated = false;
          this.validationInfo = null;
          this.notificationService.error('Error al validar DNI. Verifica el número.');
          this.validatingDocument = false;
        }
      });
    } else if (docType === 'RUC') {
      this.customersService.validateRuc(docNumber).subscribe({
        next: (result) => {
          this.documentValidated = true;
          this.validationInfo = { business_name: result.business_name };
          this.form.get('business_name')?.setValue(result.business_name);
          this.notificationService.success(`RUC validado: ${result.business_name}`);
          this.validatingDocument = false;
        },
        error: (err) => {
          console.error('Error validating RUC:', err);
          this.documentValidated = false;
          this.validationInfo = null;
          this.notificationService.error('Error al validar RUC. Verifica el número.');
          this.validatingDocument = false;
        }
      });
    } else {
      this.notificationService.info('Validación solo disponible para DNI y RUC');
      this.validatingDocument = false;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.error('Por favor completa los campos requeridos');
      return;
    }

    this.loading = true;
    const formValue = this.form.getRawValue();

    if (this.isEditMode && this.customer) {
      // Actualizar
      const payload: CustomerUpdate = {
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        address: formValue.address || undefined
      };

      this.customersService.updateCustomer(this.customer.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          this.notificationService.error('Error al actualizar el cliente');
          this.loading = false;
        }
      });
    } else {
      // Crear
      const payload: CustomerCreate = {
        document_type: formValue.document_type,
        document_number: formValue.document_number,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        address: formValue.address || undefined
      };

      this.customersService.createCustomer(payload).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          this.notificationService.error('Error al crear el cliente');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get titleText(): string {
    return this.isEditMode ? 'Editar Cliente' : 'Crear Cliente';
  }

  getDocumentTypeLabel(type: DocumentType): string {
    const labels = {
      DNI: 'DNI (Perú)',
      RUC: 'RUC (Perú)',
      CE: 'Carné de Extranjería',
      OTHER: 'Otro'
    };
    return labels[type] || type;
  }
}
