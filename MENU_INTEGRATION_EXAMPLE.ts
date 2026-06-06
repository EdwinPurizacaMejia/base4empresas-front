/**
 * EJEMPLO PRÁCTICO: Actualizar layout existente con nuevo MainMenuComponent
 * 
 * Este archivo muestra exactamente cómo integrar el nuevo menú jerárquico
 * en el layout existente de base4empresas
 */

// ============================================================================
// PASO 1: Actualizar layout.component.ts
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from './toolbar.component';
import { SidebarComponent } from './sidebar.component';
import { MainMenuComponent } from './main-menu.component'; // ← NUEVO IMPORT
import { ShellComponent } from './shell.component';

/**
 * Componente layout principal que une:
 * - Toolbar (superior)
 * - MainMenu (menú jerárquico horizontal + submenús)
 * - Content area con router-outlet
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToolbarComponent,
    MainMenuComponent, // ← AGREGAR AL IMPORTS
    SidebarComponent,
    ShellComponent,
  ],
  template: `
    <div class="app-layout">
      <!-- Toolbar: Logo, search, user menu -->
      <app-toolbar></app-toolbar>

      <!-- NUEVO: Menú jerárquico (Nivel 1 + Nivel 2 dinámico) -->
      <app-main-menu></app-main-menu>

      <div class="layout-container">
        <!-- Sidebar: Navegación auxiliar (opcional, puede mantenerse) -->
        <aside class="sidebar" *ngIf="false">
          <!-- Opcionalmente mantener sidebar para collapsing -->
          <app-sidebar></app-sidebar>
        </aside>

        <!-- Main content: Router outlet -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: `
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f9fafb;
    }

    .layout-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 200px;
      background-color: #f3f4f6;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }

      .main-content {
        padding: 1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {
  ngOnInit(): void {
    console.log('Layout initialized with new MainMenuComponent');
  }
}

// ============================================================================
// PASO 2: Actualizar app.routes.ts
// ============================================================================

/*
Cambiar de:

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'productos', component: ProductsListComponent },
  { path: 'compras', component: PurchaseListComponent },
  { path: 'ventas', component: SaleListComponent },
  { path: 'inventario', component: StockListComponent },
  { path: 'kardex', component: KardexComponent },
  ...
];

A:
*/

import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

// Catálogos (FASE 1)
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CustomersListComponent } from './components/customers-list/customers-list.component';
import { SuppliersListComponent } from './components/suppliers-list/suppliers-list.component';
import { SalesChannelsListComponent } from './components/sales-channels/sales-channels-list.component';

// Ventas (FASE 2-3)
import { OrdersListComponent } from './components/orders/orders-list.component';
import { OrderCreateComponent } from './components/orders/order-create.component';
import { OrderDetailComponent } from './components/orders/order-detail.component';

// Inventario (FASE 2-4)
import { StockListComponent } from './components/stock-list/stock-list.component';
import { KardexComponent } from './components/kardex/kardex.component';

// Logística (FASE 4)
import { ShipmentsListComponent } from './components/shipments/shipments-list.component';
import { ShipmentDetailComponent } from './components/shipments/shipment-detail.component';

// Configuración (FASE 5)
import { AuditHistoryComponent } from './components/security/audit-history/audit-history.component';
import { SecuritySettingsComponent } from './components/security/security-settings/security-settings.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { PurchaseDetailComponent } from './components/purchase-detail/purchase-detail.component';
import { SaleListComponent } from './components/sale-list/sale-list.component';
import { SaleDetailComponent } from './components/sale-detail/sale-detail.component';
import { CostingConfigComponent } from './components/costing-config/costing-config.component';

