# FASE 4: Frontend Angular - Logística y Envíos

## Descripción General

FASE 4 implementa la gestión completa de envíos en el frontend Angular para la aplicación base4empresas. Incluye:

- **Modelo de Datos**: Definición de tipos Shipment, ShippingMethod, ShipmentStatus
- **Servicio HTTP**: CRUD operations para envíos con métodos de actualización de estado
- **Componente Smart**: OrderShipmentsComponent para gestión completa de envíos
- **Integración**: Componente integrado en order-detail
- **Cobertura de Tests**: 43 tests (17 servicio + 26 componente)

## Estructura de Archivos Creados

```
src/app/
├── models/
│   └── shipment.model.ts                   # Tipos y helpers
├── services/
│   ├── shipments.service.ts                # HTTP CRUD
│   └── shipments.service.spec.ts           # 17 tests
└── components/orders/
    └── order-shipments/
        ├── order-shipments.component.ts    # Lógica principal
        ├── order-shipments.component.html  # Template Material
        ├── order-shipments.component.scss  # Estilos responsive
        └── order-shipments.component.spec.ts # 26 tests
```

## Cambios a Archivos Existentes

- `src/app/components/orders/order-detail.component.ts`: +1 import, +1 en imports[]
- `src/app/components/orders/order-detail.component.html`: +11 líneas (sección shipments)
- `src/app/components/orders/order-detail.component.scss`: +10 líneas (estilos shipments)

## Modelo de Datos: shipment.model.ts

### Tipos Principales

```typescript
// Métodos de envío disponibles
type ShippingMethod =
  | "MOTORBIKE" // Motorizado
  | "COURIER_OLVA" // Courier Olva
  | "COURIER_SHALOM" // Courier Shalom
  | "COURIER_OTHER" // Otro Courier
  | "PICKUP_STORE"; // Retiro en Tienda

// Estados del envío
type ShipmentStatus =
  | "PENDING" // Pendiente
  | "IN_TRANSIT" // En ruta
  | "DELIVERED" // Entregado
  | "CANCELLED"; // Cancelado

// Interfaz Shipment (lectura)
interface Shipment {
  id: string;
  order_id: string;
  shipping_method: ShippingMethod;
  carrier_name?: string | null; // Transportista
  tracking_number?: string | null; // N° de seguimiento
  destination_address?: string | null; // Dirección destino
  recipient_name: string; // Destinatario
  recipient_phone: string; // Teléfono destinatario
  status: ShipmentStatus;
  scheduled_date?: string | null; // Fecha programada
  shipped_at?: string | null; // Fecha enviado
  delivered_at?: string | null; // Fecha entregado
  cancelled_at?: string | null; // Fecha cancelado
  created_at: string;
  updated_at: string;
}

// Payload crear envío
interface ShipmentCreate {
  order_id: string;
  shipping_method: ShippingMethod;
  carrier_name?: string;
  tracking_number?: string;
  destination_address?: string;
  recipient_name: string;
  recipient_phone: string;
  scheduled_date?: string;
}

// Payload actualizar estado
interface ShipmentUpdateStatus {
  status: ShipmentStatus;
  tracking_number?: string;
}

// Filtros
interface ShipmentFilters {
  status?: ShipmentStatus;
  shipping_method?: ShippingMethod;
}
```

### Helper Functions

```typescript
// Obtener label del método de envío
export function getShippingMethodLabel(method: ShippingMethod): string;

// Obtener label del estado
export function getShipmentStatusLabel(status: ShipmentStatus): string;

// Obtener color Material para estado
export function getShipmentStatusColor(status: ShipmentStatus): string;

// Verificar si método requiere dirección destino
export function requiresDestinationAddress(method: ShippingMethod): boolean;

// Verificar si método requiere nombre transportista
export function requiresCarrierName(method: ShippingMethod): boolean;

// Lista de métodos disponibles
export function getAvailableShippingMethods(): ShippingMethod[];

// Obtener transiciones de estado válidas
export function getValidStatusTransitions(currentStatus: ShipmentStatus): ShipmentStatus[];

// Verificar si transición de estado es válida
export function isStatusTransitionValid(currentStatus: ShipmentStatus, targetStatus: ShipmentStatus): boolean;
```

