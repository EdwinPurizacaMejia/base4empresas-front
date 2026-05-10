import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="userMenuPanel" aria-label="Menú de usuario">
      <mat-icon>account_circle</mat-icon>
    </button>
    
    <mat-menu #userMenuPanel="matMenu" class="user-menu-panel">
      <div mat-menu-item disabled class="user-menu__header">
        <div class="user-avatar">
          <mat-icon>person</mat-icon>
        </div>
        <div>
          <div class="user-name">Usuario</div>
          <div class="user-email">usuario&#64;base4empresas.local</div>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="onProfileClick()">
        <mat-icon>person_outline</mat-icon>
        <span>Mi Perfil</span>
      </button>
      
      <button mat-menu-item (click)="onSettingsClick()">
        <mat-icon>settings</mat-icon>
        <span>Configuración</span>
      </button>
      
      <button mat-menu-item (click)="onThemeToggle()">
        <mat-icon>brightness_4</mat-icon>
        <span>Tema (próximamente)</span>
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="onLogout()">
        <mat-icon>logout</mat-icon>
        <span>Cerrar Sesión</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }

    .user-menu-panel {
      min-width: 280px !important;
    }

    .user-menu__header {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 12px 16px !important;
      cursor: default !important;

      &:hover {
        background-color: transparent !important;
      }
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      color: white;
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 14px;
    }

    .user-email {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    [mat-menu-item] {
      font-size: 14px;

      &:disabled {
        opacity: 1 !important;
        background: transparent !important;
      }

      mat-icon {
        margin-right: 12px !important;
        color: inherit;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuComponent {
  onProfileClick(): void {
    console.log('Perfil de usuario (próximamente)');
    // TODO: Implementar naveg ación a perfil
  }

  onSettingsClick(): void {
    console.log('Configuración de usuario (próximamente)');
    // TODO: Implementar navegación a configuración
  }

  onThemeToggle(): void {
    console.log('Cambio de tema (próximamente)');
    // TODO: Implementar toggle de tema
  }

  onLogout(): void {
    console.log('Cerrar sesión');
    // TODO: Implementar logout
  }
}
