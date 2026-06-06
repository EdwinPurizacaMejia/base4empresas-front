/**
 * Componente de menú principal jerárquico
 * Renderiza navegación de dos niveles:
 * - Nivel 1: Items principales (Dashboard, Catálogos, Ventas, etc.)
 * - Nivel 2: Submenús dinámicos según selección
 *
 * Buenas prácticas:
 * - Usa routerLink y routerLinkActive para navegación
 * - Control de estado activo basado en ruta actual
 * - Soporta roles y control de acceso
 * - OnPush strategy para performance
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Optional,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MenuItem, MAIN_MENU } from '../models/menu.model';
import { PermissionService } from '../services/permission.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Menú Principal (Nivel 1) -->
    <nav class="main-menu">
      <a
        *ngFor="let item of mainMenu"
        [routerLink]="item.route || null"
        routerLinkActive="active"
        [class.parent-menu]="!!item.children?.length"
        [class.disabled]="item.disabled"
        [title]="item.tooltip || ''"
        (click)="selectMenuItem(item)"
      >
        <span class="menu-icon" *ngIf="item.icon">{{ item.icon }}</span>
        <span class="menu-label">{{ item.label }}</span>
      </a>
    </nav>

    <!-- Submenú (Nivel 2) - Dropdown Vertical Dinámico -->
    <nav class="sub-menu" *ngIf="activeParent?.children?.length" [class.visible]="activeParent">
      <a
        *ngFor="let child of activeParent?.children || []"
        [routerLink]="child.route"
        routerLinkActive="active"
        [class.disabled]="child.disabled"
        [title]="child.tooltip || ''"
        class="sub-menu-item"
      >
        <span class="sub-menu-item-icon" *ngIf="child.icon">
          {{ child.icon }}
        </span>
        <span class="sub-menu-item-label">{{ child.label }}</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Menú Principal (Nivel 1) */
    .main-menu {
      display: flex;
      flex-direction: row;
      background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 3px solid #3b82f6;
      padding: 0.5rem;
      gap: 0;
      overflow-x: auto;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .main-menu a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      border-bottom: 3px solid transparent;
    }

    .main-menu a:hover:not(.disabled) {
      background-color: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      border-bottom-color: #60a5fa;
    }

    .main-menu a.active {
      background-color: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border-bottom-color: #3b82f6;
      font-weight: 600;
    }

    .main-menu a.parent-menu {
      position: relative;
    }

    .main-menu a.parent-menu::after {
      content: '▼';
      font-size: 0.6rem;
      margin-left: 0.25rem;
      opacity: 0.6;
    }

    .main-menu a.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .menu-icon {
      font-size: 1.1rem;
    }

    .menu-label {
      font-size: 0.95rem;
    }

    /* Submenú (Nivel 2) - Dropdown Vertical */
    .sub-menu {
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 2px solid #3b82f6;
      padding: 0;
      gap: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      position: relative;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sub-menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      color: #cbd5e1;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      background-color: transparent;
      white-space: nowrap;
    }

    .sub-menu-item:first-child {
      border-top: 1px solid #334155;
    }

    .sub-menu-item:hover:not(.disabled) {
      background-color: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border-left-color: #60a5fa;
      padding-left: 1.5rem;
    }

    .sub-menu-item.active {
      background-color: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border-left-color: #3b82f6;
      font-weight: 600;
      padding-left: 1.5rem;
    }

    .sub-menu-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .sub-menu-item-icon {
      font-size: 1rem;
      min-width: 1.25rem;
      text-align: center;
    }

    .sub-menu-item-label {
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-menu {
        flex-wrap: wrap;
      }

      .main-menu a {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
      }

      .menu-label {
        display: none;
      }

      .main-menu a.parent-menu::after {
        display: none;
      }

      .sub-menu {
        flex-direction: column;
        padding: 0;
      }

      .sub-menu-item {
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit, OnDestroy {
  mainMenu: MenuItem[] = MAIN_MENU;
  activeParent: MenuItem | undefined;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    @Optional() private permissionService?: PermissionService
  ) {}

  ngOnInit(): void {
    // Determinar parent activo según ruta actual
    this.updateActiveParentFromRoute();

    // Actualizar parent activo cuando la ruta cambia
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveParentFromRoute();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Selecciona un item del menú principal
   * Si tiene children, lo marca como activo sin navegar
   * Si no tiene children, routerLink maneja la navegación
   */
  selectMenuItem(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      // Si ya está activo, permitir que se despliegue
      this.activeParent = this.activeParent?.label === item.label ? item : item;
    }
  }

  /**
   * Determina el parent activo basado en la ruta actual
   */
  private updateActiveParentFromRoute(): void {
    const currentUrl = this.router.url;

    for (const parent of this.mainMenu) {
      if (parent.children && parent.children.length > 0) {
        const matchChild = parent.children.find((child: MenuItem) =>
          currentUrl.startsWith(child.route || '')
        );

        if (matchChild) {
          this.activeParent = parent;
          return;
        }
      }
    }

    // Si no hay match, limpiar activeParent
    this.activeParent = undefined;
  }
}
