import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductsService } from '../../services/products.service';
import { ConfirmationService } from '../../services/confirmation.service';

interface Category {
  id: number | string;
  name: string;
}

interface Unit {
  id: number | string;
  name: string;
}

interface DialogData {
  product?: any;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  loading = false;
  categories: Category[] = [];
  units: Unit[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategoriesAndUnits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario reactivo con validadores
   */
  private initializeForm(): void {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      category_id: [''],
      unit_id: [''],
      sale_price: [0, [Validators.required, Validators.min(0)]],
      purchase_price: [0, [Validators.required, Validators.min(0)]],
      min_stock: [0, [Validators.required, Validators.min(0)]],
      is_active: [true],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Carga categorías y unidades desde los servicios
   */
  private loadCategoriesAndUnits(): void {
    this.categories = [
      { id: 1, name: 'Electrónica' },
      { id: 2, name: 'Muebles' },
      { id: 3, name: 'Software' },
      { id: 4, name: 'Otros' }
    ];

    this.units = [
      { id: 1, name: 'Unidad (pcs)' },
      { id: 2, name: 'Caja' },
      { id: 3, name: 'Paquete' },
      { id: 4, name: 'Kilogramo (kg)' },
      { id: 5, name: 'Litro (L)' }
    ];
  }

  /**
   * Envía el formulario al backend
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.loading = true;
    const formData = this.productForm.value;

    this.productsService.createProduct(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('✓ Producto creado exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          this.loading = false;
          const errorMsg = err.error?.detail || 'Error al crear el producto';
          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
  }

  /**
   * Cierra el diálogo con confirmación si hay cambios
   */
  onCancel(): void {
    if (this.productForm.dirty) {
      this.confirmationService
        .confirmCancel()
        .pipe(takeUntil(this.destroy$))
        .subscribe(confirmed => {
          if (confirmed) {
            this.dialogRef.close(false);
          }
        });
    } else {
      this.dialogRef.close(false);
    }
  }
}
