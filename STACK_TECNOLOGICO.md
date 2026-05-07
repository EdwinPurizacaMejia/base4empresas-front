# 📚 Stack Tecnológico - Base4Empresas

## 🎯 Resumen Ejecutivo

**Base4Empresas** es una aplicación web empresarial de gestión de inventario construida con tecnologías modernas y escalables, enfocada en proporcionar una experiencia de usuario profesional tipo SaaS.

---

## 🏗️ Arquitectura General

- **Tipo de Aplicación**: Single Page Application (SPA) con Server-Side Rendering (SSR)
- **Patrón de Arquitectura**: Component-Based Architecture
- **Estilo de Código**: TypeScript Strict Mode
- **Paradigma**: Programación Reactiva (RxJS)

---

## 🚀 Frontend Framework

### Angular 17.3.0

**Versión**: `^17.3.0` (Latest Stable)

#### Módulos Core de Angular

| Módulo                              | Versión | Propósito                               |
| ----------------------------------- | ------- | --------------------------------------- |
| `@angular/core`                     | 17.3.0  | Framework principal                     |
| `@angular/common`                   | 17.3.0  | Directivas y pipes comunes              |
| `@angular/compiler`                 | 17.3.0  | Compilador de templates                 |
| `@angular/platform-browser`         | 17.3.0  | Soporte para navegadores                |
| `@angular/platform-browser-dynamic` | 17.3.0  | Compilación JIT                         |
| `@angular/router`                   | 17.3.0  | Sistema de routing                      |
| `@angular/forms`                    | 17.3.0  | Formularios reactivos y template-driven |
| `@angular/animations`               | 17.3.0  | Sistema de animaciones                  |

#### Características de Angular 17

- ✅ **Standalone Components**: Arquitectura moderna sin NgModules
- ✅ **Signals**: Sistema de reactividad mejorado
- ✅ **Control Flow Syntax**: `@if`, `@for`, `@switch` (nueva sintaxis)
- ✅ **Deferred Loading**: `@defer` para lazy loading
- ✅ **Built-in Control Flow**: Mejoras en rendimiento
- ✅ **SSR Hydration**: Server-Side Rendering optimizado
- ✅ **Improved DevEx**: Mejor experiencia de desarrollo

---

## 🎨 UI Framework & Components

### Angular Material 17.3.10

**Versión**: `^17.3.10`

#### Component Development Kit (CDK)

**Versión**: `^17.3.10`

El proyecto utiliza Angular Material como biblioteca principal de componentes UI, que incluye:

#### Componentes Implementados

- **Layout Components**:
  - Sidebar Navigation
  - Toolbar/AppBar
  - Content Area
- **Data Components**:
  - Tables (MatTable)
  - Forms (MatFormField, MatInput)
  - Dialogs (MatDialog)
  - Cards (MatCard)
- **Navigation Components**:
  - Menu (MatMenu)
  - Tabs (MatTabs)
  - Stepper (MatStepper)
- **Form Controls**:
  - Input Fields
  - Select Dropdowns
  - Datepickers
  - Checkboxes
  - Radio Buttons
- **Feedback Components**:
  - Snackbars (Notifications)
  - Progress Indicators
  - Dialogs de Confirmación

#### Características de Material Design

- ✅ Diseño responsive
- ✅ Accesibilidad (A11y)
- ✅ Tematización personalizable
- ✅ Animaciones fluidas
- ✅ RTL Support
- ✅ Mobile-first approach

---

## 📊 Data Visualization

### Chart.js 4.5.1

**Librería**: `chart.js` v4.5.1  
**Wrapper Angular**: `ng2-charts` v4.1.1

#### Tipos de Gráficos Disponibles

- Line Charts (Gráficos de línea)
- Bar Charts (Gráficos de barras)
- Pie Charts (Gráficos circulares)
- Doughnut Charts
- Radar Charts
- Polar Area Charts

#### Uso en el Proyecto

- Dashboard de métricas
- Reportes de ventas
- Análisis de inventario
- Visualización de kardex
- KPIs empresariales

---

## 💻 Lenguaje de Programación

### TypeScript 5.4.2

**Versión**: `~5.4.2`

#### Configuración TypeScript

