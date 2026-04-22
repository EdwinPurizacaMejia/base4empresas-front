import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StockListComponent } from './components/stock-list/stock-list.component';
import { KardexComponent } from './components/kardex/kardex.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { SaleListComponent } from './components/sale-list/sale-list.component';

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
        path: 'stock',
        component: StockListComponent,
        data: { title: 'Inventario' }
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
        path: 'sales',
        component: SaleListComponent,
        data: { title: 'Ventas' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
