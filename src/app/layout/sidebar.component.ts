import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="!isOpen">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="sidebar-logo" *ngIf="isOpen">
          <span class="logo-icon">📦</span>
          <span class="logo-text">SGI</span>
        </div>
        <button class="toggle-btn" (click)="onToggle()" [title]="isOpen ? 'Contraer' : 'Expandir'">
          {{ isOpen ? '◀' : '▶' }}
        </button>
      </div>

      <!-- Navigation Items -->
      <nav class="sidebar-nav">
        <a
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
          class="nav-item"
          [title]="item.label"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="isOpen">{{ item.label }}</span>
          <span class="nav-badge" *ngIf="isOpen && item.badge">{{ item.badge }}</span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer" *ngIf="isOpen">
        <p>© 2026 Sistema de Gestión de Inventario</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
      overflow-x: hidden;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    /* Header */
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 64px;
      gap: 8px;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      cursor: pointer;
      user-select: none;
    }

    .logo-icon {
      font-size: 24px;
      display: flex;
      align-items: center;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
      white-space: nowrap;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      font-size: 14px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 12px;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      cursor: pointer;
      border: 1px solid transparent;
      position: relative;
      white-space: nowrap;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.12);
      color: white;
    }

    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 600;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .nav-icon {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 14px;
      flex: 1;
    }

    .nav-badge {
      background: rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 22px;
      text-align: center;
      flex-shrink: 0;
    }

    /* Footer */
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .sidebar-footer p {
      margin: 0;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
    }

    /* Scrollbar */
    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        height: calc(100vh - 64px);
        z-index: 999;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 260px;
        transform: translateX(-100%);
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 100%;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Productos', route: '/products', icon: '📦' },
    { label: 'Inventario', route: '/stock', icon: '📈' },
    { label: 'Kardex', route: '/kardex', icon: '📋' },
    { label: 'Compras', route: '/purchases', icon: '🛒', badge: 0 },
    { label: 'Ventas', route: '/sales', icon: '💰', badge: 0 }
  ];
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
