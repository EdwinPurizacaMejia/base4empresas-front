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
import { CategoriesService, CategoryDto } from '../../services/categories.service';
import { UnitsService, UnitDto } from '../../services/units.service';


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
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  loading = false;
  categories: CategoryDto[] = [];
  units: UnitDto[] = [];
  private editingProductId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private unitsService: UnitsService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData | null
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategoriesAndUnits();

    if (this.data?.product) {
      this.editingProductId = this.data.product?.id ?? null;
      this.patchFormForEdit(this.data.product);
    }
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
    this.categoriesService
      .listCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories ?? [];
        },
        error: () => {
          this.snackBar.open('No se pudieron cargar las categorías', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });

    this.unitsService
      .listUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units) => {
          this.units = units ?? [];
        },
        error: () => {
          this.snackBar.open('No se pudieron cargar las unidades', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
  }

  private patchFormForEdit(product: any): void {
    // El API del listado devuelve category y unit como objetos
    // pero el formulario trabaja con category_id y unit_id.
    this.productForm.patchValue({
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      category_id: product?.category?.id ?? product?.category_id ?? '',
      unit_id: product?.unit?.id ?? product?.unit_id ?? '',
      sale_price: product?.sale_price ?? 0,
      purchase_price: product?.purchase_price ?? 0,
      min_stock: product?.min_stock ?? 0,
      is_active: product?.is_active ?? true,
      description: product?.description ?? ''
    });
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

    const request$ = this.editingProductId
      ? this.productsService.updateProduct(this.editingProductId, formData)
      : this.productsService.createProduct(formData);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.editingProductId ? '✓ Producto actualizado exitosamente' : '✓ Producto creado exitosamente',
            'Cerrar',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            }
          );
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          this.loading = false;
          const errorMsg = err.error?.detail || (this.editingProductId ? 'Error al actualizar el producto' : 'Error al crear el producto');
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
