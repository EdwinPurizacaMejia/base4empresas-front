import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { of, Subject } from 'rxjs';

import { KardexComponent } from './kardex.component';
import { KardexService } from '../../services/kardex.service';
import { InventoryService } from '../../services/inventory.service';
import { SearchService } from '../../services/search.service';
import { ProductsService } from '../../services/products.service';
import { WarehouseService } from '../../services/warehouse.service';

describe('KardexComponent', () => {
  let component: KardexComponent;
  let fixture: ComponentFixture<KardexComponent>;

  const kardexServiceMock = {
    getKardex: jasmine.createSpy('getKardex').and.returnValue(of([])),
  };

  const inventoryServiceMock = {
    getValuationAt: jasmine.createSpy('getValuationAt').and.returnValue(
      of({
        warehouse_id: 'W1',
        product_id: 'P1',
        at: '2026-01-01T00:00:00.000Z',
        quantity_on_hand: 7,
        avg_unit_cost: 5,
        stock_value: 35,
      })
    ),
  };

  const search$ = new Subject<string>();
  const searchServiceMock = {
    searchTerm$Debounced: search$.asObservable(),
  };

  const productsServiceMock = {
    getProducts: jasmine.createSpy('getProducts').and.returnValue(of([])),
  };

  const warehouseServiceMock = {
    getWarehouses: jasmine.createSpy('getWarehouses').and.returnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: KardexService, useValue: kardexServiceMock },
        { provide: InventoryService, useValue: inventoryServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: ProductsService, useValue: productsServiceMock },
        { provide: WarehouseService, useValue: warehouseServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ product_id: '' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onValuationAtDate should call InventoryService.getValuationAt with ISO date', () => {
    component.selectedWarehouseId = 'W1';
    component.selectedProductId = 'P1';
    component.valuationAt = '2026-01-01T00:00';

    component.onValuationAtDate();

    expect(inventoryServiceMock.getValuationAt).toHaveBeenCalled();
    const args = inventoryServiceMock.getValuationAt.calls.mostRecent().args;
    expect(args[0]).toBe('W1');
    expect(args[1]).toBe('P1');
    expect(typeof args[2]).toBe('string');
    expect(args[2]).toContain('2026-01-01');
  });

  it('loadKardex should call KardexService.getKardex with query params object', () => {
    component.selectedWarehouseId = 'W1';
    component.selectedProductId = 'P1';

    component.loadKardex();

    expect(kardexServiceMock.getKardex).toHaveBeenCalledWith({
      warehouseId: 'W1',
      productId: 'P1',
    });
  });
});
