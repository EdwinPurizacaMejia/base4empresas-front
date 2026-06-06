import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

import { SaleDetailComponent } from './sale-detail.component';
import { SalesService } from '../../services/sales.service';
import { NotificationService } from '../../services/notification.service';

describe('SaleDetailComponent', () => {
  let component: SaleDetailComponent;
  let fixture: ComponentFixture<SaleDetailComponent>;

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  const notificationServiceMock = {
    info: jasmine.createSpy('info'),
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  const saleMock = {
    id: 'S1',
    number: 'V-0001',
    customer_id: null,
    warehouse_id: 'W1',
    sale_date: '2026-05-24T00:00:00Z',
    status: 'completed',
    payment_status: 'paid',
    subtotal: 90,
    tax: 10,
    total: 100,
    notes: null,
    items: [],
    cost_total: 20,
    gross_profit: 80,
    gross_margin_pct: 80,
  };

  it('should create and load sale by id', async () => {
    const salesServiceMock = {
      getSaleById: jasmine.createSpy('getSaleById').and.returnValue(of(saleMock)),
    };

    await TestBed.configureTestingModule({
      imports: [SaleDetailComponent],
      providers: [
        provideAnimations(),
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'S1' })) },
        },
        { provide: SalesService, useValue: salesServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(salesServiceMock.getSaleById).toHaveBeenCalledWith('S1');
    expect(component.sale?.id).toBe('S1');
    expect(component.sale?.cost_total).toBe(20);
  });

  it('should notify stock error when backend returns 409', async () => {
    const salesServiceMock = {
      getSaleById: jasmine.createSpy('getSaleById').and.returnValue(throwError(() => ({ status: 409 }))),
    };

    await TestBed.configureTestingModule({
      imports: [SaleDetailComponent],
      providers: [
        provideAnimations(),
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'S1' })) },
        },
        { provide: SalesService, useValue: salesServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(notificationServiceMock.error).toHaveBeenCalledWith('Stock insuficiente para completar la operación.');
  });
});
