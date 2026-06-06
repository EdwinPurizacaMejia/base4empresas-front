import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../services/products.service';
import { SearchService } from '../../services/search.service';
import { NotificationService } from '../../services/notification.service';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideAnimations(),
        {
          provide: ProductsService,
          useValue: {
            getProducts: () => of([]),
          },
        },
        {
          provide: SearchService,
          useValue: {
            searchTerm$Debounced: of(''),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            info: () => {},
            error: () => {},
            warning: () => {},
            success: () => {},
            show: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
