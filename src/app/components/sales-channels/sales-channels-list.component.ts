import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

import { SalesChannel } from '../../models/sales-channel.model';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';
import { SalesChannelFormComponent } from './sales-channel-form.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-sales-channels-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    SalesChannelFormComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './sales-channels-list.component.html',
  styleUrls: ['./sales-channels-list.component.scss']
})
export class SalesChannelsListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  channels: SalesChannel[] = [];
  dataSource = new MatTableDataSource<SalesChannel>([]);
  displayedColumns = ['code', 'name', 'description', 'is_active', 'created_at', 'actions'];
  loading = false;
  error: string | null = null;
  pageSizeOptions = [5, 10, 25, 50];
  private destroy$ = new Subject<void>();

  constructor(
    private channelsService: SalesChannelsService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadChannels();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannels(): void {
    this.loading = true;
    this.error = null;

    this.channelsService
      .getChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SalesChannel[]) => {
          this.channels = data;
          this.dataSource.data = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading channels:', err);
          this.error = 'Error al cargar los canales de venta';
          this.notificationService.error(this.error);
          this.loading = false;
        }
      });
  }

  openCreateForm(): void {
    const dialogRef = this.dialog.open(SalesChannelFormComponent, {
      width: '500px',
      data: { channel: null }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadChannels();
          this.notificationService.success('Canal creado exitosamente');
        }
      });
  }

  openEditForm(channel: SalesChannel): void {
    const dialogRef = this.dialog.open(SalesChannelFormComponent, {
      width: '500px',
      data: { channel }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadChannels();
          this.notificationService.success('Canal actualizado exitosamente');
        }
      });
  }

  toggleChannel(channel: SalesChannel, event: any): void {
    const newState = event.checked;

    this.channelsService
      .toggleChannel(channel.id, newState)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const action = newState ? 'activado' : 'desactivado';
          this.notificationService.success(`Canal ${action} exitosamente`);
          this.loadChannels();
        },
        error: (err) => {
          console.error('Error updating channel:', err);
          this.notificationService.error('Error al actualizar el canal');
          // Revertir el estado del toggle
          event.source.checked = !newState;
        }
      });
  }

  deleteChannel(id: string): void {
    // Mostrar confirmación
    if (confirm('¿Está seguro de que desea eliminar este canal?')) {
      // Implementar eliminación si el backend lo permite
      this.notificationService.info('Funcionalidad de eliminación será implementada en futuras versiones');
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'accent' : 'warn';
  }
}
