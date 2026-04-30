import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './toolbar.component';
import { SidebarComponent, MenuItem } from './sidebar.component';

/**
 * LayoutComponent (Shell Layout)
 * 
 * Componente principal que proporciona la estructura shell de la aplicación.
 * Integra:
 * - Toolbar superior con búsqueda global
 * - Sidebar de navegación responsive
 * - Área de contenido principal
 * 
 * Mantiene el routing original sin cambios.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToolbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  isMobileView = false;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Productos', route: '/products', icon: '📦' },
    { label: 'Inventario', route: '/stock', icon: '📈' },
    { label: 'Kardex', route: '/kardex', icon: '📋' },
    { label: 'Compras', route: '/purchases', icon: '🛒', badge: 0 },
    { label: 'Ventas', route: '/sales', icon: '💰', badge: 0 }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Solo ejecutar detección de viewport en cliente (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      window.addEventListener('resize', () => this.checkViewport());
    }
  }

  /**
   * Verifica si se está viendo en dispositivo móvil
   * Solo se ejecuta en cliente, no en servidor
   */
  checkViewport(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth <= 768;
      // Cerrar sidebar automáticamente en móvil
      if (this.isMobileView && this.sidebarOpen) {
        this.sidebarOpen = false;
      }
    }
  }

  /**
   * Alterna la visibilidad del sidebar
   */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Cierra el sidebar (usado al hacer click en un item de menú en móvil)
   */
  closeSidebar(): void {
    if (this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  /**
   * Maneja la búsqueda global desde el toolbar
   * @param query Término de búsqueda
   */
  onGlobalSearch(query: string): void {
    console.log('Búsqueda global:', query);
    // Implementar lógica de búsqueda global
    // Por ahora solo registra en consola
  }
}
