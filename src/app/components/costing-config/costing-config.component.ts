import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Warehouse } from '../../models/warehouse.model';
import { WarehouseService } from '../../services/warehouse.service';
import { NotificationService } from '../../services/notification.service';
import { CostingConfigService } from '../../services/costing-config.service';
import { CostingConfigResponse, CostingMethod } from '../../models/costing-config.model';

@Component({
  selector: 'app-costing-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './costing-config.component.html',
  styleUrls: ['./costing-config.component.scss'],
})
export class CostingConfigComponent implements OnInit, OnDestroy {
  warehouses: Warehouse[] = [];
  selectedWarehouseId = '';

  costingMethods: { value: CostingMethod; label: string }[] = [
    { value: 'PP', label: 'Promedio Ponderado (PP)' },
    { value: 'FIFO', label: 'PEPS / FIFO' },
    { value: 'STANDARD', label: 'Estándar' },
  ];

  currentConfig: CostingConfigResponse | null = null;
  selectedMethod: CostingMethod = 'PP';

  loadingWarehouses = false;
  loadingConfig = false;
  saving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private warehouseService: WarehouseService,
    private costingConfigService: CostingConfigService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWarehouses(): void {
    this.loadingWarehouses = true;

    this.warehouseService
      .getWarehouses({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.warehouses = data || [];
          this.loadingWarehouses = false;
        },
        error: (err) => {
          console.error(err);
          this.loadingWarehouses = false;
          this.warehouses = [];
          this.notificationService.error('No se pudo cargar la lista de almacenes.');
        },
      });
  }

  onSelectWarehouse(warehouseId: string): void {
    this.selectedWarehouseId = warehouseId;
    this.currentConfig = null;

    if (!warehouseId) return;

    this.loadingConfig = true;

    this.costingConfigService
      .getCostingConfig(warehouseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.currentConfig = config;
          this.selectedMethod = config.method;
          this.loadingConfig = false;
        },
        error: (err) => {
          console.error(err);
          this.loadingConfig = false;
          this.notificationService.error('No se pudo cargar la configuración de costeo.');
        },
      });
  }

  onSave(): void {
    if (!this.selectedWarehouseId) {
      this.notificationService.info('Selecciona un almacén.');
      return;
    }

    this.saving = true;

    this.costingConfigService
      .updateCostingConfig(this.selectedWarehouseId, { method: this.selectedMethod })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.currentConfig = config;
          this.selectedMethod = config.method;
          this.saving = false;
          this.notificationService.success('Configuración de costeo guardada');
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
          this.notificationService.error('No se pudo guardar la configuración de costeo.');
        },
      });
  }
}