```json
{
  "target": "ES2022",
  "module": "ES2022",
  "strict": true,
  "strictTemplates": true,
  "experimentalDecorators": true
}
```

#### Características Habilitadas

- ✅ **Strict Mode**: Máxima seguridad de tipos
- ✅ **ES2022 Target**: Características modernas de JavaScript
- ✅ **Decorators**: Para componentes y servicios Angular
- ✅ **No Implicit Any**: Tipado explícito obligatorio
- ✅ **Strict Null Checks**: Verificación de nulos
- ✅ **No Implicit Returns**: Control de flujo estricto
- ✅ **No Fallthrough Cases**: Switch statements seguros

---

## 🔄 Programación Reactiva

### RxJS 7.8.0

**Versión**: `~7.8.0`

#### Operadores Principales Utilizados

- **Creación**: `of`, `from`, `interval`
- **Transformación**: `map`, `switchMap`, `mergeMap`, `concatMap`
- **Filtrado**: `filter`, `debounceTime`, `distinctUntilChanged`
- **Combinación**: `combineLatest`, `forkJoin`, `merge`
- **Manejo de Errores**: `catchError`, `retry`
- **Utilidades**: `tap`, `take`, `takeUntil`

#### Patrones Implementados

- Observable Subscriptions
- Subject para eventos
- BehaviorSubject para estado
- Async Pipe en templates
- Unsubscribe automatico con `takeUntil`

---

## 🌐 Server-Side Rendering (SSR)

### Angular SSR 17.3.17

**Versión**: `^17.3.17`

#### Configuración SSR

- **Server Entry**: `src/main.server.ts`
- **Server Runtime**: Express.js 4.18.2
- **Build Output**: `dist/base4empresas/server/`

#### Beneficios

- ✅ Mejor SEO
- ✅ Rendimiento inicial mejorado
- ✅ Compatible con bots/crawlers
- ✅ Pre-rendering de contenido
- ✅ Hydration automática

#### Express Server

**Versión**: `^4.18.2`

El servidor Express maneja:

- Serving de archivos estáticos
- Universal rendering
- API proxy (si aplica)
- Configuración de headers

---

## 🛠️ Build Tools & Development

### Angular CLI 17.3.17

**Versión**: `^17.3.17`

#### Build System

- **Builder**: `@angular-devkit/build-angular:application`
- **Bundler**: esbuild (Angular 17 default)
- **Optimization**: Tree-shaking, minification, code-splitting

#### Scripts de Desarrollo

