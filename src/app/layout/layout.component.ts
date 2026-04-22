import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Productos', route: '/products', icon: '📦' },
    { label: 'Inventario', route: '/stock', icon: '📈' },
    { label: 'Kardex', route: '/kardex', icon: '📋' },
    { label: 'Compras', route: '/purchases', icon: '🛒' },
    { label: 'Ventas', route: '/sales', icon: '💰' }
  ];
}
