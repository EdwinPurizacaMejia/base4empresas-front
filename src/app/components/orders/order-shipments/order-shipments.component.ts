import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import {
  Shipment,
  ShipmentCreate,
  ShipmentStatus,
  getShippingMethodLabel,
  getShipmentStatusLabel,
  getShipmentStatusColor,
  requiresDestinationAddress,
  requiresCarrierName,
  getAvailableShippingMethods,
  isStatusTransitionValid,
  getValidStatusTransitions
} from '../../../models/shipment.model';
import { ShipmentsService } from '../../../services/shipments.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';

/**
 * OrderShipmentsComponent
 * Manages shipments for an order (FASE 4 - Logística y envíos)
 * Smart component that handles loading, creating, and updating shipments
 */
@Component({
  selector: 'app-order-shipments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './order-shipments.component.html',
  styleUrls: ['./order-shipments.component.scss']
})
export class OrderShipmentsComponent implements OnInit, OnDestroy {
  @Input() orderId!: string;
  @Input() orderStatus?: string;
  @Output() shipmentCreated = new EventEmitter<Shipment>();
  @Output() shipmentUpdated = new EventEmitter<Shipment>();

  @ViewChild(FormGroupDirective) shipmentFormDirective?: FormGroupDirective;

  shipments: Shipment[] = [];
  loading = false;
  creatingShipment = false;
  updatingShipment = false;

  shipmentForm: FormGroup;
  displayedColumns = [
    'shipping_method',
    'carrier_name',
    'tracking_number',
    'recipient_name',
    'recipient_phone',
    'destination_address',
    'status',
    'scheduled_date',
    'shipped_at',
    'delivered_at',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private shipmentsService: ShipmentsService,
    private notificationService: NotificationService
  ) {
    this.shipmentForm = this.createShipmentForm();
  }