/**
 * ESTRUCTURA DE RUTAS POR DOMINIO
 * ================================
 * /dashboard                              Dashboard principal
 * /catalogos/*                            Catálogos y maestros (FASE 1)
 * /ventas/*                               Órdenes y pagos (FASE 2-3)
 * /inventario/*                           Stock y movimientos (FASE 2-4)
 * /logistica/*                            Envíos y logística (FASE 4)
 * /compras/*                              Órdenes de compra
 * /config/*                               Auditoría, seguridad, configuración (FASE 5)
 */
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Redirect raíz a dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // ========== DASHBOARD ==========
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },

      // ========== CATÁLOGOS (FASE 1) ==========
      {
        path: 'catalogos',
        children: [
          {
            path: 'productos',
            component: ProductsListComponent,
            data: { title: 'Productos' },
          },
          {
            path: 'productos/:id',
            component: ProductDetailComponent,
            data: { title: 'Detalle de Producto' },
          },
          {
            path: 'clientes',
            component: CustomersListComponent,
            data: { title: 'Clientes' },
          },
          {
            path: 'proveedores',
            component: SuppliersListComponent,
            data: { title: 'Proveedores' },
          },
          {
            path: 'canales-venta',
            component: SalesChannelsListComponent,
            data: { title: 'Canales de Venta' },
          },
        ],
      },

      // ========== VENTAS (FASE 2-3) ==========
      {
        path: 'ventas',
        children: [
          {
            path: 'pedidos',
            component: OrdersListComponent,
            data: { title: 'Órdenes' },
          },
          {
            path: 'pedidos/crear',
            component: OrderCreateComponent,
            data: { title: 'Crear Orden' },
          },
          {
            path: 'pedidos/:id',
            component: OrderDetailComponent,
            data: { title: 'Detalle de Orden' },
          },
          // Pagos: Placeholder por ahora
          // { path: 'pagos', component: PaymentsListComponent },
        ],
      },

      // ========== INVENTARIO (FASE 2-4) ==========
      {
        path: 'inventario',
        children: [
          {
            path: 'stock',
            component: StockListComponent,
            data: { title: 'Stock Actual' },
          },
          {
            path: 'kardex',
            component: KardexComponent,
            data: { title: 'Kardex' },
          },
          // Ajustes: Placeholder por ahora
          // { path: 'ajustes', component: StockAdjustmentsComponent },
          // Transferencias: Placeholder por ahora
          // { path: 'transferencias', component: TransfersComponent },
        ],
      },

      // ========== LOGÍSTICA (FASE 4) ==========
      {
        path: 'logistica',
        children: [
          {
            path: 'envios',
            component: ShipmentsListComponent,
            data: { title: 'Envíos' },
          },
          {
            path: 'envios/:id',
            component: ShipmentDetailComponent,
            data: { title: 'Detalle de Envío' },
          },
        ],
      },

      // ========== COMPRAS ==========
      {
        path: 'compras',
        children: [
          {
            path: 'ordenes',
            component: PurchaseListComponent,
            data: { title: 'Órdenes de Compra' },
          },
          {
            path: 'ordenes/:id',
            component: PurchaseDetailComponent,
            data: { title: 'Detalle de Compra' },
          },
        ],
      },

      // ========== CONFIGURACIÓN (FASE 5) ==========
      {
        path: 'config',
        children: [
          {
            path: 'auditoria',
            component: AuditHistoryComponent,
            data: { title: 'Auditoría' },
          },
          {
            path: 'seguridad',
            component: SecuritySettingsComponent,
            data: { title: 'Seguridad' },
          },
          {
            path: 'costeo',
            component: CostingConfigComponent,
            data: { title: 'Configuración de Costeo' },
          },
        ],
      },

      // Legacy routes (mantenerlas por compatibilidad)
      {
        path: 'pedidos',
        redirectTo: 'ventas/pedidos',
        pathMatch: 'full',
      },
      {
        path: 'productos',
        redirectTo: 'catalogos/productos',
        pathMatch: 'full',
      },
      {
        path: 'compras',
        redirectTo: 'compras/ordenes',
        pathMatch: 'full',
      },
    ],
  },
];

// ============================================================================
// PASO 3: Crear componentes placeholder si no existen
// ============================================================================

/*
Los siguientes componentes se necesitan crear para las nuevas rutas:

AuditHistoryComponent:
- Mostrar tabla con logs de auditoría (de backend GET /audit-logs)
- Filtros por entity_type, action, severity, fecha
- Ya existe la clase model en FASE 5

SecuritySettingsComponent:
- Formulario para gestión de roles y permisos
- Configuración de 2FA
- Placeholder OK por ahora, implementar en FASE 6

ShipmentsListComponent y ShipmentDetailComponent:
- Ya existen, solo necesitan ruta

StockAdjustmentsComponent:
- Formulario para registrar ajustes de stock
- Integración con inventory_service.update_balance()

TransfersComponent:
- Formulario para transferencias entre almacenes
- Integración con warehouse_service

*/

// ============================================================================
// PASO 4: Actualizar sidebar.component.ts (opcional, puede simplificarse)
// ============================================================================

/*
Como el menú principal ahora maneja la navegación principal,
el sidebar puede eliminarse o usarse para:
- Favoritos del usuario
- Acciones rápidas
- Notificaciones
- Info del usuario

*/

// ============================================================================
// RESULTADO FINAL
// ============================================================================

/*
Estructura DOM después de integración:

<div class="app-layout">
  <!-- TOOLBAR (Logo, search, user) -->
  <app-toolbar></app-toolbar>

  <!-- NUEVO: MENÚ JERÁRQUICO -->
  <app-main-menu>
    <nav class="main-menu">
      <a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a>
      <a (click)="selectMenuItem(catalogos)">📚 Catálogos</a>
      <a (click)="selectMenuItem(ventas)">💰 Ventas</a>
      ...
    </nav>
    
    <nav class="sub-menu" *ngIf="activeParent">
      <a routerLink="/catalogos/productos">📦 Productos</a>
      <a routerLink="/catalogos/clientes">👥 Clientes</a>
      ...
    </nav>
  </app-main-menu>

  <!-- LAYOUT CONTAINER -->
  <div class="layout-container">
    <!-- SIDEBAR (opcional) -->
    <aside class="sidebar"></aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>

*/

// ============================================================================
// CHECKLIST DE IMPLEMENTACIÓN
// ============================================================================

/*
- [ ] Copiar/actualizar layout.component.ts con MainMenuComponent import
- [ ] Actualizar app.routes.ts con estructura por dominio
- [ ] Crear componentes placeholder para rutas sin componente:
    - [ ] AuditHistoryComponent
    - [ ] SecuritySettingsComponent
    - [ ] StockAdjustmentsComponent
    - [ ] TransfersComponent
- [ ] Ejecutar tests: ng test
- [ ] Verificar navegación en navegador
- [ ] Probar en mobile (responsive)
- [ ] Revisar breadcrumbs (si existen)
- [ ] Deploy a testing environment
- [ ] QA sign-off

*/
