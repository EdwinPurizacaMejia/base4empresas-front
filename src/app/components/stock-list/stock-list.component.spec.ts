import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';

import { StockListComponent } from './stock-list.component';
import { StockService } from '../../services/stock.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';
import { WarehouseService } from '../../services/warehouse.service';

describe('StockListComponent', () => {
  let component: StockListComponent;
  let fixture: ComponentFixture<StockListComponent>;

  const stockServiceMock = {
    getStockCurrent: jasmine.createSpy('getStockCurrent').and.returnValue(
      of([
        {
          warehouse_id: 'W1',
          product_id: 'P1',
          quantity_on_hand: 10,
          avg_unit_cost: 2,
          stock_value: 20,
        },
      ])
    ),
  };

  const search$ = new Subject<string>();
  const searchServiceMock = {
    searchTerm$Debounced: search$.asObservable(),
  };

  const notificationServiceMock = {
    info: jasmine.createSpy('info'),
    error: jasmine.createSpy('error'),
  };

  const warehouseServiceMock = {
    getWarehouses: jasmine.createSpy('getWarehouses').and.returnValue(
      of([
        {
          id: 'W1',
          name: 'Almacén 1',
          code: 'A1',
          is_active: true,
        },
      ])
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockListComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: StockService, useValue: stockServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: WarehouseService, useValue: warehouseServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // dispara ngOnInit (carga almacenes)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call StockService.getStockCurrent when selecting a warehouse', () => {
    component.onSelectWarehouse('W1');

    expect(stockServiceMock.getStockCurrent).toHaveBeenCalledWith('W1');
  });

  it('should render quantity_on_hand (not undefined)', async () => {
    component.onSelectWarehouse('W1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('10');
    expect(text).not.toContain('undefined');
  });
});
