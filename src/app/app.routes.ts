import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// CATÁLOGOS (FASE 1)
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { UnitsListComponent } from './components/units-list/units-list.component';
import { WarehousesListComponent } from './components/warehouses-list/warehouses-list.component';
import { SalesChannelsListComponent } from './components/sales-channels/sales-channels-list.component';
import { CustomersListComponent } from './components/customers-list/customers-list.component';
import { SuppliersListComponent } from './components/suppliers-list/suppliers-list.component';

// VENTAS (FASE 2-3: Pedidos + Pagos)
import { OrdersListComponent } from './components/orders/orders-list.component';
import { OrderCreateComponent } from './components/orders/order-create.component';
import { OrderDetailComponent } from './components/orders/order-detail.component';
import { PaymentsListComponent } from './components/orders/payments-list.component';

// INVENTARIO (FASE 2-4)
import { StockListComponent } from './components/stock-list/stock-list.component';
import { StockDetailComponent } from './components/stock-detail/stock-detail.component';
import { KardexComponent } from './components/kardex/kardex.component';
import { AdjustmentsListComponent } from './components/adjustments-list/adjustments-list.component';
import { TransfersListComponent } from './components/transfers-list/transfers-list.component';

// LOGÍSTICA (FASE 4)
import { ShipmentsListComponent } from './components/shipments-list/shipments-list.component';

// COMPRAS (Módulo adicional)
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { PurchaseDetailComponent } from './components/purchase-detail/purchase-detail.component';

// CONFIGURACIÓN (FASE 5)
import { CostingConfigComponent } from './components/costing-config/costing-config.component';

/**
 * RUTAS REORGANIZADAS POR DOMINIO COMERCIAL Y FASES
 * 
 * Estructura jerárquica:
 * - /dashboard                                 → Dashboard
 * - /catalogos/*                               → Catálogos (FASE 1)
 * - /ventas/*                                  → Ventas (FASE 2-3)
 * - /inventario/*                              → Inventario (FASE 2-4)
 * - /logistica/*                               → Logística (FASE 4)
 * - /compras/*                                 → Compras (módulo adicional)
 * - /config/*                                  → Configuración (FASE 5)
 */
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // ========================================
      // Redirect raíz a dashboard
      // ========================================
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ========================================
      // DASHBOARD
      // ========================================
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },

      // ========================================
      // FASE 1: CATÁLOGOS (Maestros)
      // ========================================
      {
        path: 'catalogos',
        children: [
          // Productos
          {
            path: 'productos',
            component: ProductsListComponent,
            data: { title: 'Productos' }
          },
          {
            path: 'productos/:id',
            component: ProductDetailComponent,
            data: { title: 'Detalle de Producto' }
          },

          // Categorías
          {
            path: 'categorias',
            component: CategoriesListComponent,
            data: { title: 'Categorías' }
          },

          // Unidades
          {
            path: 'unidades',
            component: UnitsListComponent,
            data: { title: 'Unidades de Medida' }
          },

          // Almacenes
          {
            path: 'almacenes',
            component: WarehousesListComponent,
            data: { title: 'Almacenes' }
          },

          // Canales de venta (FASE 1)
          {
            path: 'canales-venta',
            component: SalesChannelsListComponent,
            data: { title: 'Canales de Venta' }
          },

          // Clientes (FASE 1)
          {
            path: 'clientes',
            component: CustomersListComponent,
            data: { title: 'Clientes' }
          },

          // Proveedores (FASE 1)
          {
            path: 'proveedores',
            component: SuppliersListComponent,
            data: { title: 'Proveedores' }
          }
        ]
      },

      // ========================================
      // FASE 2-3: VENTAS (Pedidos + Pagos)
      // ========================================
      {
        path: 'ventas',
        children: [
          // Pedidos (FASE 2)
          {
            path: 'pedidos',
            component: OrdersListComponent,
            data: { title: 'Órdenes de Venta' }
          },
          {
            path: 'pedidos/crear',
            component: OrderCreateComponent,
            data: { title: 'Crear Orden' }
          },
          {
            path: 'pedidos/:id',
            component: OrderDetailComponent,
            data: { title: 'Detalle de Orden' }
          },

          // Pagos (FASE 3) - Vista filtrada de órdenes con saldo pendiente
          {
            path: 'pagos',
            component: PaymentsListComponent,
            data: { title: 'Gestión de Pagos' }
          }
        ]
      },

      // ========================================
      // FASE 2-4: INVENTARIO (Stock, Kardex, Ajustes)
      // ========================================
      {
        path: 'inventario',
        children: [
          // Stock actual
          {
            path: 'stock',
            component: StockListComponent,
            data: { title: 'Stock Actual' }
          },
          {
            path: 'stock/:id',
            component: StockDetailComponent,
            data: { title: 'Detalle de Stock' }
          },

          // Kardex
          {
            path: 'kardex',
            component: KardexComponent,
            data: { title: 'Kardex' }
          },

          // Ajustes de stock
          {
            path: 'ajustes',
            component: AdjustmentsListComponent,
            data: { title: 'Ajustes de Stock' }
          },

          // Transferencias
          {
            path: 'transferencias',
            component: TransfersListComponent,
            data: { title: 'Transferencias de Stock' }
          }
        ]
      },

      // ========================================
      // FASE 4: LOGÍSTICA (Envíos)
      // ========================================
      {
        path: 'logistica',
        children: [
          // Envíos - gestión de shipments
          {
            path: 'envios',
            component: ShipmentsListComponent,
            data: { title: 'Envíos' }
          }
        ]
      },

      // ========================================
      // COMPRAS (Módulo adicional)
      // ========================================
      {
        path: 'compras',
        children: [
          // Órdenes de compra
          {
            path: 'ordenes',
            component: PurchaseListComponent,
            data: { title: 'Órdenes de Compra' }
          },
          {
            path: 'ordenes/:id',
            component: PurchaseDetailComponent,
            data: { title: 'Detalle de Orden de Compra' }
          }
        ]
      },

      // ========================================
      // FASE 5: CONFIGURACIÓN (Auditoría, Seguridad, 2FA)
      // ========================================
      {
        path: 'config',
        children: [
          // Configuración de costeo
          {
            path: 'costeo',
            component: CostingConfigComponent,
            data: { title: 'Configuración de Costeo' }
          },

          // Auditoría (placeholder)
          {
            path: 'auditoria',
            component: CostingConfigComponent,
            data: { title: 'Auditoría' }
          },

          // Seguridad (placeholder)
          {
            path: 'seguridad',
            component: CostingConfigComponent,
            data: { title: 'Seguridad' }
          }
        ]
      },

      // ========================================
      // RUTAS LEGACIES (redireccionamientos)
      // ========================================
      {
        path: 'productos',
        redirectTo: 'catalogos/productos',
        pathMatch: 'full'
      },
      {
        path: 'clientes',
        redirectTo: 'catalogos/clientes',
        pathMatch: 'full'
      },
      {
        path: 'proveedores',
        redirectTo: 'catalogos/proveedores',
        pathMatch: 'full'
      },
      {
        path: 'kardex',
        redirectTo: 'inventario/kardex',
        pathMatch: 'full'
      },
      {
        path: 'pedidos',
        redirectTo: 'ventas/pedidos',
        pathMatch: 'full'
      },
      {
        path: 'configuracion/costeo',
        redirectTo: 'config/costeo',
        pathMatch: 'full'
      }
    ]
  },

  // ========================================
  // Wildcard - redirige a dashboard
  // ========================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
