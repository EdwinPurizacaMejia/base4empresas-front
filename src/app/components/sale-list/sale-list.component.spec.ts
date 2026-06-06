import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SaleListComponent } from './sale-list.component';
import { SalesService } from '../../services/sales.service';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  // NO se puede “pisar” un import standalone ya incluido en SaleListComponent.
  // Por eso usamos el mismo selector, pero via schemas (ver TestBed).
  selector: 'app-generic-data-table',
  template: '',
})
class GenericDataTableStubComponent {
  @Input() data: any[] = [];
  @Input() config: any;
  @Input() loading = false;
  @Input() error = '';
}

describe('SaleListComponent', () => {
  let component: SaleListComponent;
  let fixture: ComponentFixture<SaleListComponent>;

  const salesServiceMock = {
    getSales: jasmine.createSpy('getSales').and.returnValue(
      of([
        {
          id: 'S1',
          number: 'V-0001',
          customer_id: null,
          warehouse_id: 'W1',
          sale_date: '2026-05-24T00:00:00Z',
          status: 'CONFIRMED',
          payment_status: 'PAID',
          subtotal: 90,
          tax: 10,
          total: 100,
          notes: null,
          items: [],
          cost_total: 20,
          gross_profit: 80,
          gross_margin_pct: 80,
        },
        {
          id: 'S2',
          number: 'V-0002',
          customer_id: null,
          warehouse_id: 'W1',
          sale_date: '2026-05-24T00:00:00Z',
          status: 'CONFIRMED',
          payment_status: 'PAID',
          subtotal: 90,
          tax: 10,
          total: 100,
          notes: null,
          items: [],
          // sin costos (undefined) para validar "—"
        },
      ])
    ),
  };

  const searchServiceMock = {
    searchTerm$Debounced: of(''),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // SaleListComponent es standalone e importa GenericDataTableComponent internamente.
      // Aún así, para Material necesitamos NoopAnimationsModule en tests.
      imports: [SaleListComponent, NoopAnimationsModule],
      providers: [
        { provide: SalesService, useValue: salesServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include cost columns in tableConfig', () => {
    const keys = component.tableConfig.columns.map((c) => c.key);
    expect(keys).toContain('cost_total');
    expect(keys).toContain('gross_profit');
    expect(keys).toContain('gross_margin_pct');
  });

  it('should render "—" when cost_total is undefined (formatter)', () => {
    const costCol = component.tableConfig.columns.find((c) => c.key === 'cost_total');
    expect(costCol).toBeTruthy();

    // row S2 no tiene cost_total
    const dash = costCol!.formatter ? costCol!.formatter((component.sales as any)[1].cost_total) : '';
    expect(dash).toBe('—');
  });
});
