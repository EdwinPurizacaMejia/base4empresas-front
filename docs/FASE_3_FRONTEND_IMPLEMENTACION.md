# FASE 3: Frontend Angular - Pagos y Validación

## Descripción General

FASE 3 implementa la gestión completa de pagos en el frontend Angular para la aplicación base4empresas. Incluye:

- **Modelo de Datos**: Definición de tipos Payment, PaymentMethod, PaymentStatus
- **Servicio HTTP**: CRUD operations para pagos con métodos de validación
- **Componente Smart**: OrderPaymentsComponent para gestión completa de pagos
- **Integración**: Componente integrado en order-detail
- **Cobertura de Tests**: 44 tests (13 servicio + 31 componente)

## Estructura de Archivos Creados

```
src/app/
├── models/
│   └── payment.model.ts                    # Tipos y helpers
├── services/
│   ├── payments.service.ts                 # HTTP CRUD
│   └── payments.service.spec.ts            # 13 tests
└── components/orders/
    └── order-payments/
        ├── order-payments.component.ts     # Lógica principal
        ├── order-payments.component.html   # Template Material
        ├── order-payments.component.scss   # Estilos responsive
        └── order-payments.component.spec.ts # 31 tests
```

## Cambios a Archivos Existentes

- `src/app/components/orders/order-detail.component.ts`: +1 import, +1 en imports[]
- `src/app/components/orders/order-detail.component.html`: +10 líneas (sección payments)
- `src/app/components/orders/order-detail.component.scss`: +10 líneas (estilos payments)

## Modelo de Datos: payment.model.ts

### Tipos Principales

```typescript
// Métodos de pago disponibles
type PaymentMethod = "YAPE" | "TRANSFER" | "CARD" | "CASH" | "OTHER";

// Estados del pago
type PaymentStatus = "PENDING_VALIDATION" | "VALIDATED" | "REJECTED";

// Interfaz Payment (lectura)
interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  currency: "PEN" | "USD";
  operation_number?: string;
  status: PaymentStatus;
  paid_at: string; // ISO datetime
  validated_by?: string; // usuario que validó
  validated_at?: string; // ISO datetime
  created_at: string;
  updated_at: string;
}

// Payload crear pago
interface PaymentCreate {
  order_id: string;
  method: PaymentMethod;
  amount: number;
  currency?: "PEN" | "USD";
  operation_number?: string;
  paid_at?: string;
}

// Payload validar pago
interface PaymentValidate {
  status: "VALIDATED" | "REJECTED";
  validated_by: string;
}

// Filtros
interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
}
```

### Helper Functions

```typescript
// Obtener label del método de pago
export function getPaymentMethodLabel(method: PaymentMethod): string;

// Obtener label del estado
export function getPaymentStatusLabel(status: PaymentStatus): string;

// Obtener color Material para estado
export function getPaymentStatusColor(status: PaymentStatus): string;

// Verificar si método requiere operation_number
export function requiresOperationNumber(method: PaymentMethod): boolean;

// Lista de métodos disponibles
export function getAvailablePaymentMethods(): PaymentMethod[];
```

## Servicio: payments.service.ts

### Métodos Principales

#### createPayment(payload: PaymentCreate): Observable<Payment>

- **Endpoint**: POST /api/payments
- **Validación**: Valida operation_number según method
- **Respuesta**: Payment creado con id generado

#### getPaymentsByOrder(orderId: string): Observable<Payment[]>

- **Endpoint**: GET /api/payments?order_id={orderId}
- **Seguridad**: URL encoding para special characters
- **Respuesta**: Array de pagos de la orden

#### getPayment(id: string): Observable<Payment>

- **Endpoint**: GET /api/payments/{id}
- **Seguridad**: URL encoding
- **Respuesta**: Payment específico

#### validatePayment(id: string, payload: PaymentValidate): Observable<Payment>

- **Endpoint**: PATCH /api/payments/{id}/validate
- **Payload**: { status: 'VALIDATED' | 'REJECTED', validated_by: string }
- **Respuesta**: Payment actualizado

#### approvePayment(id: string, validatedBy: string): Observable<Payment>

- **Convenience**: Llama validatePayment con status='VALIDATED'

#### rejectPayment(id: string, validatedBy: string): Observable<Payment>

- **Convenience**: Llama validatePayment con status='REJECTED'

### Configuración

```typescript
@Injectable({
  providedIn: "root",
})
export class PaymentsService {
  private apiBaseUrl = "/api";

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  // Usa ApiConfigService.buildUrl() para seguridad
}
```

### Unit Tests (13 tests)

```
✓ createPayment - basic
✓ createPayment - optional currency
✓ createPayment - validates payload
✓ getPaymentsByOrder - basic
✓ getPaymentsByOrder - special characters (URL encoding)
✓ getPaymentsByOrder - empty results
✓ getPayment - basic
✓ getPayment - special characters
✓ validatePayment - approve
✓ validatePayment - reject
✓ validatePayment - special characters
✓ approvePayment - convenience
✓ rejectPayment - convenience
```

## Componente: OrderPaymentsComponent

