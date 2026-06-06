/**
 * Tests unitarios para menú principal y modelo de menú
 * Verifica:
 * 1. Estructura correcta del modelo MAIN_MENU
 * 2. Renderizado de items principales
 * 3. Renderizado de submenús dinámicos
 * 4. Navegación con routerLink
 * 5. Estado activo basado en ruta actual
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { MainMenuComponent } from './main-menu.component';
import { MenuItem, MAIN_MENU } from '../models/menu.model';
import { PermissionService } from '../services/permission.service';
import { By } from '@angular/platform-browser';

describe('Menu Model - MAIN_MENU', () => {
  describe('Estructura del menú', () => {
    it('Debe contener los items principales esperados', () => {
      const mainLabels = MAIN_MENU.map((item) => item.label);
      expect(mainLabels).toContain('Dashboard');
      expect(mainLabels).toContain('Catálogos');
      expect(mainLabels).toContain('Ventas');
      expect(mainLabels).toContain('Inventario');
      expect(mainLabels).toContain('Logística');
      expect(mainLabels).toContain('Configuración');
    });

    it('Items principales deben tener iconos', () => {
      const mainItemsWithoutIcon = MAIN_MENU.filter((item) => !item.icon);
      expect(mainItemsWithoutIcon.length).toBe(0);
    });

    it('Dashboard debe ser un item de ruta simple (sin children)', () => {
      const dashboard = MAIN_MENU.find((item) => item.label === 'Dashboard');
      expect(dashboard?.route).toBe('/dashboard');
      expect(dashboard?.children).toBeUndefined();
    });

    it('Catálogos debe tener submenús correctos', () => {
      const catalogos = MAIN_MENU.find((item) => item.label === 'Catálogos');
      const childLabels = catalogos?.children?.map((child) => child.label) || [];

      expect(childLabels).toContain('Productos');
      expect(childLabels).toContain('Categorías');
      expect(childLabels).toContain('Clientes');
      expect(childLabels).toContain('Proveedores');
      expect(childLabels).toContain('Canales de venta');
    });

    it('Ventas debe tener submenús para Pedidos y Pagos (FASE 2-3)', () => {
      const ventas = MAIN_MENU.find((item) => item.label === 'Ventas');
      const childLabels = ventas?.children?.map((child) => child.label) || [];

      expect(childLabels).toContain('Pedidos');
      expect(childLabels).toContain('Pagos');
    });

    it('Inventario debe tener submenús para Stock, Kardex, Ajustes (FASE 2-4)', () => {
      const inventario = MAIN_MENU.find(
        (item) => item.label === 'Inventario'
      );
      const childLabels = inventario?.children?.map((child) => child.label) || [];

      expect(childLabels).toContain('Stock actual');
      expect(childLabels).toContain('Kardex');
      expect(childLabels).toContain('Ajustes de stock');
      expect(childLabels).toContain('Transferencias');
    });

    it('Logística debe tener submenú para Envíos (FASE 4)', () => {
      const logistica = MAIN_MENU.find(
        (item) => item.label === 'Logística'
      );
      const childLabels = logistica?.children?.map((child) => child.label) || [];

      expect(childLabels).toContain('Envíos');
    });

    it('Configuración debe tener submenús para Auditoría y Seguridad (FASE 5)', () => {
      const config = MAIN_MENU.find(
        (item) => item.label === 'Configuración'
      );
      const childLabels = config?.children?.map((child) => child.label) || [];

      expect(childLabels).toContain('Auditoría');
      expect(childLabels).toContain('Seguridad');
    });

    it('Todos los items con route deben tener una ruta válida (no vacía)', () => {
      const allItems: MenuItem[] = [];
      const collectItems = (items: MenuItem[]): void => {
        items.forEach((item) => {
          allItems.push(item);
          if (item.children) {
            collectItems(item.children);
          }
        });
      };
      collectItems(MAIN_MENU);

      const itemsWithInvalidRoute = allItems.filter(
        (item) => item.route === '' || item.route === null
      );
      expect(itemsWithInvalidRoute.length).toBe(0);
    });

    it('Rutas debe estar organizadas por dominio', () => {
      const catalogos = MAIN_MENU.find(
        (item) => item.label === 'Catálogos'
      );
      const catalogosRoutes =
        catalogos?.children?.map((child) => child.route) || [];

      // Todas las rutas de catálogos deben empezar con /catalogos
      const invalidCatalogRoutes = catalogosRoutes.filter(
        (route) => route && !route.startsWith('/catalogos')
      );
      expect(invalidCatalogRoutes.length).toBe(0);
    });

    it('Rutas de Ventas deben estar bajo /ventas', () => {
      const ventas = MAIN_MENU.find((item) => item.label === 'Ventas');
      const ventasRoutes = ventas?.children?.map((child) => child.route) || [];

      const invalidVentasRoutes = ventasRoutes.filter(
        (route) => route && !route.startsWith('/ventas')
      );
      expect(invalidVentasRoutes.length).toBe(0);
    });

    it('Rutas de Inventario deben estar bajo /inventario', () => {
      const inventario = MAIN_MENU.find(
        (item) => item.label === 'Inventario'
      );
      const inventarioRoutes =
        inventario?.children?.map((child) => child.route) || [];

      const invalidInventarioRoutes = inventarioRoutes.filter(
        (route) => route && !route.startsWith('/inventario')
      );
      expect(invalidInventarioRoutes.length).toBe(0);
    });

    it('Rutas de Logística deben estar bajo /logistica', () => {
      const logistica = MAIN_MENU.find(
        (item) => item.label === 'Logística'
      );
      const logisticaRoutes =
        logistica?.children?.map((child) => child.route) || [];

      const invalidLogisticaRoutes = logisticaRoutes.filter(
        (route) => route && !route.startsWith('/logistica')
      );
      expect(invalidLogisticaRoutes.length).toBe(0);
    });

    it('Rutas de Configuración deben estar bajo /config', () => {
      const config = MAIN_MENU.find(
        (item) => item.label === 'Configuración'
      );
      const configRoutes = config?.children?.map((child) => child.route) || [];

      const invalidConfigRoutes = configRoutes.filter(
        (route) => route && !route.startsWith('/config')
      );
      expect(invalidConfigRoutes.length).toBe(0);
    });

    it('Compras debe tener rutas bajo /compras', () => {
      const compras = MAIN_MENU.find((item) => item.label === 'Compras');
      const comprasRoutes = compras?.children?.map((child) => child.route) || [];

      const invalidComprasRoutes = comprasRoutes.filter(
        (route) => route && !route.startsWith('/compras')
      );
      expect(invalidComprasRoutes.length).toBe(0);
    });
  });
});

describe('MainMenuComponent', () => {
  let component: MainMenuComponent;
  let fixture: ComponentFixture<MainMenuComponent>;
  let router: Router;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    mockPermissionService = jasmine.createSpyObj('PermissionService', [
      'hasPermission',
      'hasRole',
    ]);
    mockPermissionService.hasPermission.and.returnValue(true);
    mockPermissionService.hasRole.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [MainMenuComponent, RouterTestingModule],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        {
          provide: Router,
          useValue: {
            url: '/dashboard',
            events: routerEventsSubject.asObservable(),
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  describe('Renderizado de menú principal', () => {
    it('Debe renderizar todos los items principales', () => {
      fixture.detectChanges();

      const mainMenuLinks = fixture.debugElement.queryAll(
        By.css('.main-menu a')
      );
      const labels = mainMenuLinks.map((el) =>
        el.nativeElement.textContent.trim()
      );

      expect(mainMenuLinks.length).toBeGreaterThan(0);
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Catálogos');
      expect(labels).toContain('Ventas');
      expect(labels).toContain('Inventario');
    });

    it('Items con children deben tener clase parent-menu', () => {
      fixture.detectChanges();

      const parentMenuItems = fixture.debugElement.queryAll(
        By.css('.main-menu a.parent-menu')
      );
      expect(parentMenuItems.length).toBeGreaterThan(0);
    });

    it('Dashboard no debe ser item padre (no tiene children)', () => {
      fixture.detectChanges();

      const dashboardLinks = fixture.debugElement.queryAll(
        By.css('.main-menu a')
      );
      const dashboardLink = dashboardLinks.find((el) =>
        el.nativeElement.textContent.includes('Dashboard')
      );

      expect(dashboardLink?.nativeElement.classList.contains('parent-menu')).toBe(
        false
      );
    });
  });

  describe('Renderizado de submenú', () => {
    it('No debe renderizar submenú cuando activeParent es undefined', () => {
      component.activeParent = undefined;
      fixture.detectChanges();

      const subMenu = fixture.debugElement.query(By.css('.sub-menu'));
      expect(subMenu).toBeNull();
    });

    it('Debe renderizar submenú cuando activeParent tiene children', () => {
      const catalogos = MAIN_MENU.find(
        (item) => item.label === 'Catálogos'
      );
      component.activeParent = catalogos;
      fixture.detectChanges();

      const subMenu = fixture.debugElement.query(By.css('.sub-menu'));
      expect(subMenu).toBeTruthy();
    });

    it('Submenú debe renderizar todos los items del parent activo', () => {
      const catalogos = MAIN_MENU.find(
        (item) => item.label === 'Catálogos'
      );
      component.activeParent = catalogos;
      fixture.detectChanges();

      const subMenuItems = fixture.debugElement.queryAll(
        By.css('.sub-menu-item')
      );
      const expectedCount = catalogos?.children?.length || 0;

      expect(subMenuItems.length).toBe(expectedCount);
    });

    it('Submenú items deben tener routerLink correcto', () => {
      const catalogos = MAIN_MENU.find(
        (item) => item.label === 'Catálogos'
      );
      component.activeParent = catalogos;
      fixture.detectChanges();

      const productsLink = fixture.debugElement.query(
        By.css('.sub-menu-item[routerLink="/catalogos/productos"]')
      );
      expect(productsLink).toBeTruthy();

      const clientesLink = fixture.debugElement.query(
        By.css('.sub-menu-item[routerLink="/catalogos/clientes"]')
      );
      expect(clientesLink).toBeTruthy();

      const canalesLink = fixture.debugElement.query(
        By.css('.sub-menu-item[routerLink="/catalogos/canales-venta"]')
      );
      expect(canalesLink).toBeTruthy();
    });
  });

  describe('Interacción y navegación', () => {
    it('selectMenuItem debe actualizar activeParent cuando item tiene children', () => {
      const catalogos = MAIN_MENU.find(
        (item) => item.label === 'Catálogos'
      );

      if (catalogos) {
        component.selectMenuItem(catalogos);
        expect(component.activeParent).toBe(catalogos);
      }
    });

    it('Debe actualizar activeParent cuando NavigationEnd event ocurre', () => {
      (router as any).url = '/catalogos/productos';

      fixture.detectChanges();

      // Simular NavigationEnd event
      routerEventsSubject.next(new NavigationEnd(1, '/catalogos/productos', '/catalogos/productos'));

      fixture.detectChanges();

      // activeParent debería ser Catálogos
      expect(component.activeParent?.label).toBe('Catálogos');
    });

    it('Debe determinar activeParent correcto basado en ruta actual', () => {
      (router as any).url = '/logistica/envios';
      
      component.ngOnInit();

      // activeParent debería ser Logística
      expect(component.activeParent?.label).toBe('Logística');
    });

    it('Debe determinar activeParent para rutas de Inventario', () => {
      (router as any).url = '/inventario/kardex';
      
      component.ngOnInit();

      expect(component.activeParent?.label).toBe('Inventario');
    });

    it('Debe determinar activeParent para rutas de Configuración', () => {
      (router as any).url = '/config/auditoria';
      
      component.ngOnInit();

      expect(component.activeParent?.label).toBe('Configuración');
    });

    it('Debe determinar activeParent para rutas de Compras', () => {
      (router as any).url = '/compras/ordenes';
      
      component.ngOnInit();

      expect(component.activeParent?.label).toBe('Compras');
    });

    it('Debe limpiar activeParent si ruta no coincide con ningún submenú', () => {
      (router as any).url = '/dashboard';
      
      component.ngOnInit();

      expect(component.activeParent).toBeUndefined();
    });
  });

  describe('Limpeza y ciclo de vida', () => {
    it('Debe desuscribirse de router events en ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Estilos y presentación', () => {
    it('Debe aplicar clase active a item actual del menú principal', () => {
      (router as any).url = '/dashboard';

      fixture.detectChanges();

      const dashboardLink = fixture.debugElement.queryAll(
        By.css('.main-menu a')
      ).find((el) => el.nativeElement.textContent.includes('Dashboard'));

      expect(
        dashboardLink?.nativeElement.classList.contains('active')
      ).toBe(true);
    });

    it('Debe renderizar iconos en items del menú', () => {
      fixture.detectChanges();

      const menuIcons = fixture.debugElement.queryAll(By.css('.menu-icon'));
      expect(menuIcons.length).toBeGreaterThan(0);
    });
  });
});
