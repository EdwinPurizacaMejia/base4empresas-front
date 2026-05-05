import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
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

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'products',
        component: ProductsListComponent,
        data: { title: 'Productos' }
      },
      {
        path: 'products/:id',
        component: ProductDetailComponent,
        data: { title: 'Detalle de Producto' }
      },
      {
        path: 'stock',
        component: StockListComponent,
        data: { title: 'Inventario' }
      },
      {
        path: 'stock/:id',
        component: StockDetailComponent,
        data: { title: 'Detalle de Inventario' }
      },
      {
        path: 'kardex',
        component: KardexComponent,
        data: { title: 'Kardex' }
      },
      {
        path: 'purchases',
        component: PurchaseListComponent,
        data: { title: 'Compras' }
      },
      {
        path: 'purchases/:id',
        component: PurchaseDetailComponent,
        data: { title: 'Detalle de Compra' }
      },
      {
        path: 'sales',
        component: SaleListComponent,
        data: { title: 'Ventas' }
      },
      {
        path: 'sales/:id',
        component: SaleDetailComponent,
        data: { title: 'Detalle de Venta' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
