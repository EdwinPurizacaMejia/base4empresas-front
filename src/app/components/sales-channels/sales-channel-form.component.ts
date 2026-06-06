import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SalesChannel, SalesChannelCreate, SalesChannelUpdate } from '../../models/sales-channel.model';
import { SalesChannelsService } from '../../services/sales-channels.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-sales-channel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sales-channel-form.component.html',
  styleUrl: './sales-channel-form.component.scss'
})
export class SalesChannelFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  channel: SalesChannel | null = null;

  constructor(
    private fb: FormBuilder,
    private channelsService: SalesChannelsService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<SalesChannelFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { channel: SalesChannel | null }
  ) {
    this.channel = data?.channel || null;
    this.isEditMode = !!this.channel;

    this.form = this.fb.group({
      code: [
        this.channel?.code || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(10)]
      ],
      name: [
        this.channel?.name || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      description: [this.channel?.description || '', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Si es modo edición, hacer que el código sea de solo lectura
    if (this.isEditMode) {
      this.form.get('code')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.error('Por favor completa los campos requeridos');
      return;
    }

    this.loading = true;
    const formValue = this.form.getRawValue();

    if (this.isEditMode && this.channel) {
      // Actualizar
      const payload: SalesChannelUpdate = {
        name: formValue.name,
        description: formValue.description || null
      };

      this.channelsService.updateChannel(this.channel.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating channel:', err);
          this.notificationService.error('Error al actualizar el canal');
          this.loading = false;
        }
      });
    } else {
      // Crear
      const payload: SalesChannelCreate = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description || null
      };

      this.channelsService.createChannel(payload).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating channel:', err);
          this.notificationService.error('Error al crear el canal');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get titleText(): string {
    return this.isEditMode ? 'Editar Canal' : 'Crear Canal de Venta';
  }
}
