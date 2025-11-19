import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductDetail, ProductOption } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AddToCartRequest } from '../../core/models/cart.model';
import { AlertService } from '../../core/services/alert.service';

interface SpecField {
  label: string;
  key: keyof ProductDetail;
  suffix?: string;
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent {
  private readonly destroyRef = inject(DestroyRef);

  detail?: ProductDetail;
  loading = true;
  errorMessage = '';
  actionMessage = '';
  actionState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  readonly selectionForm = this.fb.group({
    color: ['', Validators.required],
    storage: ['', Validators.required]
  });

  readonly specificationFields: SpecField[] = [
    { label: 'CPU', key: 'cpu' },
    { label: 'RAM', key: 'ram' },
    { label: 'Sistema Operativo', key: 'os' },
    { label: 'Pantalla', key: 'displayResolution' },
    { label: 'Batería', key: 'battery' },
    { label: 'Cámara Principal', key: 'primaryCamera' },
    { label: 'Cámara Secundaria', key: 'secondaryCmera' },
    { label: 'Memoria interna', key: 'internalMemory' },
    { label: 'Colores', key: 'colors' },
    { label: 'Dimensiones', key: 'dimentions' },
    { label: 'Peso', key: 'weight', suffix: 'g' },
    { label: 'Conectividad', key: 'networkTechnology' },
    { label: 'Velocidad de red', key: 'networkSpeed' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
      }
    });
  }

  get colorOptions(): ProductOption[] {
    return this.detail?.options?.colors ?? [];
  }

  get storageOptions(): ProductOption[] {
    return this.detail?.options?.storages ?? [];
  }

  get disableSubmit(): boolean {
    return this.selectionForm.invalid || this.actionState === 'loading';
  }

  get colorControl() {
    return this.selectionForm.controls.color;
  }

  get storageControl() {
    return this.selectionForm.controls.storage;
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (!this.detail) {
      return;
    }

    if (this.selectionForm.invalid) {
      this.selectionForm.markAllAsTouched();
      return;
    }

    const payload: AddToCartRequest = {
      id: this.detail.id,
      colorCode: this.selectionForm.value.color as string,
      storageCode: this.selectionForm.value.storage as string
    };

    this.actionState = 'loading';
    this.actionMessage = '';
    this.cdr.markForCheck();

    this.cartService
      .addToCart(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionState = 'success';
          this.actionMessage = 'Producto añadido al carrito correctamente.';
          this.alertService.success(this.actionMessage);
          this.cdr.markForCheck();
        },
        error: () => {
          this.actionState = 'error';
          this.actionMessage = 'No se pudo añadir el producto. Inténtalo de nuevo.';
          this.alertService.error(this.actionMessage, { autoClose: false });
          this.cdr.markForCheck();
        }
      });
  }

  retry(): void {
    const id = this.detail?.id ?? this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(id);
    }
  }

  protected specValue(field: SpecField): string {
    const value = this.detail?.[field.key];
    if (!value) {
      return 'N/A';
    }

    const normalized = Array.isArray(value) ? value.join(', ') : String(value);
    return field.suffix ? `${normalized} ${field.suffix}` : normalized;
  }

  private fetchProduct(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';
    this.actionState = 'idle';
    this.cdr.markForCheck();

    this.productService
      .getProductDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.loading = false;
          this.selectionForm.patchValue({
            color: this.colorOptions[0]?.code ?? '',
            storage: this.storageOptions[0]?.code ?? ''
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los detalles del producto.';
          this.loading = false;
          this.alertService.error(this.errorMessage, { autoClose: false });
          this.cdr.markForCheck();
        }
      });
  }
}
