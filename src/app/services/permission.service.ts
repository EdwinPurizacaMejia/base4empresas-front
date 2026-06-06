import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Roles de usuario disponibles en el sistema
 */
export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'SELLER'
  | 'OPERATOR'
  | 'VIEWER'
  | 'GUEST';

/**
 * Permisos disponibles en el sistema
 */
export type Permission =
  // Órdenes
  | 'ORDER_CREATE'
  | 'ORDER_VIEW'
  | 'ORDER_EDIT'
  | 'ORDER_DELETE'
  | 'ORDER_CANCEL'
  | 'ORDER_SEPARATE'

  // Pagos
  | 'PAYMENT_CREATE'
  | 'PAYMENT_VIEW'
  | 'PAYMENT_VALIDATE'
  | 'PAYMENT_REJECT'

  // Envíos
  | 'SHIPMENT_CREATE'
  | 'SHIPMENT_VIEW'
  | 'SHIPMENT_UPDATE'
  | 'SHIPMENT_CANCEL'

  // Inventario
  | 'INVENTORY_VIEW'
  | 'INVENTORY_EDIT'
  | 'INVENTORY_DELETE'

  // Seguridad
  | 'AUDIT_VIEW'
  | 'USER_MANAGE'
  | 'ROLE_MANAGE'

  // Otros
  | 'EXPORT_DATA'
  | 'IMPORT_DATA';

/**
 * Mapeo de roles a permisos
 * Define qué permisos tiene cada rol
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'ADMIN': [
    // Admin tiene todos los permisos
    'ORDER_CREATE', 'ORDER_VIEW', 'ORDER_EDIT', 'ORDER_DELETE', 'ORDER_CANCEL', 'ORDER_SEPARATE',
    'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_VALIDATE', 'PAYMENT_REJECT',
    'SHIPMENT_CREATE', 'SHIPMENT_VIEW', 'SHIPMENT_UPDATE', 'SHIPMENT_CANCEL',
    'INVENTORY_VIEW', 'INVENTORY_EDIT', 'INVENTORY_DELETE',
    'AUDIT_VIEW', 'USER_MANAGE', 'ROLE_MANAGE',
    'EXPORT_DATA', 'IMPORT_DATA'
  ],

  'MANAGER': [
    // Manager puede crear, ver y editar, pero no eliminar usuarios
    'ORDER_CREATE', 'ORDER_VIEW', 'ORDER_EDIT', 'ORDER_CANCEL', 'ORDER_SEPARATE',
    'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_VALIDATE', 'PAYMENT_REJECT',
    'SHIPMENT_CREATE', 'SHIPMENT_VIEW', 'SHIPMENT_UPDATE', 'SHIPMENT_CANCEL',
    'INVENTORY_VIEW', 'INVENTORY_EDIT',
    'AUDIT_VIEW',
    'EXPORT_DATA'
  ],

  'CASHIER': [
    // Cashier válida pagos principalmente
    'ORDER_VIEW',
    'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_VALIDATE', 'PAYMENT_REJECT',
    'SHIPMENT_VIEW',
    'INVENTORY_VIEW',
    'EXPORT_DATA'
  ],

  'SELLER': [
    // Seller crea y ve órdenes, ve pagos e inventario
    'ORDER_CREATE', 'ORDER_VIEW', 'ORDER_EDIT', 'ORDER_SEPARATE',
    'PAYMENT_VIEW',
    'SHIPMENT_VIEW',
    'INVENTORY_VIEW',
    'EXPORT_DATA'
  ],

  'OPERATOR': [
    // Operator gestiona envíos principalmente
    'ORDER_VIEW',
    'SHIPMENT_CREATE', 'SHIPMENT_VIEW', 'SHIPMENT_UPDATE', 'SHIPMENT_CANCEL',
    'INVENTORY_VIEW'
  ],

  'VIEWER': [
    // Viewer solo ve datos, no modifica nada
    'ORDER_VIEW',
    'PAYMENT_VIEW',
    'SHIPMENT_VIEW',
    'INVENTORY_VIEW',
    'EXPORT_DATA'
  ],

  'GUEST': [
    // Guest tiene acceso mínimo
    'ORDER_VIEW',
    'INVENTORY_VIEW'
  ]
};

/**
 * Información del usuario actual
 */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string | null;
}

/**
 * Servicio de Permisos y Seguridad - FASE 5
 * 
 * Gestiona:
 * - Roles de usuario (ADMIN, CASHIER, SELLER, etc.)
 * - Permisos granulares (ORDER_CREATE, PAYMENT_VALIDATE, etc.)
 * - Control de visibilidad en UI basado en permisos
 * - Estado del usuario actual
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly currentUserSubject$ = new BehaviorSubject<CurrentUser | null>(null);

  /**
   * Observable del usuario actual
   */
  currentUser$: Observable<CurrentUser | null> = this.currentUserSubject$.asObservable();

  /**
   * Observable de rol actual
   */
  currentRole$: Observable<UserRole | null> = this.currentUser$.pipe(
    map(user => user?.role ?? null)
  );

  constructor() {
    // En una aplicación real, cargarías el usuario desde:
    // - localStorage (después de auth)
    // - SessionStorage
    // - O consultarías a un AuthService
    this.loadCurrentUser();
  }

  /**
   * Cargar usuario actual (mock para demo)
   * En producción, llamaría a AuthService.getCurrentUser()
   */
  private loadCurrentUser(): void {
    // TODO: Integrar con AuthService real
    // Por ahora, es un placeholder que puede ser sobrescrito en tests
  }

  /**
   * Establecer el usuario actual
   * (Típicamente llamado por AuthService después del login)
   */
  setCurrentUser(user: CurrentUser | null): void {
    this.currentUserSubject$.next(user);
  }

  /**
   * Obtener el usuario actual (síncronamente)
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject$.value;
  }

  /**
   * Verificar si el usuario actual tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    const user = this.currentUserSubject$.value;
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Verificar si el usuario actual tiene ALL los permisos especificados
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(perm => this.hasPermission(perm));
  }

  /**
   * Verificar si el usuario actual tiene ANY de los permisos especificados
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserSubject$.value?.role === role;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Verificar si el usuario puede validar pagos (ADMIN o CASHIER)
   */
  canValidatePayments(): boolean {
    return this.hasAnyPermission(['PAYMENT_VALIDATE']);
  }

  /**
   * Verificar si el usuario puede crear órdenes
   */
  canCreateOrders(): boolean {
    return this.hasPermission('ORDER_CREATE');
  }

  /**
   * Verificar si el usuario puede ver auditoría
   */
  canViewAudit(): boolean {
    return this.hasPermission('AUDIT_VIEW');
  }

  /**
   * Obtener todos los permisos del usuario actual
   */
  getCurrentPermissions(): Permission[] {
    const user = this.currentUserSubject$.value;
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }

  /**
   * Obtener Observable para verificar permiso (para uso en templates)
   */
  hasPermission$(permission: Permission): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
      })
    );
  }

  /**
   * Limpiar usuario al logout
   */
  logout(): void {
    this.currentUserSubject$.next(null);
  }
}
