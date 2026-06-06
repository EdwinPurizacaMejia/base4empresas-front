# FASE 5 FRONTEND - GUÍA RÁPIDA (5 MINUTOS)

**Fecha**: Enero 2025  
**Objetivos**: Entender la arquitectura FASE 5 en 5 minutos

---

## 🎯 ¿Qué es FASE 5?

FASE 5 añade **observabilidad, auditoría visual y seguridad** al frontend:

| Feature                | Qué Hace                                              |
| ---------------------- | ----------------------------------------------------- |
| **EntityHistory**      | Muestra historial de cambios (quién, qué, cuándo)     |
| **Conflict Handler**   | Detecta cambios concurrentes (409) + UI para recargar |
| **Permission Service** | Control de acceso por roles (ADMIN, CASHIER, etc.)    |
| **2FA UI**             | Componentes de setup y verificación (lógica FASE 6)   |
| **UiEventsService**    | Bus de eventos global para notificaciones             |

---

## 📦 Archivos Nuevos (7 archivos)

### Servicios (3)

```
src/app/services/
├── audit.service.ts              ← GET /audit-logs
├── permission.service.ts          ← Roles y permisos
└── ui-events.service.ts           ← Bus de eventos
```

### Componentes (3)

```
src/app/components/
├── shared/entity-history/         ← Historial de cambios
├── security/two-factor-setup/     ← Setup 2FA (UI)
└── security/two-factor-verify/    ← Verificar OTP (UI)
```

### Modelos (1)

```
src/app/models/
└── audit-log.model.ts            ← Tipos: AuditLog, AuditAction, etc.
```

### Extensiones (1)

```
src/app/interceptors/
└── api-error.interceptor.ts       ← Modificado: +409 handler
```

---

## ⚡ Integración Rápida

### 1️⃣ Ver Historial de Auditoría en Órdenes

```typescript
// order-detail.component.ts
import { EntityHistoryComponent } from '@shared/entity-history.component';

@Component({
  // ...
  imports: [EntityHistoryComponent, ...],
  template: `
    <mat-tab-group>
      <mat-tab label="Detalles">...</mat-tab>
      <mat-tab label="Historial">
        <app-entity-history
          [entityType]="'ORDER'"
          [entityId]="order.id"
        ></app-entity-history>
      </mat-tab>
    </mat-tab-group>
  `
})
export class OrderDetailComponent {}
```

### 2️⃣ Controlar Visibilidad por Rol

```typescript
// payment.component.ts
export class PaymentComponent {
  constructor(public permissions: PermissionService) {}
}

// template
<button
  *ngIf="permissions.canValidatePayments()"
  (click)="validatePayment()"
>
  Validar Pago
</button>
```

### 3️⃣ Reaccionar a Conflictos (409)

```typescript
// inventory.component.ts
export class InventoryComponent implements OnInit {
  constructor(private uiEvents: UiEventsService) {}

  ngOnInit(): void {
    this.uiEvents.conflict$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      // El interceptor ya mostró una notificación
      // Aquí puedes hacer lógica adicional
      console.log("Conflicto:", event.message);
    });
  }
}
```

---

## 🔐 Roles Disponibles

```typescript
'ADMIN'       → Todos los permisos
'MANAGER'     → Crear/editar, sin eliminar
'CASHIER'     → Validar pagos
'SELLER'      → Crear órdenes
'OPERATOR'    → Gestionar envíos
'VIEWER'      → Solo lectura
```

---

## 📊 Endpoints Esperados del Backend

```http
GET /api/audit-logs?entity_type=ORDER&entity_id=123
Response: { data: [AuditLog, ...], total, limit, offset }

GET /api/audit-logs/{id}
Response: AuditLog
```

---

## ✅ Checklist de Integración

- [ ] Componente EntityHistory importado en order/payment/shipment detail
- [ ] PermissionService inyectado en componentes con visibilidad condicional
- [ ] Tested: Historial carga correctamente
- [ ] Tested: Roles se cumplen (ej: CASHIER no ve botón ADMIN)
- [ ] Tested: Conflictos (409) muestran notificación + event emitido

---

## 🚀 Próximo: FASE 6

FASE 6 completará:

- ✅ 2FA real (TOTP)
- ✅ Auditoría en BD (backend)
- ✅ Dashboards avanzados
- ✅ Export de logs (CSV/PDF)

---

## 🆘 Problemas Comunes

| Problema                    | Solución                                                |
| --------------------------- | ------------------------------------------------------- |
| EntityHistory table vacía   | Ver DevTools → Network → `/audit-logs` response         |
| Permiso no se respeta       | Llamar `permissions.setCurrentUser()` después login     |
| 409 no emite evento         | Verificar `ApiErrorInterceptor` registrado en `main.ts` |
| 2FA componentes no aparecen | Importarlos y usar `<app-two-factor-setup>`             |

---

**Tiempo Total**: ~15 minutos (integración + testing)  
**Complejidad**: Baja (servicios reutilizables)  
**ROI**: Alto (observabilidad + seguridad foundation)