```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

#### Configuraciones

##### Development

- Source Maps habilitados
- Sin optimización
- Hot Module Replacement
- Base href: `/`

##### Production

- Optimización completa
- Output hashing
- Budget limits
- Base href: `/base4empresas-front/`
- File replacements para environments

#### Build Budgets

```json
{
  "initial": {
    "maximumWarning": "500kb",
    "maximumError": "1.2mb"
  },
  "anyComponentStyle": {
    "maximumWarning": "12kb",
    "maximumError": "14kb"
  }
}
```

---

## 🧪 Testing

### Testing Framework

#### Jasmine 5.1.0

**Versión**: `~5.1.0`

Framework de testing comportamental (BDD) para:

- Unit tests
- Component tests
- Service tests
- Integration tests

#### Karma 6.4.0

**Versión**: `~6.4.0`

Test runner para ejecutar tests en navegadores reales.

#### Plugins de Karma

- `karma-chrome-launcher` ~3.2.0
- `karma-coverage` ~2.2.0
- `karma-jasmine` ~5.1.0
- `karma-jasmine-html-reporter` ~2.1.0

#### Tipos de Tests

- **Unit Tests**: Componentes individuales
- **Service Tests**: Lógica de negocio
- **Integration Tests**: Interacción entre componentes
- **Coverage Reports**: Informes de cobertura

---

## 🎨 Estilos & CSS

### Sistema de Estilos

#### CSS/SCSS

- **Archivo Principal**: `src/styles.css`
- **Component Styles**: Encapsulados por componente
- **ViewEncapsulation**: Emulated (default)

#### Características de Estilos

- ✅ Estilos globales
- ✅ Estilos por componente
- ✅ CSS Variables (Custom Properties)
- ✅ Material Theme customization
- ✅ Responsive Design
- ✅ Design Tokens

#### Sistema de Diseño Implementado

El proyecto incluye guías de diseño profesional:

- Tokens de diseño (colores, espaciados, tipografía)
- Mixins reutilizables
- Sistema de componentes
- Layout profesional SaaS
- Paleta de colores corporativa

---

## 📁 Estructura del Proyecto

### Arquitectura de Carpetas

```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── confirmation-dialog/
│   │   ├── generic-data-table/
│   │   ├── kardex/
│   │   ├── product-detail/
│   │   ├── product-form/
│   │   ├── products-list/
│   │   ├── purchase-detail/
│   │   ├── purchase-form/
│   │   ├── purchase-list/
│   │   ├── sale-detail/
│   │   ├── sale-form/
│   │   ├── sale-list/
│   │   ├── shared/           # Componentes compartidos
│   │   ├── stock-detail/
│   │   └── stock-list/
│   │
│   ├── layout/              # Estructura de layout
│   │   ├── layout.component
│   │   ├── shell.component
│   │   ├── sidebar.component
│   │   └── toolbar.component
│   │
│   ├── pages/               # Páginas/Vistas
│   │   └── dashboard/
│   │
│   ├── services/            # Servicios de negocio
│   │   ├── confirmation.service
│   │   ├── kardex.service
│   │   ├── notification.service
│   │   ├── products.service
│   │   ├── purchase.service
│   │   ├── sales.service
│   │   └── stock.service
│   │
│   ├── models/              # Modelos de datos
│   │   ├── kardex.model
│   │   ├── product.model
│   │   ├── purchase.model
│   │   ├── sale.model
│   │   └── stock.model
│   │
│   ├── app.component        # Componente raíz
│   ├── app.config           # Configuración de la app
│   └── app.routes           # Configuración de rutas
│
├── environments/            # Variables de entorno
│   ├── environment.ts
│   └── environment.development.ts
│
├── assets/                  # Recursos estáticos
├── styles.css              # Estilos globales
├── index.html              # HTML principal
├── main.ts                 # Bootstrap de la aplicación
└── main.server.ts          # Entry point del servidor
```

### Patrones de Arquitectura

#### Smart & Dumb Components

- **Smart Components**: Contienen lógica de negocio
- **Dumb Components**: Solo presentación

#### Services Pattern

- Servicios singleton inyectables
- Separación de responsabilidades
- Comunicación con API

#### Reactive Forms

- FormBuilder para construcción
- Validadores síncronos y asíncronos
- Control de estado del formulario

---

## 🔌 Módulos del Sistema

### Módulos Funcionales

#### 1. Gestión de Productos

- Listado de productos
- Formulario de creación/edición
- Vista de detalle
- CRUD completo

#### 2. Gestión de Compras

- Listado de compras
- Registro de nuevas compras
- Detalle de compra
- Tracking de proveedores

#### 3. Gestión de Ventas

- Listado de ventas
- Registro de ventas
- Detalle de venta
- Reportes de ventas

#### 4. Control de Stock

- Listado de inventario
- Detalle de stock
- Alertas de stock mínimo
- Historial de movimientos

#### 5. Kardex

- Registro de movimientos
- Balance de inventario
- Trazabilidad
- Reportes

#### 6. Dashboard

- Métricas principales
- Gráficos de desempeño
- KPIs empresariales
- Resúmenes ejecutivos

---

## 🛡️ Servicios del Sistema

### Core Services

#### NotificationService

- Manejo de notificaciones toast
- Estados: success, error, warning, info
- Duración configurable
- Posicionamiento personalizable

#### ConfirmationService

- Diálogos de confirmación
- Operaciones destructivas
- Custom messages
- Action callbacks

#### Data Services

1. **ProductsService**: CRUD de productos
2. **PurchaseService**: Gestión de compras
3. **SalesService**: Gestión de ventas
4. **StockService**: Control de inventario
5. **KardexService**: Movimientos y trazabilidad

---

## 🌍 Internacionalización (i18n)

### Configuración

- **Legacy Message ID Format**: Disabled
- **Extraction**: `ng extract-i18n`
- **Soporte**: Preparado para múltiples idiomas

---

## 📦 Dependencias Completas

### Dependencies (Production)

```json
{
  "@angular/animations": "^17.3.0",
  "@angular/cdk": "^17.3.10",
  "@angular/common": "^17.3.0",
  "@angular/compiler": "^17.3.0",
  "@angular/core": "^17.3.0",
  "@angular/forms": "^17.3.0",
  "@angular/material": "^17.3.10",
  "@angular/platform-browser": "^17.3.0",
  "@angular/platform-browser-dynamic": "^17.3.0",
  "@angular/platform-server": "^17.3.0",
  "@angular/router": "^17.3.0",
  "@angular/ssr": "^17.3.17",
  "chart.js": "^4.5.1",
  "express": "^4.18.2",
  "ng2-charts": "^4.1.1",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0",
  "zone.js": "~0.14.3"
}
```

### DevDependencies (Development)

```json
{
  "@angular-devkit/build-angular": "^17.3.17",
  "@angular/cli": "^17.3.17",
  "@angular/compiler-cli": "^17.3.0",
  "@types/express": "^4.17.17",
  "@types/jasmine": "~5.1.0",
  "@types/node": "^18.18.0",
  "jasmine-core": "~5.1.0",
  "karma": "~6.4.0",
  "karma-chrome-launcher": "~3.2.0",
  "karma-coverage": "~2.2.0",
  "karma-jasmine": "~5.1.0",
  "karma-jasmine-html-reporter": "~2.1.0",
  "typescript": "~5.4.2"
}
```

---

## 🔐 Configuración de Entornos

### Variables de Entorno

#### Development Environment

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  enableDebug: true,
};
```