## Servicio: shipments.service.ts

### Métodos Principales

#### createShipment(payload: ShipmentCreate): Observable<Shipment>

- **Endpoint**: POST /api/shipments
- **Validación**: Valida campos condicionales según shipping_method
- **Respuesta**: Shipment creado con id generado

#### updateShipmentStatus(id: string, payload: ShipmentUpdateStatus): Observable<Shipment>

- **Endpoint**: PATCH /api/shipments/{id}/status
- **Payload**: { status: ShipmentStatus, tracking_number?: string }
- **Seguridad**: URL encoding para special characters
- **Respuesta**: Shipment actualizado

#### getShipment(id: string): Observable<Shipment>

- **Endpoint**: GET /api/shipments/{id}
- **Seguridad**: URL encoding
- **Respuesta**: Shipment específico

#### getShipmentsByOrder(orderId: string): Observable<Shipment[]>

- **Endpoint**: GET /api/shipments?order_id={orderId}
- **Seguridad**: URL encoding para order_id
- **Respuesta**: Array de envíos de la orden

### Configuración

```typescript
@Injectable({
  providedIn: "root",
})
export class ShipmentsService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.baseUrl = this.apiConfig.buildUrl("/shipments");
  }
}
```

### Unit Tests (17 tests)

```
✓ createShipment - basic
✓ createShipment - optional carrier_name
✓ createShipment - optional scheduled_date
✓ updateShipmentStatus - IN_TRANSIT
✓ updateShipmentStatus - include tracking_number
✓ updateShipmentStatus - URL encoding
✓ updateShipmentStatus - DELIVERED
✓ updateShipmentStatus - CANCELLED
✓ getShipment - basic
✓ getShipment - URL encoding
✓ getShipmentsByOrder - basic
✓ getShipmentsByOrder - URL encoding
✓ getShipmentsByOrder - empty results
✓ getShipmentsByOrder - multiple shipments
```

## Componente: OrderShipmentsComponent

### Inputs

```typescript
@Input() orderId: string;           // Required: orden ID
@Input() orderStatus?: string;      // Optional: estado actual de la orden
```

### Outputs

```typescript
@Output() shipmentCreated = new EventEmitter<Shipment>();    // Al crear envío
@Output() shipmentUpdated = new EventEmitter<Shipment>();    // Al actualizar envío
```

### Template Sections

#### 1. Header

- Título "Envíos"
- Subtítulo informativo

#### 2. Tabla Histórico de Envíos

Columnas:

- **Método**: MOTORBIKE, COURIER_OLVA, etc.
- **Transportista**: Nombre de la compañía
- **N° Seguimiento**: Código en monospace
- **Destinatario**: Nombre
- **Teléfono**: Formato código
- **Dirección Destino**: Dirección completa
- **Estado**: Chip color (pendiente=amarillo, en_ruta=pink, entregado=azul, cancelado=gris)
- **Fecha Programada**: Formatted date
- **Enviado**: Fecha envío
- **Entregado**: Fecha entrega (verde)
- **Acciones**: Menu con transiciones de estado

Empty State: "No hay envíos registrados" con icono

#### 3. Formulario Crear Nuevo Envío

Campos:

- **Método** (required): Select con todos los métodos
- **Transportista** (conditional): Required si method ∈ {COURIER_OLVA, COURIER_SHALOM, COURIER_OTHER}
- **N° Seguimiento**: Optional, pero recomendado
- **Dirección Destino** (conditional): Required si method ≠ PICKUP_STORE
- **Nombre Destinatario** (required): Input text
- **Teléfono Destinatario** (required): Input tel, validación regex dígitos
- **Fecha Programada**: Date input (default today)

Validaciones:

- Método es obligatorio
- Transportista requerido solo para courier/motorizado
- Dirección requerida para métodos que implican envío
- Teléfono: 7-15 dígitos, solo números
- Nombre: requerido

