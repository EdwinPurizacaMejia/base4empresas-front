import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { UiEventsService } from '../services/ui-events.service';

type FastApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

/**
 * Formatea errores de validación de FastAPI (HTTP 422)
 * Extrae los campos y mensajes de validación
 */
function formatFastApi422(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;

  const lines = (detail as FastApiValidationError[])
    .map((e) => {
      const loc = Array.isArray(e.loc) ? e.loc : [];
      const field = loc.length ? String(loc[loc.length - 1]) : 'field';
      const msg = e.msg ? String(e.msg) : 'Valor inválido';
      return `${field}: ${msg}`;
    })
    .filter(Boolean);

  return lines.length ? lines.join('\n') : null;
}

/**
 * Extrae el detalle del error de una respuesta FastAPI
 * FastAPI típicamente responde con: { detail: ... }
 */
function extractFastApiDetail(errBody: any): unknown {
  if (errBody && typeof errBody === 'object' && 'detail' in errBody) {
    return (errBody as any).detail;
  }
  return null;
}

/**
 * Interceptor global de errores HTTP
 * 
 * Maneja errores HTTP con mensajes amigables para el usuario:
 * - 0 (CORS/conexión): Error de conexión
 * - 400: Solicitud inválida (errores de validación)
 * - 401: No autorizado
 * - 403: Acceso denegado
 * - 404: Recurso no encontrado
 * - 409: Conflicto (ej. stock modificado, concurrencia)
 * - 422: Error de validación FastAPI
 * - 500+: Error interno del servidor
 * 
 * Integración con NotificationService para mostrar mensajes al usuario.
 */
export function apiErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const notifications = inject(NotificationService);
  const uiEvents = inject(UiEventsService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        notifications.error('Error inesperado en la aplicación');
        return throwError(() => err);
      }

      // Opción: si el header X-Skip-Error-Toast es true, no mostrar notificación
      // (útil cuando el componente ya maneja el error)
      const skipErrorToast = req.headers.has('X-Skip-Error-Toast')
        ? req.headers.get('X-Skip-Error-Toast') === 'true'
        : false;

      const status = err.status;
      const detail = extractFastApiDetail(err.error);
      let message: string | null = null;

      // === Error de conexión / CORS / backend caído ===
      if (status === 0) {
        if (!skipErrorToast) {
          notifications.error(
            'No se pudo conectar con el servidor. ' +
            'Por favor, verifica que el backend está activo y accesible.'
          );
        }
        return throwError(() => err);
      }

      // === 400: Solicitud inválida ===
      if (status === 400) {
        message = typeof detail === 'string' ? detail : null;
        if (!skipErrorToast) {
          notifications.error(
            message ? `Solicitud inválida: ${message}` : 'La solicitud contiene datos inválidos'
          );
        }
        return throwError(() => err);
      }

      // === 401: No autorizado ===
      if (status === 401) {
        if (!skipErrorToast) {
          notifications.warning('No autorizado. Por favor, inicia sesión nuevamente.');
        }
        return throwError(() => err);
      }

      // === 403: Acceso denegado ===
      if (status === 403) {
        if (!skipErrorToast) {
          notifications.warning('No tienes permiso para realizar esta acción.');
        }
        return throwError(() => err);
      }

      // === 404: Recurso no encontrado ===
      if (status === 404) {
        message = typeof detail === 'string' ? detail : null;
        if (!skipErrorToast) {
          notifications.error(
            message ? `Recurso no encontrado: ${message}` : 'El recurso solicitado no existe.'
          );
        }
        return throwError(() => err);
      }

      // === 409: Conflicto (stock modificado, concurrencia, etc.) ===
      if (status === 409) {
        message = typeof detail === 'string' ? detail : null;
        if (!skipErrorToast) {
          // Mostrar advertencia con contexto específico para conflictos
          notifications.warning(
            message
              ? `Conflicto: ${message}`
              : 'El recurso ha sido modificado. Por favor, recarga los datos e intenta nuevamente.'
          );
        }
        // FASE 5: Emitir evento global de conflicto para que componentes puedan reaccionar
        uiEvents.emitConflict(err, message || undefined);
        return throwError(() => err);
      }

      // === 422: Error de validación (FastAPI) ===
      if (status === 422) {
        message = formatFastApi422(detail) ?? (typeof detail === 'string' ? detail : null);
        if (!skipErrorToast) {
          notifications.error(
            message ?? 'Por favor, verifica los datos ingresados.'
          );
        }
        return throwError(() => err);
      }

      // === 5xx: Error interno del servidor ===
      if (status >= 500) {
        if (!skipErrorToast) {
          notifications.error(
            'Error interno del servidor. Por favor, intenta nuevamente más tarde.'
          );
        }
        return throwError(() => err);
      }

      // === Fallback genérico ===
      message = typeof detail === 'string' ? detail : null;
      if (!skipErrorToast) {
        notifications.error(message ?? `Error HTTP ${status}`);
      }
      return throwError(() => err);
    })
  );
}
