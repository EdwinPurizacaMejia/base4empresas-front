import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Evento de conflicto de concurrencia
 */
export interface ConflictEvent {
  error: HttpErrorResponse;
  timestamp: Date;
  message: string;
}

/**
 * Servicio de eventos globales de UI
 * 
 * Gestiona eventos que deben ser escuchados por múltiples componentes:
 * - Conflictos de concurrencia (409)
 * - Cambios de estado globales
 * - Notificaciones transversales
 * 
 * Implementa el patrón Observer para desacoplamiento.
 */
@Injectable({
  providedIn: 'root'
})
export class UiEventsService {
  private readonly conflictSubject$ = new Subject<ConflictEvent>();
  private readonly refreshOrdersSubject$ = new Subject<void>();
  private readonly refreshInventorySubject$ = new Subject<void>();
  private readonly authStateChangedSubject$ = new Subject<{ isLoggedIn: boolean }>();

  /**
   * Observable de eventos de conflicto (HTTP 409)
   * Los componentes pueden escuchar para recargar datos o mostrar UX específica
   */
  conflict$: Observable<ConflictEvent> = this.conflictSubject$.asObservable();

  /**
   * Observable para señalizar que las órdenes deben recargarse
   */
  refreshOrders$: Observable<void> = this.refreshOrdersSubject$.asObservable();

  /**
   * Observable para señalizar que el inventario debe recargarse
   */
  refreshInventory$: Observable<void> = this.refreshInventorySubject$.asObservable();

  /**
   * Observable para cambios en el estado de autenticación
   */
  authStateChanged$: Observable<{ isLoggedIn: boolean }> = this.authStateChangedSubject$.asObservable();

  /**
   * Emitir un evento de conflicto de concurrencia
   * Los componentes suscritos recargarán datos o mostrarán UI especial
   */
  emitConflict(error: HttpErrorResponse, message?: string): void {
    const conflictEvent: ConflictEvent = {
      error,
      timestamp: new Date(),
      message: message || (typeof error.error?.detail === 'string'
        ? error.error.detail
        : 'Conflicto: los datos han sido modificados. Por favor, actualiza e intenta nuevamente.')
    };
    this.conflictSubject$.next(conflictEvent);
  }

  /**
   * Señalizar que las órdenes deben recargarse
   */
  triggerRefreshOrders(): void {
    this.refreshOrdersSubject$.next();
  }

  /**
   * Señalizar que el inventario debe recargarse
   */
  triggerRefreshInventory(): void {
    this.refreshInventorySubject$.next();
  }

  /**
   * Notificar cambio de estado de autenticación
   */
  emitAuthStateChanged(isLoggedIn: boolean): void {
    this.authStateChangedSubject$.next({ isLoggedIn });
  }
}