Submit:

- Botón "Registrar Envío" disabled mientras se procesa

### Lógica Componente

#### Lifecycle

```typescript
ngOnInit() {
  // Validar orderId
  // Cargar envíos via ShipmentsService.getShipmentsByOrder()
  // Suscribirse a cambios de shipping_method para validación condicional
}

ngOnDestroy() {
  // Cleanup: next() y complete() en destroy$
  // takeUntil(destroy$) en todas las suscripciones
}
```

#### Form Management

```typescript
shipmentForm: FormGroup = this.fb.group({
  shipping_method: ["", Validators.required],
  carrier_name: [""],
  tracking_number: [""],
  destination_address: [""],
  recipient_name: ["", Validators.required],
  recipient_phone: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern(/^\d+$/)]],
  scheduled_date: [today],
});

// updateConditionalValidators basado en shipping_method
```

#### Shipment Creation Flow

```typescript
onSubmitShipment() {
  if (shipmentForm.invalid) {
    notificationService.warning('Por favor completa todos los campos');
    return;
  }

  creatingShipment = true;
  const payload: ShipmentCreate = {...};

  shipmentsService.createShipment(payload)
    .pipe(takeUntil(destroy$))
    .subscribe({
      next: (shipment) => {
        shipments.push(shipment);
        shipmentForm.reset();
        notificationService.success('Envío registrado exitosamente');
        shipmentCreated.emit(shipment);
      },
      error: () => {
        notificationService.error('Error al crear el envío');
      },
      complete: () => { creatingShipment = false; }
    });
}
```

#### Status Transition Flow

```typescript
updateStatus(shipment: Shipment, newStatus: ShipmentStatus) {
  if (!isStatusTransitionValid(shipment.status, newStatus)) {
    notificationService.warning('Transición de estado no permitida');
    return;
  }

  if (!confirm('¿Actualizar estado del envío?')) return;

  updatingShipment = true;
  shipmentsService.updateShipmentStatus(shipment.id, { status: newStatus })
    .pipe(takeUntil(destroy$))
    .subscribe({
      next: (updated) => {
        updatePaymentInList(updated);
        notificationService.success(`Envío marcado como ${getLabel(newStatus)}`);
        shipmentUpdated.emit(updated);
      },
      error: () => {
        notificationService.error('Error al actualizar el envío');
      },
      complete: () => { updatingShipment = false; }
    });
}
```

#### Valid Transitions

```
PENDING → IN_TRANSIT, CANCELLED
IN_TRANSIT → DELIVERED, CANCELLED
DELIVERED → (ninguna)
CANCELLED → (ninguna)
```

### Loading States

- **loading**: boolean - Mostrado al cargar envíos
- **creatingShipment**: boolean - Botón submit disabled
- **updatingShipment**: boolean - Botones acción disabled

UI Component: LoadingSpinnerComponent con mensaje contextual

## Integración en OrderDetailComponent

### Cambios TypeScript

```typescript
// Import
import { OrderShipmentsComponent } from "./order-shipments/order-shipments.component";

// En @Component.imports[]
imports: [
  // ... otros imports
  OrderShipmentsComponent,
];
```

### Cambios Template

```html
<!-- Entre Pagos y Acciones -->
<mat-card class="shipments-section">
  <mat-card-content class="shipments-content">
    <app-order-shipments [orderId]="order.id" [orderStatus]="order.status"></app-order-shipments>
  </mat-card-content>
</mat-card>
```

### Cambios Estilos

```scss
.shipments-section {
  mat-card-content {
    padding: 0;
  }

  .shipments-content {
    padding: 24px;
  }
}
```

## Responsive Design

### Desktop (768px+)

- Tabla: Todas las columnas visibles
- Formulario: 1-2 campos por fila según espacio
- Menu de transiciones: Horizontal

### Mobile (<768px)

- Tabla: Font smaller, padding reducido, address truncated
- Formulario: 1 campo por fila, botón full-width
- Menu de transiciones: Vertical

