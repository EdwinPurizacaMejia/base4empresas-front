import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MenuItem } from '../models/menu.model';

/**
 * SidebarComponent — Navegación lateral principal
 *
 * Fase 2: refactorización completa
 * - Inline styles migrados a sidebar.component.scss
 * - Emojis reemplazados por Material Icons (librería única)
 * - Estados estandarizados: normal, hover, activo, disabled
 * - Tooltips en todos los items de menú
 * - Soporte para item.disabled del modelo MenuItem
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  styleUrls: ['./sidebar.component.scss'],
  template: `
    <mat-nav-list class="nav-list" [attr.aria-label]="'Menú de navegación'">

      <ng-container *ngFor="let item of menuItems">

        <!-- =============================================
             ITEM SIMPLE — sin submenús (leaf item)
             ============================================= -->
        <mat-list-item
          *ngIf="!item.children || item.children.length === 0"
          [routerLink]="item.disabled ? null : item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
          class="nav-item"
          [class.nav-item--disabled]="item.disabled"
          [matTooltip]="item.tooltip || item.label"
          matTooltipPosition="right"
          [attr.aria-label]="item.label"
          [attr.aria-disabled]="item.disabled || null"
        >
          <!-- Icono Material -->
          <mat-icon matListItemIcon class="nav-icon">{{ item.icon }}</mat-icon>

          <!-- Label -->
          <span matListItemTitle class="nav-label">{{ item.label }}</span>

          <!-- Badge numérico -->
          <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
        </mat-list-item>

        <!-- =============================================
             ITEM CON SUBMENÚ — expansion panel
             ============================================= -->
        <mat-expansion-panel
          *ngIf="item.children && item.children.length > 0"
          class="submenu-panel"
          [disabled]="item.disabled || false"
        >
          <!-- Encabezado expandible -->
          <mat-expansion-panel-header
            class="submenu-header"
            [attr.aria-label]="item.label"
          >
            <mat-panel-title class="submenu-title">
              <!-- Icono Material del grupo -->
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <!-- Label del grupo -->
              <span class="nav-label">{{ item.label }}</span>
              <!-- Badge del grupo -->
              <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <!-- Submenús -->
          <div class="submenu-body">
            <mat-nav-list>
              <mat-list-item
                *ngFor="let subitem of item.children"
                [routerLink]="subitem.disabled ? null : subitem.route"
                routerLinkActive="active"
                class="submenu-item"
                [class.submenu-item--disabled]="subitem.disabled"
                [matTooltip]="subitem.tooltip || subitem.label"
                matTooltipPosition="right"
                [attr.aria-label]="subitem.label"
                [attr.aria-disabled]="subitem.disabled || null"
              >
                <!-- Icono Material del subitem -->
                <mat-icon matListItemIcon class="submenu-icon">{{ subitem.icon }}</mat-icon>

                <!-- Label del subitem -->
                <span matListItemTitle class="submenu-label">{{ subitem.label }}</span>
              </mat-list-item>
            </mat-nav-list>
          </div>

        </mat-expansion-panel>

      </ng-container>

    </mat-nav-list>
  `,
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();
}
