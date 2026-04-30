import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './toolbar.component';
import { SidebarComponent, MenuItem } from './sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToolbarComponent, SidebarComponent],
  template: `
    <div class="shell-container">
      <!-- Toolbar -->
      <app-toolbar (menuToggle)="onMenuToggle()" (search)="onGlobalSearch($event)"></app-toolbar>

      <!-- Main Layout -->
      <div class="shell-layout">
        <!-- Sidebar -->
        <app-sidebar
          [isOpen]="sidebarOpen"
          [menuItems]="menuItems"
          (toggleSidebar)="onMenuToggle()"
        ></app-sidebar>

        <!-- Content Area -->
        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay (cuando sidebar está abierto) -->
      <div
        class="shell-overlay"
        *ngIf="sidebarOpen && isMobileView"
        (click)="onMenuToggle()"
      ></div>
    </div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f6fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .shell-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .shell-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px;
      background: #f5f6fa;
    }

    .shell-overlay {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 50;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .shell-content {
        padding: 16px;
      }

      .shell-overlay {
        display: block;
      }
    }

    @media (max-width: 480px) {
      .shell-content {
        padding: 12px;
      }
    }

    /* Scrollbar */
    .shell-content::-webkit-scrollbar {
      width: 8px;
    }

    .shell-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .shell-content::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    .shell-content::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `]
})
export class ShellComponent implements OnInit {
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

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
  }

  checkViewport(): void {
    this.isMobileView = window.innerWidth <= 768;
    // Cerrar sidebar en móvil por defecto
    if (this.isMobileView && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  onMenuToggle(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onGlobalSearch(query: string): void {
    console.log('Global search:', query);
    // Implementar búsqueda global aquí
    // Por ahora solo log
  }
}