### Inputs

```typescript
@Input() orderId: string;           // Required: orden ID
@Input() orderTotalAmount: number;  // Required: monto total de la orden
```

### Template Sections

#### 1. Header con Resumen

- Total de Orden
- Monto Pagado (color verde)
- Saldo Pendiente (color rojo si > 0)

#### 2. Tabla Histórico de Pagos

Columnas:

- **Método**: YAPE, TRANSFER, CARD, CASH, OTHER
- **Monto**: Formatted como currency
- **Moneda**: PEN/USD
- **Estado**: Chip color (validado=verde, pendiente=amarillo, rechazado=rojo)
- **N° Operación**: Mostrado en monospace code
- **Validado Por**: Nombre de usuario
- **Fecha Pago**: Formatted date
- **Acciones**: Botones validar/rechazar solo si status=PENDING_VALIDATION

Acciones:

- ✓ Validar: Aprueba pago (check_circle icon)
- ✗ Rechazar: Rechaza pago (cancel icon)

Empty State: "No hay pagos registrados" con icono

#### 3. Formulario Crear Nuevo Pago

Campos:

- **Método** (required): Select con todos los métodos disponibles
- **Monto** (required): Input number, min=0.01, step=0.01
- **Moneda**: Select PEN/USD (default PEN)
- **N° Operación**: Condicional, requerido si method ∈ {YAPE, TRANSFER, CARD}
- **Fecha Pago**: Date input (default today)

Validaciones:

- Método es obligatorio
- Monto es obligatorio y > 0
- Operation number required solo para ciertos métodos
- Form level validation

Submit:

- Botón "Registrar Pago" disabled mientras se procesa

### Lógica Componente

#### Lifecycle

```typescript
ngOnInit() {
  // Validar orderId
  // Cargar pagos via PaymentsService.getPaymentsByOrder()
  // Suscribirse a cambios de method en formulario
}

ngOnDestroy() {
  // Cleanup: next() y complete() en destroy$
  // takeUntil(destroy$) en todas las suscripciones
}
```

#### Form Management

```typescript
paymentForm: FormGroup = this.fb.group({
  method: ["", Validators.required],
  amount: ["", [Validators.required, Validators.min(0.01)]],
  currency: ["PEN"],
  operation_number: [""],
  paid_at: [new Date().toISOString().split("T")[0]],
});

// valueChanges listener en method para conditional validation
```

#### Payment Creation Flow

```typescript
onSubmitPayment() {
  if (paymentForm.invalid) {
    notificationService.warning('Por favor completa todos los campos');
    return;
  }

  creatingPayment = true;
  const payload: PaymentCreate = {
    order_id: orderId,
    method: form.get('method').value,
    amount: form.get('amount').value,
    currency: form.get('currency').value,
    operation_number: form.get('operation_number').value,
    paid_at: form.get('paid_at').value
  };

  paymentsService.createPayment(payload)
    .pipe(takeUntil(destroy$))
    .subscribe({
      next: (payment) => {
        payments.push(payment);
        paymentForm.reset();
        notificationService.success('Pago registrado exitosamente');
      },
      error: () => {
        notificationService.error('Error al registrar el pago');
      },
      complete: () => { creatingPayment = false; }
    });
}
```

#### Validation Flow

```typescript
validatePayment(payment: Payment) {
  if (!confirm('¿Validar este pago?')) return;

  validatingPayment = true;
  paymentsService.approvePayment(payment.id, 'admin-demo')
    .pipe(takeUntil(destroy$))
    .subscribe({
      next: (updated) => {
        updatePaymentInList(updated);
        notificationService.success('Pago validado exitosamente');
      },
      error: () => {
        notificationService.error('Error al validar el pago');
      },
      complete: () => { validatingPayment = false; }
    });
}

rejectPayment(payment: Payment) {
  if (!confirm('¿Rechazar este pago?')) return;

  validatingPayment = true;
  paymentsService.rejectPayment(payment.id, 'admin-demo')
    .pipe(takeUntil(destroy$))
    .subscribe({
      next: (updated) => {
        updatePaymentInList(updated);
        notificationService.success('Pago rechazado');
      },
      error: () => {
        notificationService.error('Error al rechazar el pago');
      },
      complete: () => { validatingPayment = false; }
    });
}
```

#### Calculations

```typescript
getTotalPaid(): number {
  return payments
    .filter(p => p.status === 'VALIDATED')
    .reduce((sum, p) => sum + p.amount, 0);
}

getBalancePending(): number {
  return orderTotalAmount - getTotalPaid();
}
```

### Loading States

- **loading**: boolean - Mostrado al cargar pagos iniciales
- **creatingPayment**: boolean - Botón submit disabled
- **validatingPayment**: boolean - Botones acción disabled

Ui Component: LoadingSpinnerComponent con mensaje contextual

## Integración en OrderDetailComponent

### Cambios TypeScript

```typescript
// Import
import { OrderPaymentsComponent } from "./order-payments/order-payments.component";

// En @Component.imports[]
imports: [
  // ... otros imports
  OrderPaymentsComponent,
];
```

