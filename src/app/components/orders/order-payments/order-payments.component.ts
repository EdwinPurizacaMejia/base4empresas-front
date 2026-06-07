import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { Payment, PaymentCreate, getPaymentMethodLabel, getPaymentStatusLabel, getPaymentStatusColor, requiresOperationNumber, getAvailablePaymentMethods } from '../../../models/payment.model';
import { PaymentsService } from '../../../services/payments.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';

/**
 * OrderPaymentsComponent
 * Sección de gestión de pagos para una orden específica
 * FASE 3 - Pagos y validación
 * 
 * Responsabilidades:
 * - Listar pagos de una orden
 * - Crear nuevos pagos
 * - Validar/rechazar pagos (con confirmación)
 * - Actualizar UI basada en estado de pagos
 * 
 * Buenas prácticas aplicadas:
 * - ✓ Smart component con lógica
 * - ✓ Formulario reactivo con validaciones condicionales
 * - ✓ RxJS con takeUntil() para cleanup
 * - ✓ Tipado fuerte en todo
 * - ✓ Manejo centralizado de notificaciones
 */
@Component({
  selector: 'app-order-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    LoadingSpinnerComponent,
    AppCurrencyPipe
  ],
  templateUrl: './order-payments.component.html',
  styleUrl: './order-payments.component.scss'
})
export class OrderPaymentsComponent implements OnInit, OnDestroy {
  @Input() orderId!: string;
  @Input() orderTotalAmount: number = 0;
  @Input() orderCurrency: string = 'PEN';
  @Input() initialPaymentAmount: number = 0;

  @Output() paymentsChanged = new EventEmitter<void>();

  @ViewChild(FormGroupDirective) paymentFormDirective?: FormGroupDirective;

  payments: Payment[] = [];
  paymentForm: FormGroup;
  loading = false;
  creatingPayment = false;
  validatingPayment = false;

  displayedColumns = ['method', 'amount', 'currency', 'status', 'operation_number', 'validated_by', 'paid_at', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private paymentsService: PaymentsService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      method: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['PEN'],
      operation_number: [''],
      paid_at: [new Date().toISOString().split('T')[0]]
    });

    // Validación condicional: operation_number es requerido para ciertos métodos
    this.paymentForm.get('method')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((method) => {
        const opField = this.paymentForm.get('operation_number');
        if (requiresOperationNumber(method)) {
          opField?.setValidators([Validators.required]);
        } else {
          opField?.clearValidators();
        }
        opField?.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    if (!this.orderId) {
      console.error('OrderPaymentsComponent: orderId es requerido');
      return;
    }
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRefreshPayments(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.loading = true;

    this.paymentsService
      .getPaymentsByOrder(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          this.payments = payments || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading payments:', err);
          this.notificationService.error('Error al cargar los pagos');
          this.loading = false;
        }
      });
  }

  getValidatedPaymentsTotal(): number {
    return this.payments
      .filter((p) => p.status === 'VALIDATED')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }

  getTotalPaid(): number {
    return Number(this.initialPaymentAmount || 0) + this.getValidatedPaymentsTotal();
  }

  getBalancePending(): number {
    return Math.max(0, Number(this.orderTotalAmount || 0) - this.getTotalPaid());
  }

  getPaymentMethodLabel(method: string): string {
    return getPaymentMethodLabel(method as any);
  }

  getPaymentStatusLabel(status: string): string {
    return getPaymentStatusLabel(status as any);
  }

  getPaymentStatusColor(status: string): string {
    return getPaymentStatusColor(status as any);
  }

  getAvailableMethods() {
    return getAvailablePaymentMethods();
  }

  requiresOperationNumber(method: string): boolean {
    return requiresOperationNumber(method as any);
  }

  onSubmitPayment(): void {
    if (this.paymentForm.invalid) {
      this.notificationService.warning('Por favor, completa los campos requeridos');
      return;
    }

    this.creatingPayment = true;

    const formValue = this.paymentForm.value;
    const payload: PaymentCreate = {
      order_id: this.orderId,
      method: formValue.method,
      amount: parseFloat(formValue.amount),
      currency: formValue.currency,
      operation_number: formValue.operation_number || undefined,
      paid_at: formValue.paid_at
    };

    this.paymentsService
      .createPayment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payment) => {
          // Recargar lista completa desde backend para sincronizar
          this.loadPayments();
          // Notificar al padre para que recargue la orden
          this.paymentsChanged.emit();
          
          // Limpiar formulario usando FormGroupDirective para resetear estado submitted
          const defaultValues = {
            method: null,
            amount: null,
            currency: 'PEN',
            operation_number: '',
            paid_at: new Date().toISOString().split('T')[0]
          };

          this.paymentFormDirective?.resetForm(defaultValues);
          
          this.paymentForm.markAsPristine();
          this.paymentForm.markAsUntouched();
          
          Object.values(this.paymentForm.controls).forEach(control => {
            control.markAsPristine();
            control.markAsUntouched();
            control.updateValueAndValidity({ emitEvent: false });
          });
          
          this.notificationService.success('Pago registrado exitosamente');
          this.creatingPayment = false;
        },
        error: (err) => {
          console.error('Error creating payment:', err);
          this.notificationService.error('Error al registrar el pago');
          this.creatingPayment = false;
        }
      });
  }

  validatePayment(payment: Payment): void {
    if (!confirm('¿Está seguro de que desea validar este pago?')) {
      return;
    }

    this.validatingPayment = true;

    this.paymentsService
      .approvePayment(payment.id, 'admin-demo')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPayment) => {
          // Recargar lista completa desde backend para sincronizar
          this.loadPayments();
          // Notificar al padre para que recargue la orden
          this.paymentsChanged.emit();
          this.notificationService.success('Pago validado exitosamente');
          this.validatingPayment = false;
        },
        error: (err) => {
          console.error('Error validating payment:', err);
          this.notificationService.error('Error al validar el pago');
          this.validatingPayment = false;
        }
      });
  }

  rejectPayment(payment: Payment): void {
    if (!confirm('¿Está seguro de que desea rechazar este pago?')) {
      return;
    }

    this.validatingPayment = true;

    this.paymentsService
      .rejectPayment(payment.id, 'admin-demo')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPayment) => {
          // Recargar lista completa desde backend para sincronizar
          this.loadPayments();
          // Notificar al padre para que recargue la orden
          this.paymentsChanged.emit();
          this.notificationService.success('Pago rechazado');
          this.validatingPayment = false;
        },
        error: (err) => {
          console.error('Error rejecting payment:', err);
          this.notificationService.error('Error al rechazar el pago');
          this.validatingPayment = false;
        }
      });
  }

  canValidate(payment: Payment): boolean {
    return payment.status === 'PENDING_VALIDATION';
  }
}
