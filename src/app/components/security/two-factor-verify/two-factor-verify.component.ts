import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Componente de Verificación de Autenticación de Dos Factores - FASE 5
 * 
 * Modal/Formulario para verificar código OTP durante login o operaciones sensibles.
 * Este es un stub de UI para la FASE 5.
 * La validación real del OTP contra TOTP se implementará en FASE 6.
 * 
 * Uso:
 * ```html
 * <app-two-factor-verify
 *   [isOpen]="true"
 *   (verified)="onVerified($event)"
 *   (cancelled)="onCancelled()"
 * ></app-two-factor-verify>
 * ```
 */
@Component({
  selector: 'app-two-factor-verify',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule
  ],
  template: `
    <div class="two-factor-verify-container" *ngIf="isOpen">
      <div class="overlay" (click)="cancel()"></div>
      
      <mat-card class="verify-card">
        <mat-card-header>
          <h2>Verificación de Seguridad</h2>
          <p>Ingresa el código de 6 dígitos de tu aplicación autenticadora</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="verificationForm" (ngSubmit)="verify()">
            <!-- Código OTP -->
            <mat-form-field appearance="fill" class="otp-field">
              <mat-label>Código OTP</mat-label>
              <input
                matInput
                formControlName="otpCode"
                placeholder="000000"
                maxlength="6"
                pattern="[0-9]{6}"
                inputmode="numeric"
                autocomplete="one-time-code"
              >
              <mat-icon matPrefix>lock</mat-icon>
              <mat-error *ngIf="verificationForm.get('otpCode')?.hasError('required')">
                El código es requerido
              </mat-error>
              <mat-error *ngIf="verificationForm.get('otpCode')?.hasError('pattern')">
                Ingresa un código de 6 dígitos
              </mat-error>
            </mat-form-field>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="error-message">
              <mat-icon>error</mat-icon>
              {{ errorMessage }}
            </div>

            <!-- Progress Bar -->
            <mat-progress-bar
              *ngIf="verificationInProgress"
              mode="indeterminate"
              class="verification-progress"
            ></mat-progress-bar>

            <!-- Actions -->
            <div class="actions">
              <button
                mat-button
                type="button"
                (click)="cancel()"
                [disabled]="verificationInProgress"
              >
                Cancelar
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="verificationForm.invalid || verificationInProgress"
              >
                {{ verificationInProgress ? 'Verificando...' : 'Verificar' }}
              </button>
            </div>

            <!-- Help Text -->
            <p class="help-text">
              <mat-icon>info</mat-icon>
              ¿No tienes acceso a tu aplicación autenticadora?
              <button mat-button type="button" (click)="useBackupCode()">
                Usar código de backup
              </button>
            </p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .two-factor-verify-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .verify-card {
      position: relative;
      width: 90%;
      max-width: 400px;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    mat-card-header {
      border-bottom: 1px solid #e0e0e0;
      padding: 24px;
      margin: 0;
    }

    mat-card-header h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    mat-card-header p {
      margin: 0;
      color: #999;
      font-size: 13px;
    }

    mat-card-content {
      padding: 24px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .otp-field {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      border-left: 4px solid #f44336;
      border-radius: 4px;
      color: #c62828;
      font-size: 13px;
    }

    .error-message mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .verification-progress {
      height: 2px;
      margin: 0 -24px;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .actions button {
      min-width: 100px;
    }

    .help-text {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 12px;
      color: #666;
    }

    .help-text mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .help-text button {
      text-transform: none;
      padding: 0;
      height: auto;
      font-size: 12px;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .verify-card {
        width: 95%;
        border-radius: 4px;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions button {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorVerifyComponent {
  @Input() isOpen = false;
  @Output() verified = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() backupCodeRequested = new EventEmitter<void>();

  verificationForm: FormGroup;
  verificationInProgress = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.verificationForm = this.formBuilder.group({
      otpCode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]]
    });
  }

  /**
   * Verificar código OTP
   * TODO: Integrar validación real en FASE 6
   */
  verify(): void {
    if (this.verificationForm.invalid) {
      return;
    }

    this.verificationInProgress = true;
    this.errorMessage = null;
    const otpCode = this.verificationForm.get('otpCode')?.value;

    // Simular delay de validación backend
    setTimeout(() => {
      // Simulación: aceptar cualquier código distinto a "000000"
      if (otpCode === '000000') {
        this.errorMessage = 'Código inválido. Por favor, intenta nuevamente.';
        this.verificationInProgress = false;
      } else {
        this.verificationInProgress = false;
        this.verified.emit(otpCode);
        this.reset();
      }
    }, 1500);
  }

  /**
   * Cancelar verificación
   */
  cancel(): void {
    this.cancelled.emit();
    this.reset();
  }

  /**
   * Solicitar código de backup
   */
  useBackupCode(): void {
    this.backupCodeRequested.emit();
    // En FASE 6: cambiar el modal para aceptar backup codes
  }

  /**
   * Resetear el formulario
   */
  private reset(): void {
    this.verificationForm.reset();
    this.errorMessage = null;
    this.verificationInProgress = false;
  }
}
