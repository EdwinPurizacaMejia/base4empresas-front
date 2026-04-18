import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseListItem } from '../../models/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, PurchaseFormComponent],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit {

  purchases: PurchaseListItem[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  successMessage: string | null = null;

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar compras. Intenta nuevamente.';
        this.purchases = [];
        this.loading = false;
      }
    });
  }

  onNewPurchase(): void {
    this.showForm = true;
  }

  onFormClosed(): void {
    this.showForm = false;
  }

  onPurchaseCreated(): void {
    this.showForm = false;
    this.successMessage = '✓ Compra registrada exitosamente';
    this.loadPurchases();

    setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Completada';
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }
}
