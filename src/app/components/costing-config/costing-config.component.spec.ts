import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CostingConfigComponent } from './costing-config.component';
import { WarehouseService } from '../../services/warehouse.service';
import { CostingConfigService } from '../../services/costing-config.service';
import { NotificationService } from '../../services/notification.service';

describe('CostingConfigComponent', () => {
  let component: CostingConfigComponent;
  let fixture: ComponentFixture<CostingConfigComponent>;

  const warehouseServiceMock = {
    getWarehouses: jasmine.createSpy('getWarehouses').and.returnValue(
      of([
        { id: 'W1', name: 'Almacén 1', is_active: true },
        { id: 'W2', name: 'Almacén 2', is_active: true },
      ])
    ),
  };

  const costingConfigServiceMock = {
    getCostingConfig: jasmine.createSpy('getCostingConfig').and.returnValue(of({ warehouse_id: 'W1', method: 'PP' })),
    updateCostingConfig: jasmine
      .createSpy('updateCostingConfig')
      .and.returnValue(of({ warehouse_id: 'W1', method: 'FIFO' })),
  };

  const notificationServiceMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
    info: jasmine.createSpy('info'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostingConfigComponent],
      providers: [
        provideAnimations(),
        { provide: WarehouseService, useValue: warehouseServiceMock },
        { provide: CostingConfigService, useValue: costingConfigServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load warehouses on init', () => {
    expect(warehouseServiceMock.getWarehouses).toHaveBeenCalledWith({ isActive: true });
    expect(component.warehouses.length).toBeGreaterThan(0);
  });

  it('should load costing config when selecting a warehouse', () => {
    component.onSelectWarehouse('W1');

    expect(costingConfigServiceMock.getCostingConfig).toHaveBeenCalledWith('W1');
  });

  it('should save costing config and show success notification', () => {
    component.selectedWarehouseId = 'W1';
    component.selectedMethod = 'FIFO';

    component.onSave();

    expect(costingConfigServiceMock.updateCostingConfig).toHaveBeenCalledWith('W1', { method: 'FIFO' });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });
});
