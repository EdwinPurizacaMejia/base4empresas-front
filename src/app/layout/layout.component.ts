import { Component, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarComponent } from './toolbar.component';
import { SidebarComponent } from './sidebar.component';
import { MenuItem, MAIN_MENU } from '../models/menu.model';

/**
 * LayoutComponent con Angular Material
 * 
 * Estructura:
 * - mat-toolbar: Navbar superior
 * - mat-sidenav-container: Layout principal (sidebar + contenido)
 *   - mat-sidenav: Sidebar navegación (izquierda)
 *   - <router-outlet>: Contenido principal (derecha)
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    ToolbarComponent,
    SidebarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidebarOpen = true;

  // Usa configuración centralizada desde menu.model.ts
  menuItems: MenuItem[] = MAIN_MENU;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Inicialización si es necesaria en cliente
    if (isPlatformBrowser(this.platformId)) {
      // Material maneja responsive automáticamente
    }
  }
}
