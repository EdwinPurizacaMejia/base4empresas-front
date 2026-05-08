import { Routes } from '@angular/router';
import { HorizontalLayoutComponent } from './layout/horizontal-layout/horizontal-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { StockListComponent } from './components/stock-list/stock-list.component';
import { StockDetailComponent } from './components/stock-detail/stock-detail.component';
import { KardexComponent } from './components/kardex/kardex.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { PurchaseDetailComponent } from './components/purchase-detail/purchase-detail.component';
import { SaleListComponent } from './components/sale-list/sale-list.component';
import { SaleDetailComponent } from './components/sale-detail/sale-detail.component';

/**
 * RUTAS PRINCIPALES (Layout Horizontal)
 * Etapa 5: Consolidación - layout único y limpio
 * 
 * Estructura:
 * - Dashboard principal
 * - Gestión de Productos (listado + detalle)
 * - Gestión de Inventario (listado + detalle)
 * - Kardex
 * - Gestión de Compras (listado + detalle)
 * - Gestión de Ventas (listado + detalle)
 */
export const routes: Routes = [
  {
    path: '',
    component: HorizontalLayoutComponent,
    children: [
      // Redirect raíz a dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },

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

      // Inventario
      {
        path: 'inventario',
        component: StockListComponent,
        data: { title: 'Inventario' }
      },
      {
        path: 'inventario/:id',
        component: StockDetailComponent,
        data: { title: 'Detalle de Inventario' }
      },

      // Kardex
      {
        path: 'kardex',
        component: KardexComponent,
        data: { title: 'Kardex' }
      },

      // Compras
      {
        path: 'compras',
        component: PurchaseListComponent,
        data: { title: 'Compras' }
      },
      {
        path: 'compras/:id',
        component: PurchaseDetailComponent,
        data: { title: 'Detalle de Compra' }
      },

      // Ventas
      {
        path: 'ventas',
        component: SaleListComponent,
        data: { title: 'Ventas' }
      },
      {
        path: 'ventas/:id',
        component: SaleDetailComponent,
        data: { title: 'Detalle de Venta' }
      }
    ]
  },

  // Wildcard - redirige a dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
