import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig extends MatSnackBarConfig {
  type?: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly DEFAULT_DURATION = 4000; // ms
  private readonly LONG_DURATION = 6000; // ms
  private readonly SHORT_DURATION = 2000; // ms

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'success', duration);
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration: number = this.LONG_DURATION): void {
    this.show(message, 'error', duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'info', duration);
  }

  /**
   * Muestra una notificación personalizada
   */
  show(
    message: string,
    type: NotificationType = 'info',
    duration: number = this.DEFAULT_DURATION,
    action: string = 'Cerrar'
  ): void {
    const config: NotificationConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [`notification-${type}`],
      type,
    };

    // MatSnackBar por defecto renderiza texto plano, pero \n no siempre se muestra como salto.
    // Normalizamos a un texto más legible reemplazando saltos por " • " para mantener 1 línea,
    // evitando snackbars demasiado altos.
    const normalized = String(message ?? '').replace(/\s*\n\s*/g, ' • ').trim();
    this.snackBar.open(normalized, action, config);
  }

  /**
   * Cierra todas las notificaciones abiertas
   */
  closeAll(): void {
    this.snackBar.dismiss();
  }
}
