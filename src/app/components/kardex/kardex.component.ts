import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KardexMovement } from '../../models/kardex.model';
import { KardexService } from '../../services/kardex.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent implements OnInit {

  movements: KardexMovement[] = [];
  productId = '';
  warehouseId = '';
  loading = false;
  error: string | null = null;
  initialLoad = true;

  constructor(private kardexService: KardexService) {}

  ngOnInit(): void {
    // Intentar cargar workspace ID por localStorage
    if (typeof localStorage !== 'undefined') {
      this.warehouseId = localStorage.getItem('lastWarehouseId') || '';
    }
  }

  loadKardex(): void {
    if (!this.productId.trim()) {
      this.error = 'Por favor ingresa un ID de producto';
      this.movements = [];
      return;
    }

    if (!this.warehouseId.trim()) {
      this.error = 'Por favor ingresa un ID de almacén';
      this.movements = [];
      return;
    }

    this.loading = true;
    this.error = null;
    this.initialLoad = false;

    this.kardexService.getKardex(this.productId, this.warehouseId).subscribe({
      next: (data) => {
        this.movements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar kardex. Verifica los IDs e intenta nuevamente.';
        this.movements = [];
        this.loading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.loadKardex();
    }
  }

  get totalIn(): number {
    return this.movements
      .filter(m => m.movement_type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  get totalOut(): number {
    return this.movements
      .filter(m => m.movement_type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  get balance(): number {
    return this.totalIn - this.totalOut;
  }

  get totalInValue(): number {
    return this.movements
      .filter(m => m.movement_type === 'IN')
      .reduce((sum, m) => sum + (m.quantity * m.unit_cost), 0);
  }

  get totalOutValue(): number {
    return this.movements
      .filter(m => m.movement_type === 'OUT')
      .reduce((sum, m) => sum + (m.quantity * m.unit_cost), 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  getMovementTypeLabel(type: string): string {
    return type === 'IN' ? 'Entrada' : 'Salida';
  }

  getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'PURCHASE': 'Compra',
      'SALE': 'Venta',
      'ADJUSTMENT': 'Ajuste',
      'RETURN': 'Devolución',
      'OTHER': 'Otro'
    };
    return labels[reason] || reason;
  }
}
