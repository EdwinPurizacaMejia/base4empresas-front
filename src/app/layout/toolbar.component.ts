import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
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
        <span>SGI</span>
      </span>

      <!-- Spacer izquierdo -->
      <span class="spacer"></span>

      <!-- Right: Acciones -->
      <div class="toolbar-actions">
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
  onMenuToggle(): void {
    this.menuToggle.emit();
  }
}
