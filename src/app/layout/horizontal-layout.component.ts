import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  PLATFORM_ID,
  computed,
  signal
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchService } from '../services/search.service';
import { UserMenuComponent } from '../components/shared/user-menu.component';

type TopNavItem = { label: string; route: string };

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UserMenuComponent,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav
        #sidenav
        class="mobile-sidenav"
        mode="over"
        [opened]="false"
        [fixedInViewport]="true"
        [fixedTopGap]="64"
      >
        <mat-nav-list>
          <a
            mat-list-item
            *ngFor="let item of navItems; trackBy: trackByRoute"
            [routerLink]="item.route"
            (click)="sidenav.close()"
          >
            {{ item.label }}
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="topbar">
          <button
            mat-icon-button
            class="hamburger"
            aria-label="Abrir menú"
            (click)="sidenav.toggle()"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <a class="brand" [routerLink]="'/dashboard'" aria-label="Ir al dashboard">
            <span class="brand__logo">SGI</span>
            <span class="brand__name">Base4Empresas</span>
          </a>

          <nav class="topnav" aria-label="Navegación principal">
            <a
              class="topnav__link"
              *ngFor="let item of navItems; trackBy: trackByRoute"
              [routerLink]="item.route"
              routerLinkActive="topnav__link--active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            >
              {{ item.label }}
            </a>
          </nav>

          <span class="spacer"></span>

          <div class="search" [class.search--collapsed]="isMobile() && !mobileSearchOpen()">
            <button
              mat-icon-button
              class="search__icon"
              aria-label="Buscar"
              (click)="toggleMobileSearch()"
            >
              <mat-icon>search</mat-icon>
            </button>

            <mat-form-field appearance="outline" class="search__field">
              <mat-label>Buscar...</mat-label>
              <input
                matInput
                [formControl]="searchControl"
                placeholder="Buscar..."
                aria-label="Buscar global"
              />
            </mat-form-field>
          </div>

          <app-user-menu></app-user-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .layout {
        height: 100vh;
        background: #f5f7fa;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 0 16px;
      }

      .hamburger {
        display: none;
        margin-right: 8px;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        margin-right: 18px;
        white-space: nowrap;
      }

      .brand__logo {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.18);
        display: grid;
        place-items: center;
        font-weight: 800;
        letter-spacing: 0.5px;
      }

      .brand__name {
        font-weight: 700;
      }

      .topnav {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .topnav__link {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        padding: 8px 10px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        line-height: 1;
      }

      .topnav__link:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      .topnav__link--active {
        background: rgba(255, 255, 255, 0.22);
      }

      .spacer {
        flex: 1 1 auto;
      }

      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 6px;
      }

      .search__icon {
        display: none;
      }

      .search__field {
        width: min(340px, 36vw);
      }

      .content {
        padding: 24px;
        min-height: calc(100vh - 64px);
        background: #f5f7fa;
      }

      .mobile-sidenav {
        width: 280px;
      }

      @media (max-width: 768px) {
        .hamburger {
          display: inline-flex;
        }

        .topnav {
          display: none;
        }

        .search__icon {
          display: inline-flex;
        }

        .search__field {
          width: 100%;
        }

        .search--collapsed .search__field {
          display: none;
        }

        .content {
          padding: 16px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalLayoutComponent {
  navItems: TopNavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Productos', route: '/products' },
    { label: 'Compras', route: '/purchases' },
    { label: 'Ventas', route: '/sales' },
    { label: 'Inventario', route: '/stock' },
    { label: 'Kardex', route: '/kardex' }
  ];

  searchControl = new FormControl<string>('', { nonNullable: true });

  private isBrowser = false;

  // Responsive state
  private mobile = signal(false);
  isMobile = computed(() => this.mobile());

  // Mobile search collapse
  mobileSearchOpen = signal(false);

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly destroyRef: DestroyRef,
    private readonly searchService: SearchService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Global search binding (debounced)
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.searchService.setSearchTerm(term));

    if (this.isBrowser) {
      this.checkViewport();
      window.addEventListener('resize', this.checkViewport);
    }
  }

  private checkViewport = () => {
    if (!this.isBrowser) return;
    this.mobile.set(window.innerWidth < 768);
    if (!this.isMobile()) this.mobileSearchOpen.set(false);
  };

  toggleMobileSearch(): void {
    if (!this.isMobile()) return;
    this.mobileSearchOpen.update((v) => !v);
  }

  trackByRoute(_: number, item: TopNavItem): string {
    return item.route;
  }
}