#### Production Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: "https://api.production.com",
  enableDebug: false,
};
```

### File Replacements

Angular CLI reemplaza automáticamente los archivos de entorno según la configuración de build.

---

## 🚀 Despliegue

### Build para Producción

```bash
npm run build
```

**Output**: `dist/base4empresas/`

### Configuración de Producción

- **Base Href**: `/base4empresas-front/`
- **Output Hashing**: Habilitado
- **Source Maps**: Deshabilitados
- **Minification**: Completa
- **Tree Shaking**: Automático
- **Code Splitting**: Optimizado

### SSR Deployment

```bash
npm run serve:ssr:base4empresas
```

Ejecuta el servidor Express con Angular Universal.

---

## 📊 Métricas y Rendimiento

### Bundle Size Limits

| Type             | Warning | Error  |
| ---------------- | ------- | ------ |
| Initial Bundle   | 500 KB  | 1.2 MB |
| Component Styles | 12 KB   | 14 KB  |

### Performance Features

- ✅ Lazy Loading de módulos
- ✅ OnPush Change Detection
- ✅ TrackBy en ngFor
- ✅ Virtual Scrolling (CDK)
- ✅ Code Splitting automático
- ✅ Tree Shaking
- ✅ AOT Compilation
- ✅ SSR para primera carga

---

## 🔧 Herramientas de Desarrollo

### IDE Recomendado

- **Visual Studio Code**
- **Extensiones recomendadas**:
  - Angular Language Service
  - ESLint
  - Prettier
  - Angular Snippets
  - GitLens

### CLI Tools Disponibles

- `ng generate component`: Crear componentes
- `ng generate service`: Crear servicios
- `ng generate module`: Crear módulos
- `ng build`: Compilar proyecto
- `ng serve`: Servidor de desarrollo
- `ng test`: Ejecutar tests
- `ng lint`: Análisis de código

---

## 📝 Estándares de Código

### TypeScript

- Strict mode habilitado
- No implicit any
- Explicit return types
- Interface over type (cuando sea posible)

### Angular

- Standalone components
- OnPush change detection por defecto
- Reactive forms sobre template-driven
- Services para lógica de negocio
- Unsubscribe en ngOnDestroy

### Naming Conventions

- **Components**: `product-list.component.ts`
- **Services**: `products.service.ts`
- **Models**: `product.model.ts`
- **Interfaces**: `IProduct`
- **Classes**: `PascalCase`
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

---

## 🔄 Gestión de Estado

### Patrón Utilizado

- **Services con BehaviorSubject**: Estado reactivo
- **Observables**: Comunicación asíncrona
- **Async Pipe**: Subscripciones automáticas

### Sin State Management Library

El proyecto actualmente **no utiliza** NgRx, Akita o NgXs. El estado se maneja a través de servicios con RxJS.

---

## 🌐 Integración con Backend

### API Communication

- **HTTP Client**: `@angular/common/http`
- **Interceptors**: Preparado para autenticación/logging
- **Error Handling**: Centralizado en servicios
- **Response Models**: Tipado fuerte con interfaces

### Endpoints Esperados

- `GET /api/products`: Listar productos
- `POST /api/products`: Crear producto
- `PUT /api/products/:id`: Actualizar producto
- `DELETE /api/products/:id`: Eliminar producto
- Similar para: purchases, sales, stock, kardex

---

## 📱 Responsive Design

### Breakpoints

```scss
$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;
```

### Mobile-First Approach

- Layout adaptable
- Sidebar colapsable en móvil
- Tablas responsive
- Touch-friendly interactions

---

## ♿ Accesibilidad

### WCAG 2.1 Compliance

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast
- ✅ Screen reader support

### Angular Material A11y

Material components incluyen accesibilidad por defecto.

---

## 🔒 Seguridad

### Best Practices

- ✅ Sanitización de inputs (Angular DomSanitizer)
- ✅ CSRF protection preparado
- ✅ XSS prevention automático
- ✅ TypeScript strict mode
- ✅ Dependencies actualizadas
- ✅ No eval() o innerHTML directo

---

## 📚 Documentación del Proyecto

### Archivos de Documentación

- `README.md`: Introducción general
- `INICIO_RAPIDO.md`: Guía de inicio rápido
- `CONTRIBUTING.md`: Guía de contribución
- `LAYOUT_GUIDE.md`: Guía de layout
- `TABLA_MATERIAL_GUIDE.md`: Guía de tablas
- `PATRONES_COMUNES.md`: Patrones de código
- `FORMULARIOS_MEJORADOS.md`: Guía de formularios
- `GUIA_NOTIFICACIONES_ESTADOS.md`: Sistema de notificaciones
- `NAVEGACION_DETALLE.md`: Navegación entre vistas
- `GUIA_DISENO_SAAS_PROFESIONAL.md`: Sistema de diseño
- `STACK_TECNOLOGICO.md`: Este documento

---

## 🎯 Roadmap Tecnológico

### Posibles Mejoras Futuras

#### Estado y Gestión

- [ ] Implementar NgRx para estado global
- [ ] Agregar signals de Angular 17
- [ ] State management patterns avanzados

#### Performance

- [ ] Service Workers (PWA)
- [ ] Implement lazy loading strategies
- [ ] Image optimization
- [ ] Bundle size optimization

#### Testing

- [ ] Aumentar cobertura de tests
- [ ] E2E tests con Playwright/Cypress
- [ ] Visual regression testing

#### DevOps

- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Monitoring y logging

#### Features

- [ ] Internacionalización completa (i18n)
- [ ] Dark mode
- [ ] Offline support
- [ ] Real-time updates (WebSockets)

---

## 📞 Soporte y Recursos

### Documentación Oficial

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

### Community

- [Angular GitHub](https://github.com/angular/angular)
- [Angular Blog](https://blog.angular.io/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/angular)

---

## ✅ Checklist de Tecnologías

### Core Stack

- ✅ Angular 17.3.0
- ✅ TypeScript 5.4.2
- ✅ RxJS 7.8.0
- ✅ Angular Material 17.3.10
- ✅ Chart.js 4.5.1

### Build & Dev Tools

- ✅ Angular CLI 17.3.17
- ✅ esbuild bundler
- ✅ TypeScript compiler

### Testing

- ✅ Jasmine 5.1.0
- ✅ Karma 6.4.0

### Server-Side

- ✅ Angular SSR 17.3.17
- ✅ Express.js 4.18.2

### UI/UX

- ✅ Material Design
- ✅ Responsive Design
- ✅ Accessibility (A11y)

---

## 📄 Licencia

Ver archivo `LICENSE` en el repositorio.

---

## 👥 Contribuidores

Para contribuir al proyecto, consultar `CONTRIBUTING.md`.

---

**Última actualización**: Enero 2026  
**Versión del documento**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo Base4Empresas
