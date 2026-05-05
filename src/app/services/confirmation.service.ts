import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'error'; // Estilos visuales
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(private dialog: MatDialog) { }

  /**
   * Abre un diálogo de confirmación
   * @param data Datos del diálogo
   * @returns Observable con boolean (true si confirma, false si cancela)
   */
  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: false,
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText || 'Confirmar',
        cancelText: data.cancelText || 'Cancelar',
        severity: data.severity || 'info'
      }
    });

    return new Observable(observer => {
      dialogRef.afterClosed().subscribe(result => {
        observer.next(result || false);
        observer.complete();
      });
    });
  }

  /**
   * Confirmación para eliminar
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      severity: 'error'
    });
  }

  /**
   * Confirmación para guardar cambios
   */
  confirmSave(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Guardar cambios',
      message: `¿Deseas guardar los cambios en "${itemName}"?`,
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      severity: 'warning'
    });
  }

  /**
   * Confirmación para cancelar
   */
  confirmCancel(): Observable<boolean> {
    return this.confirm({
      title: 'Cancelar cambios',
      message: 'Tienes cambios sin guardar. ¿Deseas descartar los cambios?',
      confirmText: 'Descartar',
      cancelText: 'Volver',
      severity: 'warning'
    });
  }
}
