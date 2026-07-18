import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * ToolbarComponent — Barra superior de navegación
 *
 * Fase 2: inline styles migrados a toolbar.component.scss
 * - Logo reemplazado con mat-icon (inventory) de Material Icons
 * - Clases CSS usando variables SCSS del sistema de diseño
 */
@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  styleUrls: ['./toolbar.component.scss'],
  template: `
    <mat-toolbar class="app-toolbar">
      <!-- Left: Menu Toggle -->
      <button
        mat-icon-button
        (click)="onMenuToggle()"
        [attr.aria-label]="'Abrir menú'"
        matTooltip="Menú"
        class="toolbar-icon-btn"
      >
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Logo + Título -->
      <span class="app-title">
        <span class="logo-icon">
          <mat-icon>inventory</mat-icon>
        </span>
        <span>Base4Empresas</span>
      </span>

      <!-- Spacer izquierdo -->
      <span class="spacer"></span>

      <!-- Center: Búsqueda global -->
      <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
        <mat-label>Buscar...</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
          (keyup.escape)="onClearSearch()"
          placeholder="Productos, ventas, compras..."
          [attr.aria-label]="'Búsqueda global'"
        />
        <button
          mat-icon-button
          matSuffix
          *ngIf="searchQuery"
          (click)="onClearSearch()"
          [attr.aria-label]="'Limpiar búsqueda'"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <!-- Spacer derecho -->
      <span class="spacer"></span>

      <!-- Right: Acciones -->
      <div class="toolbar-actions">
        <button
          mat-icon-button
          class="toolbar-icon-btn"
          matTooltip="Notificaciones"
          [attr.aria-label]="'Notificaciones'"
        >
          <mat-icon>notifications_none</mat-icon>
        </button>

        <button
          mat-icon-button
          class="toolbar-icon-btn user-menu-btn"
          matTooltip="Mi cuenta"
          [attr.aria-label]="'Perfil de usuario'"
        >
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
})
export class ToolbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery.trim());
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
  }
}
