import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <!-- Left: Menu Toggle + Logo -->
      <button
        mat-icon-button
        (click)="onMenuToggle()"
        [attr.aria-label]="'Abrir menú'"
        class="menu-toggle"
      >
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">
        <span class="logo-icon">📦</span>
        Base4Empresas
      </span>

      <!-- Spacer -->
      <span class="spacer"></span>

      <!-- Center: Global Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar...</mat-label>
        <input
          matInput
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
          (keyup.escape)="onClearSearch()"
          placeholder="Productos, ventas, compras..."
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
        <button
          mat-icon-button
          matSuffix
          (click)="onSearch()"
          [attr.aria-label]="'Buscar'"
        >
          <mat-icon>search</mat-icon>
        </button>
      </mat-form-field>

      <!-- Spacer -->
      <span class="spacer"></span>

      <!-- Right: User Menu -->
      <button mat-icon-button [attr.aria-label]="'Perfil de usuario'">
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .app-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 16px;
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      margin-left: 16px;
      flex-shrink: 0;
    }

    .logo-icon {
      font-size: 24px;
    }

    .spacer {
      flex: 1;
    }

    .search-field {
      max-width: 400px;
      width: 100%;
    }

    @media (max-width: 768px) {
      .app-title {
        margin-left: 8px;
      }

      .search-field {
        max-width: 200px;
      }
    }

    @media (max-width: 480px) {
      .search-field {
        display: none;
      }
    }
  `]
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
      this.search.emit(this.searchQuery);
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
  }
}