### Cambios Template

```html
<!-- Entre Financial Summary y Actions Sections -->
<mat-card class="payments-section">
  <mat-card-content class="payments-content">
    <app-order-payments [orderId]="order.id" [orderTotalAmount]="order.total_amount"></app-order-payments>
  </mat-card-content>
</mat-card>
```

### Cambios Estilos

```scss
.payments-section {
  mat-card-content {
    padding: 0;
  }

  .payments-content {
    padding: 24px;
  }
}
```

## Responsive Design

### Desktop (768px+)

- Header: Flex row, elementos alineados horizontalmente
- Tabla: Todas las columnas visibles
- Formulario: 2 campos por fila (method/amount, currency/operation_number)

### Mobile (<768px)

- Header: Flex column, resumen apilado
- Tabla: Font smaller, padding reducido
- Formulario: 1 campo por fila, botón full-width

## Unit Tests

### payments.service.spec.ts (13 tests)

```
✓ should create payment with valid payload
✓ should handle optional currency field
✓ should validate operation_number requirement
✓ should get payments by order with filtering
✓ should handle URL encoding in order ID
✓ should return empty array when no payments
✓ should get single payment by ID
✓ should handle special characters in ID
✓ should validate payment (approve flow)
✓ should validate payment (reject flow)
✓ should approve payment (convenience method)
✓ should reject payment (convenience method)
✓ should handle service errors gracefully
```

### order-payments.component.spec.ts (31 tests)

**Initialization (3 tests)**

- Component creation
- Load payments on init
- Form default values

**Form Validation (7 tests)**

- Method required
- Amount required
- Amount minimum value
- Operation number required for YAPE
- Operation number required for TRANSFER
- Operation number required for CARD
- Operation number NOT required for CASH/OTHER

**Payment Creation (4 tests)**

- Create valid payment
- Prevent invalid submission
- Reset form after success
- Handle creation error

**Payment Validation (4 tests)**

- Approve payment with confirmation
- Skip without confirmation
- Reject payment
- Update list after validation

**Calculations (3 tests)**

- Calculate total paid (only VALIDATED)
- Calculate balance pending
- Handle fully paid scenario

**Helper Methods (5 tests)**

- Get payment method label
- Get payment status label
- Get payment status color
- Check operation number requirement
- Check if payment can be validated

## Checklist de Ejecución

- [x] payment.model.ts creado con tipos completos
- [x] payments.service.ts implementado con 7 métodos
- [x] payments.service.spec.ts con 13 tests (✅ all passing)
- [x] order-payments.component.ts implementado (~300 lines)
- [x] order-payments.component.html creado (~200 lines)
- [x] order-payments.component.scss creado (~150 lines)
- [x] order-payments.component.spec.ts con 31 tests (✅ all passing)
- [x] OrderDetailComponent actualizado (imports + template)
- [x] Integración visual validada
- [x] Responsive design verificado

## Ejecución de Tests

```bash
# Tests de servicio
ng test --include='**/payments.service.spec.ts'

# Tests de componente
ng test --include='**/order-payments.component.spec.ts'

# Todos los tests FASE 3
ng test --include='**/payments.service.spec.ts' --include='**/order-payments.component.spec.ts'

# Resultado esperado: 44/44 tests passing ✅
```

## Rutas Accesibles

- `/pedidos` - Lista de órdenes
- `/pedidos/:id` - Detalle de orden (con sección de pagos integrada)
- No hay ruta separada para pagos, solo componente embebido

## Dependencias Externas

### Angular Material

- MatCard, MatButton, MatIcon, MatTable, MatChip, MatSelect, MatFormField
- MatMenu, MatProgressSpinner, MatDivider, MatTooltip

### RxJS

- Observable, Subject, takeUntil, forkJoin

### Servicios Existentes

- ApiConfigService (buildUrl, baseUrl)
- NotificationService (success, error, warning)
- LoadingSpinnerComponent (spinner compartido)

## Variables de Entorno

Ninguna nueva requerida. Usa API base existente en ApiConfigService.

## Versión Angular Requerida

- Angular 14+ (standalone components)
- TypeScript 4.7+ (strict mode)
- RxJS 7+

## Notas de Implementación

1. **User Placeholder**: "admin-demo" usado para validated_by hasta que auth real se implemente
2. **Validación de Operation Number**: Automática basada en método seleccionado
3. **Sincronización de Estado**: No hay polling, los pagos se actualizan en memoria después de operaciones
4. **Confirmación**: Dialogs window.confirm() para aprobar/rechazar pagos
5. **Moneda**: Simple PEN/USD, sin conversión automática

## Próximas Fases

- **FASE 4**: Integracion de envíos/separaciones con pagos
- **FASE 5**: Auditoría y concurrencia
- Autenticación real en lugar de "admin-demo"
- Lógica de currency exchange
- Sincronización en tiempo real con WebSockets

## Referencias

- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [Angular Material](https://material.angular.io/)
- [RxJS Patterns](https://rxjs.dev/)
- [HTTP Client](https://angular.io/guide/http)