  ngOnInit(): void {
    if (!this.orderId) {
      console.error('OrderShipmentsComponent: orderId is required');
      return;
    }

    this.loadShipments();

    // Subscribe to method changes for conditional validation
    this.shipmentForm
      .get('shipping_method')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateConditionalValidators();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load shipments for the order
   */
  loadShipments(): void {
    this.loading = true;
    this.shipmentsService
      .listShipmentsForOrder(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shipments: Shipment[]) => {
          this.shipments = shipments;
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('Error al cargar los envíos');
          this.loading = false;
        }
      });
  }

  /**
   * Create new shipment from form
   */
  onSubmitShipment(): void {
    if (this.shipmentForm.invalid) {
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.creatingShipment = true;
    const payload: ShipmentCreate = {
      order_id: this.orderId,
      shipping_method: this.shipmentForm.get('shipping_method')!.value,
      carrier_name: this.shipmentForm.get('carrier_name')?.value,
      tracking_number: this.shipmentForm.get('tracking_number')?.value,
      destination_address: this.shipmentForm.get('destination_address')?.value,
      recipient_name: this.shipmentForm.get('recipient_name')!.value,
      recipient_phone: this.shipmentForm.get('recipient_phone')!.value,
      scheduled_date: this.shipmentForm.get('scheduled_date')?.value
    };

    this.shipmentsService
      .createShipment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shipment) => {
          this.shipments.push(shipment);
          
          // Limpiar formulario usando FormGroupDirective para resetear estado submitted
          const defaultValues = {
            shipping_method: null,
            carrier_name: '',
            tracking_number: '',
            destination_address: '',
            recipient_name: null,
            recipient_phone: null,
            scheduled_date: new Date().toISOString().split('T')[0]
          };

          this.shipmentFormDirective?.resetForm(defaultValues);

          this.shipmentForm.markAsPristine();
          this.shipmentForm.markAsUntouched();

          Object.values(this.shipmentForm.controls).forEach((control) => {
            control.markAsPristine();
            control.markAsUntouched();
            control.updateValueAndValidity({ emitEvent: false });
          });

          this.notificationService.success('Envío registrado exitosamente');
          this.shipmentCreated.emit(shipment);
        },
        error: () => {
          this.notificationService.error('Error al crear el envío');
        },
        complete: () => {
          this.creatingShipment = false;
        }
      });
  }

  /**
   * Update shipment status (PENDING→IN_TRANSIT, IN_TRANSIT→DELIVERED, etc.)
   */
  updateStatus(shipment: Shipment, newStatus: ShipmentStatus): void {
    if (!isStatusTransitionValid(shipment.status, newStatus)) {
      this.notificationService.warning('Transición de estado no permitida');
      return;
    }

    let confirmMessage = '¿Actualizar estado del envío?';
    if (newStatus === 'DELIVERED') {
      confirmMessage = '¿Marcar envío como entregado?';
    } else if (newStatus === 'IN_TRANSIT') {
      confirmMessage = '¿Marcar envío en tránsito?';
    } else if (newStatus === 'CANCELLED') {
      confirmMessage = '¿Cancelar envío?';
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    this.updatingShipment = true;
    this.shipmentsService
      .updateShipmentStatus(shipment.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const index = this.shipments.findIndex((s) => s.id === shipment.id);
          if (index !== -1) {
            this.shipments[index] = updated;
          }
          this.notificationService.success(
            `Envío marcado como ${getShipmentStatusLabel(newStatus)}`
          );
          this.shipmentUpdated.emit(updated);

          // Emit special event if delivered
          if (newStatus === 'DELIVERED') {
            // Parent can listen to this to update order status if needed
          }
        },
        error: () => {
          this.notificationService.error('Error al actualizar el envío');
        },
        complete: () => {
          this.updatingShipment = false;
        }
      });
  }

  /**
   * Get available transitions for current status
   */
  getAvailableTransitions(status: ShipmentStatus): ShipmentStatus[] {
    return getValidStatusTransitions(status);
  }

  /**
   * Check if status transition is allowed
   */
  canTransitionTo(currentStatus: ShipmentStatus, targetStatus: ShipmentStatus): boolean {
    return isStatusTransitionValid(currentStatus, targetStatus);
  }

  /**
   * Get label for shipping method
   */
  getShippingMethodLabel(method: string): string {
    return getShippingMethodLabel(method as any);
  }

  /**
   * Get label for shipment status
   */
  getShipmentStatusLabel(status: string): string {
    return getShipmentStatusLabel(status as any);
  }

  /**
   * Get color for shipment status chip
   */
  getShipmentStatusColor(status: string): string {
    return getShipmentStatusColor(status as any);
  }

  /**
   * Check if shipping method requires destination address
   */
  requiresDestinationAddress(method: string): boolean {
    return requiresDestinationAddress(method as any);
  }

  /**
   * Check if shipping method requires carrier name
   */
  requiresCarrierName(method: string): boolean {
    return requiresCarrierName(method as any);
  }

  /**
   * Get available shipping methods
   */
  getAvailableShippingMethods() {
    return getAvailableShippingMethods();
  }

  /**
   * Create shipment form group
   */
  private createShipmentForm(): FormGroup {
    return this.fb.group({
      shipping_method: ['', Validators.required],
      carrier_name: [''],
      tracking_number: [''],
      destination_address: [''],
      recipient_name: ['', Validators.required],
      recipient_phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15),
          Validators.pattern(/^\d+$/)
        ]
      ],
      scheduled_date: [new Date().toISOString().split('T')[0]]
    });
  }

  /**
   * Update conditional validators based on shipping method
   */
  private updateConditionalValidators(): void {
    const method = this.shipmentForm.get('shipping_method')?.value;

    const destControl = this.shipmentForm.get('destination_address');
    const carrierControl = this.shipmentForm.get('carrier_name');
    const trackingControl = this.shipmentForm.get('tracking_number');

    if (!method) {
      destControl?.clearAsyncValidators();
      carrierControl?.clearAsyncValidators();
      trackingControl?.clearAsyncValidators();
      return;
    }

    // Destination address: required for non-PICKUP_STORE methods
    if (this.requiresDestinationAddress(method)) {
      destControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      destControl?.clearAsyncValidators();
    }

    // Carrier name: required for courier methods
    if (this.requiresCarrierName(method)) {
      carrierControl?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      carrierControl?.clearAsyncValidators();
    }

    // Tracking number: recommended for most methods
    if (method !== 'PICKUP_STORE') {
      trackingControl?.setValidators([Validators.minLength(5), Validators.maxLength(50)]);
    }

    destControl?.updateValueAndValidity();
    carrierControl?.updateValueAndValidity();
    trackingControl?.updateValueAndValidity();
  }
}
