import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <header class="toolbar">
      <!-- Left Section: Menu Toggle + Logo -->
      <div class="toolbar-left">
        <button class="menu-toggle" (click)="onMenuToggle()" title="Menú">
          <span class="hamburger">☰</span>
        </button>
        <div class="logo">
          <span class="logo-icon">📦</span>
          <span class="logo-text">SGI</span>
        </div>
      </div>

      <!-- Center Section: Global Search -->
      <div class="toolbar-center">
        <div class="search-container">
          <input
            #searchInput
            type="text"
            class="search-input"
            placeholder="Buscar productos, ventas, compras..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            (keyup.escape)="onClearSearch()"
          />
          <button class="search-btn" (click)="onSearch()" title="Buscar">
            🔍
          </button>
          <button
            *ngIf="searchQuery"
            class="search-clear"
            (click)="onClearSearch()"
            title="Limpiar"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Right Section: User Info + Actions -->
      <div class="toolbar-right">
        <div class="user-menu">
          <span class="user-icon">👤</span>
          <span class="user-name">Admin</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 0 24px;
      height: 64px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      gap: 24px;
    }

    /* Left Section */
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .menu-toggle {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      color: #667eea;
      transition: color 0.2s;
      display: none;
    }

    .menu-toggle:hover {
      color: #764ba2;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #667eea;
      letter-spacing: 1px;
    }

    /* Center Section: Search */
    .toolbar-center {
      flex: 1;
      display: flex;
      justify-content: center;
      max-width: 500px;
    }

    .search-container {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 24px;
      padding: 0 12px;
      gap: 8px;
      width: 100%;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .search-container:focus-within {
      background: white;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      padding: 8px 0;
      font-size: 14px;
      color: #333;
    }

    .search-input::placeholder {
      color: #999;
    }

    .search-btn {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #667eea;
      padding: 4px;
      transition: color 0.2s;
    }

    .search-btn:hover {
      color: #764ba2;
    }

    .search-clear {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #ccc;
      padding: 4px;
      transition: color 0.2s;
    }

    .search-clear:hover {
      color: #999;
    }

    /* Right Section */
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .user-menu:hover {
      background: #f5f5f5;
    }

    .user-icon {
      font-size: 20px;
    }

    .user-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .toolbar {
        padding: 0 16px;
        gap: 12px;
      }

      .menu-toggle {
        display: block;
      }

      .logo-text {
        display: none;
      }

      .toolbar-center {
        max-width: none;
      }

      .search-input::placeholder {
        font-size: 12px;
      }

      .user-name {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .toolbar {
        padding: 0 12px;
      }

      .toolbar-center {
        display: none;
      }
    }
  `]
})
export class ToolbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchQuery = '';

  constructor(private router: Router) {}

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
      // Navegar a búsqueda global (cuando exista ese módulo)
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.searchInput.nativeElement.focus();
  }
}
