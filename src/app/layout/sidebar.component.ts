import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MenuItem } from '../models/menu.model';

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
    MatExpansionModule
  ],
  template: `
    <mat-nav-list class="nav-list">
      <ng-container *ngFor="let item of menuItems">
        <!-- Items SIN submenús (leaf items) -->
        <mat-list-item 
          *ngIf="!item.children || item.children.length === 0"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
          class="nav-item"
        >
          <div matListItemIcon class="nav-emoji">{{ item.icon }}</div>
          <div matListItemTitle>{{ item.label }}</div>
          <span *ngIf="item.badge" class="badge">{{ item.badge }}</span>
        </mat-list-item>

        <!-- Items CON submenús (parent items) -->
        <mat-expansion-panel 
          *ngIf="item.children && item.children.length > 0"
          class="submenu-panel"
        >
          <!-- Encabezado expandible -->
          <mat-expansion-panel-header class="submenu-header">
            <mat-panel-title class="submenu-title">
              <span class="nav-emoji">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
              <span *ngIf="item.badge" class="badge">{{ item.badge }}</span>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <!-- Submenús -->
          <div class="submenu-items">
            <mat-nav-list>
              <mat-list-item 
                *ngFor="let subitem of item.children"
                [routerLink]="subitem.route"
                routerLinkActive="active"
                class="submenu-item"
              >
                <span matListItemIcon class="submenu-emoji">{{ subitem.icon }}</span>
                <div matListItemTitle class="submenu-label">{{ subitem.label }}</div>
              </mat-list-item>
            </mat-nav-list>
          </div>
        </mat-expansion-panel>
      </ng-container>
    </mat-nav-list>
  `,
  styles: [`
    .nav-list {
      padding: 16px 0;
    }

    /* Items normales (sin submenús) */
    mat-list-item.nav-item {
      border-radius: 8px;
      margin: 0 12px;
      height: 48px;
      transition: all 0.2s;
      color: white;
    }

    mat-list-item.nav-item:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }

    mat-list-item.nav-item.active {
      background-color: rgba(255, 255, 255, 0.25);
      font-weight: 600;
    }

    /* Panels de expansión (submenús) */
    mat-expansion-panel.submenu-panel {
      background-color: transparent !important;
      box-shadow: none !important;
      margin: 8px 12px !important;
      border-radius: 8px !important;
      overflow: hidden;
    }

    .submenu-header {
      height: 48px !important;
      padding: 0 !important;
      background-color: transparent !important;
      border-radius: 8px !important;
      transition: all 0.2s;
    }

    .submenu-header:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
    }

    .submenu-title {
      display: flex;
      align-items: center;
      width: 100%;
      color: white;
      font-size: 14px;
      font-weight: 500;
      gap: 12px;
    }

    .nav-emoji, .submenu-emoji {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .submenu-emoji {
      font-size: 16px;
      margin-right: 8px;
    }

    .label {
      flex: 1;
    }

    /* Items de submenú */
    .submenu-items {
      padding: 8px 0;
      background-color: rgba(0, 0, 0, 0.1);
    }

    mat-list-item.submenu-item {
      height: 40px;
      padding-left: 32px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
    }

    mat-list-item.submenu-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    mat-list-item.submenu-item.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
      color: white;
    }

    .submenu-label {
      font-size: 13px;
    }

    /* Badge */
    .badge {
      background-color: #ff6b6b;
      color: white;
      border-radius: 12px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      margin-left: auto;
      flex-shrink: 0;
    }
  `]
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();
}
