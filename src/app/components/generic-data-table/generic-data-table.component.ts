import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'custom';
  sortable?: boolean;
  width?: string;
  formatter?: (value: any, row?: any) => string;
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  show?: (row: any) => boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  actions?: TableAction[];
  pageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  searchPlaceholder?: string;
}

@Component({
  selector: 'app-generic-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './generic-data-table.component.html',
  styleUrl: './generic-data-table.component.css'
})
export class GenericDataTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() data: any[] = [];
  @Input() config!: TableConfig;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() totalItems = 0;

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = [];
  searchValue = '';

  ngOnInit(): void {
    this.setupTable();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateDataSource();
    }
  }

  private setupTable(): void {
    if (!this.config) return;

    // Configurar columnas a mostrar
    this.displayedColumns = this.config.columns.map(col => col.key);
    if (this.config.actions && this.config.actions.length > 0) {
      this.displayedColumns.push('actions');
    }

    // Inicializar datasource
    this.updateDataSource();
  }

  private updateDataSource(): void {
    this.dataSource = new MatTableDataSource(this.data);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.searchChange.emit(value);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(event: Sort): void {
    this.sortChange.emit(event);
  }

  getColumnType(key: string): string {
    const column = this.config.columns.find(col => col.key === key);
    return column?.type || 'text';
  }

  formatValue(value: any, key: string, row?: any): string {
    const column = this.config.columns.find(col => col.key === key);
    
    if (column?.formatter) {
      return column.formatter(value, row);
    }

    switch (column?.type) {
      case 'currency':
        return this.formatCurrency(value);
      case 'date':
        return this.formatDate(value);
      case 'number':
        return this.formatNumber(value);
      default:
        return String(value || '');
    }
  }

  private formatCurrency(value: any): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(Number(value));
  }

  private formatDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatNumber(value: any): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('es-CO').format(Number(value));
  }

  isActionVisible(action: TableAction, row: any): boolean {
    if (action.show) {
      return action.show(row);
    }
    return true;
  }

  getEmptyMessage(): string {
    return this.searchValue 
      ? 'No se encontraron resultados' 
      : 'No hay datos disponibles';
  }
}