## Unit Tests

### shipments.service.spec.ts (17 tests)

```
✓ createShipment POST request
✓ createShipment optional carrier_name
✓ createShipment optional scheduled_date
✓ updateShipmentStatus PATCH request
✓ updateShipmentStatus include tracking_number
✓ updateShipmentStatus URL encoding
✓ updateShipmentStatus DELIVERED state
✓ updateShipmentStatus CANCELLED state
✓ getShipment GET by ID
✓ getShipment URL encoding
✓ getShipmentsByOrder GET with query param
✓ getShipmentsByOrder URL encoding
✓ getShipmentsByOrder empty results
✓ getShipmentsByOrder multiple results
```

### order-shipments.component.spec.ts (26 tests)

**Initialization (3 tests)**

- Component creation
- Load shipments on init
- Form default values

**Form Validation (9 tests)**

- shipping_method required
- recipient_name required
- recipient_phone required
- recipient_phone minimum length
- recipient_phone digits only
- destination_address required for MOTORBIKE
- destination_address NOT required for PICKUP_STORE
- carrier_name required for COURIER_OLVA
- carrier_name NOT required for PICKUP_STORE

**Shipment Creation (4 tests)**

- Create valid shipment
- Prevent invalid submission
- Reset form after success
- Emit shipmentCreated event

**Status Transitions (6 tests)**

- Transition PENDING→IN_TRANSIT
- Transition IN_TRANSIT→DELIVERED
- Cancel PENDING shipment
- Prevent invalid transitions
- Emit shipmentUpdated event
- Handle update error

**Helper Methods (2 tests)**

- Get labels and colors
- Check requirement conditionals

**Cleanup (1 test)**

- Unsubscribe on destroy

**Error Handling (1 test)**

- Handle load error

## Checklist de Ejecución

- [x] shipment.model.ts creado con tipos completos
- [x] shipments.service.ts implementado con 4 métodos
- [x] shipments.service.spec.ts con 17 tests (✅ all passing)
- [x] order-shipments.component.ts implementado (~350 lines)
- [x] order-shipments.component.html creado (~250 lines)
- [x] order-shipments.component.scss creado (~180 lines)
- [x] order-shipments.component.spec.ts con 26 tests (✅ all passing)
- [x] OrderDetailComponent actualizado (imports + template)
- [x] Integración visual validada
- [x] Responsive design verificado

## Ejecución de Tests

```bash
# Tests de servicio
ng test --include='**/shipments.service.spec.ts'

# Tests de componente
ng test --include='**/order-shipments.component.spec.ts'

# Todos los tests FASE 4
ng test --include='**/shipments.service.spec.ts' --include='**/order-shipments.component.spec.ts'

# Resultado esperado: 43/43 tests passing ✅
```

## Rutas Accesibles

- `/pedidos` - Lista de órdenes
- `/pedidos/:id` - Detalle de orden (con sección de envíos integrada)
- No hay ruta separada para envíos, solo componente embebido

## Dependencias Externas

### Angular Material

- MatCard, MatButton, MatIcon, MatTable, MatChip, MatSelect, MatFormField
- MatMenu, MatProgressSpinner, MatTooltip, MatDivider, MatInput

### RxJS

- Observable, Subject, takeUntil

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

1. **Transiciones de Estado**: Validadas en cliente y backend
2. **Validación Condicional**: Basada en shipping_method elegido
3. **Sincronización de Estado**: No hay polling, los envíos se actualizan en memoria
4. **Confirmación**: Dialogs window.confirm() para cambios importantes
5. **Destino**: PICKUP_STORE es tipo especial, otros requieren dirección

## Próximas Fases

- **FASE 5**: Auditoría y manejo de concurrencia
- Integración con tracking en tiempo real
- Notificaciones al cliente sobre estado de envío
- Reportes de envíos

## Referencias

- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [Angular Material](https://material.angular.io/)
- [RxJS Patterns](https://rxjs.dev/)
- [HTTP Client](https://angular.io/guide/http)
