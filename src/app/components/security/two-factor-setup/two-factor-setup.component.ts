import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Componente de Configuración de Autenticación de Dos Factores - FASE 5
 * 
 * Pantalla para que los usuarios configuren 2FA (TOTP).
 * Este es un stub de UI para la FASE 5.
 * La lógica real de generación de QR y validación se implementará en FASE 6.
 * 
 * Flujo esperado:
 * 1. Mostrar código QR (placeholder en FASE 5)
 * 2. Mostrar código de backup
 * 3. Pedir confirmación con código OTP
 * 4. Guardar en backend
 */
@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatStepperModule,
    MatDividerModule
  ],
  template: `
    <div class="two-factor-setup-container">
      <h2>Configurar Autenticación de Dos Factores</h2>
      <p class="subtitle">
        Aumenta la seguridad de tu cuenta habilitando autenticación de dos factores
      </p>

      <mat-stepper class="two-factor-stepper" #stepper>
        <!-- Paso 1: Información -->
        <mat-step [stepControl]="step1Form" label="Información">
          <div class="step-content">
            <p>
              La autenticación de dos factores (2FA) proporciona una capa adicional de seguridad.
              Necesitarás una aplicación autenticadora como:
            </p>
            <ul class="authenticator-list">
              <li>Google Authenticator</li>
              <li>Microsoft Authenticator</li>
              <li>Authy</li>
              <li>FreeOTP</li>
            </ul>
            <div class="step-actions">
              <button mat-raised-button color="primary" matStepperNext>
                Continuar
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Paso 2: Código QR -->
        <mat-step label="Escanear QR">
          <div class="step-content">
            <p>Escanea este código QR con tu aplicación autenticadora:</p>
            
            <div class="qr-placeholder">
              <mat-icon>qr_code_2</mat-icon>
              <p>[Código QR - implementar en FASE 6]</p>
            </div>

            <p class="security-note">
              <mat-icon>lock</mat-icon>
              Si no puedes escanear el código, usa este código manual:
            </p>
            <div class="manual-code">
              <code>JBSWY3DPEBLW64TMMQ======</code>
              <button mat-icon-button (click)="copyManualCode()">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Atrás</button>
              <button mat-raised-button color="primary" matStepperNext>
                Siguiente
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Paso 3: Códigos de Backup -->
        <mat-step label="Códigos de Backup">
          <div class="step-content">
            <p>
              Guarda estos códigos de backup en un lugar seguro.
              Úsalos si pierdes acceso a tu aplicación autenticadora:
            </p>
            
            <div class="backup-codes">
              <div class="code-item" *ngFor="let code of backupCodes">
                {{ code }}
              </div>
            </div>

            <button mat-stroked-button (click)="downloadBackupCodes()">
              <mat-icon>download</mat-icon>
              Descargar Códigos
            </button>

            <p class="warning-note">
              <mat-icon>warning</mat-icon>
              No compartas estos códigos con nadie. Guárdalos en un lugar seguro.
            </p>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Atrás</button>
              <button mat-raised-button color="primary" matStepperNext>
                Verificar
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Paso 4: Verificar Código -->
        <mat-step [stepControl]="verificationForm" label="Verificación">
          <div class="step-content">
            <p>
              Ingresa el código de 6 dígitos que ves en tu aplicación autenticadora:
            </p>

            <form [formGroup]="verificationForm">
              <mat-form-field appearance="fill">
                <mat-label>Código de verificación</mat-label>
                <input
                  matInput
                  formControlName="otpCode"
                  placeholder="000000"
                  maxlength="6"
                  pattern="[0-9]{6}"
                >
                <mat-error *ngIf="verificationForm.get('otpCode')?.hasError('required')">
                  El código es requerido
                </mat-error>
                <mat-error *ngIf="verificationForm.get('otpCode')?.hasError('pattern')">
                  Ingresa un código de 6 dígitos
                </mat-error>
              </mat-form-field>
            </form>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Atrás</button>
              <button
                mat-raised-button
                color="accent"
                (click)="completeTwoFactorSetup()"
                [disabled]="verificationForm.invalid || setupInProgress"
              >
                <mat-progress-bar
                  *ngIf="setupInProgress"
                  mode="indeterminate"
                  class="inline-progress"
                ></mat-progress-bar>
                {{ setupInProgress ? 'Configurando...' : 'Completar Configuración' }}
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .two-factor-setup-container {
      max-width: 600px;
      margin: 32px auto;
      padding: 24px;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .subtitle {
      color: #999;
      margin: 0 0 32px 0;
      font-size: 14px;
    }

    .step-content {
      padding: 24px 0;
    }

    .authenticator-list {
      list-style: none;
      padding: 0;
      margin: 16px 0;
    }

    .authenticator-list li {
      padding: 8px 0;
      color: #666;
      display: flex;
      align-items: center;
    }

    .authenticator-list li::before {
      content: '✓';
      color: #4caf50;
      font-weight: bold;
      margin-right: 8px;
    }

    .qr-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      background: #fafafa;
      margin: 24px 0;
    }

    .qr-placeholder mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
      margin-bottom: 16px;
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }

    .security-note mat-icon {
      color: #ff9800;
    }

    .manual-code {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      margin: 12px 0;
    }

    .manual-code code {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 2px;
      flex-grow: 1;
    }

    .manual-code button {
      flex-shrink: 0;
    }

    .backup-codes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 24px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .code-item {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      text-align: center;
    }

    .warning-note {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      margin: 24px 0;
      color: #856404;
      font-size: 13px;
    }

    .warning-note mat-icon {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .inline-progress {
      height: 2px;
      margin-bottom: 8px;
    }

    mat-form-field {
      width: 100%;
    }

    @media (max-width: 600px) {
      .two-factor-setup-container {
        margin: 16px;
        padding: 16px;
      }

      .backup-codes {
        grid-template-columns: 1fr;
      }

      .step-actions {
        flex-direction: column-reverse;
      }

      .step-actions button {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorSetupComponent implements OnInit {
  step1Form: FormGroup;
  verificationForm: FormGroup;
  setupInProgress = false;
  backupCodes: string[] = [
    'BACKUP-CODE-0001',
    'BACKUP-CODE-0002',
    'BACKUP-CODE-0003',
    'BACKUP-CODE-0004',
    'BACKUP-CODE-0005',
    'BACKUP-CODE-0006',
    'BACKUP-CODE-0007',
    'BACKUP-CODE-0008'
  ];

  constructor(private formBuilder: FormBuilder) {
    this.step1Form = this.formBuilder.group({});
    this.verificationForm = this.formBuilder.group({
      otpCode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]]
    });
  }

  ngOnInit(): void {
    // Inicialización si es necesario
  }

  /**
   * Copiar código manual al portapapeles
   */
  copyManualCode(): void {
    const code = 'JBSWY3DPEBLW64TMMQ======';
    navigator.clipboard.writeText(code).then(() => {
      // Notificación de éxito (integrar con NotificationService en FASE 6)
      console.log('Código copiado');
    });
  }

  /**
   * Descargar códigos de backup
   */
  downloadBackupCodes(): void {
    const content = this.backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'backup-codes-2fa.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Completar configuración de 2FA
   * TODO: Integrar con backend en FASE 6
   */
  completeTwoFactorSetup(): void {
    if (this.verificationForm.invalid) {
      return;
    }

    this.setupInProgress = true;
    const otpCode = this.verificationForm.get('otpCode')?.value;

    // Simular delay de backend
    setTimeout(() => {
      this.setupInProgress = false;
      console.log('2FA Setup completed with OTP:', otpCode);
      // TODO: Llamar a AuthService para guardar 2FA en backend
      // TODO: Mostrar notificación de éxito
      // TODO: Redirigir a dashboard
    }, 2000);
  }
}
