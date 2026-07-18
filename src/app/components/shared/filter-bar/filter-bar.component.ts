import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

/**
 * Chip de filtro activo — representa un filtro seleccionado
 */
export interface ActiveFilterChip {
  /** Identificador único del filtro */
  key: string;
  /** Etiqueta visible en el chip */
  label: string;
  /** Valor del filtro (para referencia) */
  value?: any;
}

/**
 * FilterBarComponent — Barra de filtros estándar reutilizable
 *
 * Fase 3 — Listados y Filtros
 *
 * Características:
 * - Campo de búsqueda con debounce configurable
 * - Chips de filtros activos con botón de eliminar por chip
 * - Botón "Limpiar todos"
 * - Content projection para filtros adicionales (dropdowns, selects)
 * - Responsive mobile
 *
 * Uso:
 * ```html
 * <app-filter-bar
 *   [searchPlaceholder]="'Buscar por número...'"
 *   [activeFilters]="activeFilters"
 *   (searchChange)="onSearch($event)"
 *   (filterRemoved)="onRemoveFilter($event)"
 *   (filtersCleared)="onClearFilters()">
 *   <!-- Filtros adicionales via content projection -->
 *   <mat-form-field>...</mat-form-field>
 * </app-filter-bar>
 * ```
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  styleUrls: ['./filter-bar.component.scss'],
  template: `
    <div class="filter-bar" [class.filter-bar--has-chips]="activeFilters.length > 0">

      <!-- Fila principal: búsqueda + filtros adicionales + limpiar -->
      <div class="filter-bar__row">

        <!-- Campo de búsqueda -->
        <div class="filter-bar__search">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
            <mat-icon matPrefix class="search-prefix">search</mat-icon>
            <input
              matInput
              [formControl]="searchControl"
              [placeholder]="searchPlaceholder"
              [attr.aria-label]="searchPlaceholder"
              autocomplete="off"
            />
            <button
              *ngIf="searchControl.value"
              mat-icon-button
              matSuffix
              (click)="clearSearch()"
              matTooltip="Limpiar búsqueda"
              class="clear-search-btn"
              type="button"
            >
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- Slot para filtros adicionales (content projection) -->
        <div class="filter-bar__extra" *ngIf="showExtraFilters">
          <ng-content></ng-content>
        </div>

        <!-- Acciones de filtros -->
        <div class="filter-bar__actions">
          <button
            *ngIf="activeFilters.length > 0 || searchControl.value"
            mat-stroked-button
            class="clear-all-btn"
            (click)="clearAll()"
            matTooltip="Limpiar todos los filtros"
            type="button"
          >
            <mat-icon>filter_alt_off</mat-icon>
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      <!-- Chips de filtros activos -->
      <div class="filter-bar__chips" *ngIf="activeFilters.length > 0">
        <span class="chips-label">Filtros activos:</span>
        <mat-chip-set>
          <mat-chip
            *ngFor="let filter of activeFilters"
            (removed)="removeFilter(filter)"
            class="filter-chip"
          >
            {{ filter.label }}
            <button matChipRemove [attr.aria-label]="'Eliminar filtro ' + filter.label">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>
      </div>

    </div>
  `,
})
export class FilterBarComponent implements OnInit, OnDestroy {
  /** Placeholder del campo de búsqueda */
  @Input() searchPlaceholder = 'Buscar...';

  /** Valor inicial de búsqueda */
  @Input() initialSearch = '';

  /** Debounce en ms para el evento searchChange */
  @Input() debounceMs = 300;

  /** Chips de filtros activos a mostrar */
  @Input() activeFilters: ActiveFilterChip[] = [];

  /** Si hay filtros extra en el ng-content */
  @Input() showExtraFilters = false;

  /** Emite el término de búsqueda (con debounce) */
  @Output() searchChange = new EventEmitter<string>();

  /** Emite el chip eliminado */
  @Output() filterRemoved = new EventEmitter<ActiveFilterChip>();

  /** Emite cuando se limpian todos los filtros */
  @Output() filtersCleared = new EventEmitter<void>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.initialSearch) {
      this.searchControl.setValue(this.initialSearch, { emitEvent: false });
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.searchChange.emit(value ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  removeFilter(chip: ActiveFilterChip): void {
    this.filterRemoved.emit(chip);
  }

  clearAll(): void {
    this.searchControl.setValue('');
    this.filtersCleared.emit();
  }
}
