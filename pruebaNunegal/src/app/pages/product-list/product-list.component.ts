import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { AlertService } from '../../core/services/alert.service';
import { SearchComponent } from '../../shared/components/search/search.component';

type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'brand';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private static readonly MAX_VISIBLE = 8;

  @ViewChild(SearchComponent) private searchComponent?: SearchComponent;
  private readonly destroyRef = inject(DestroyRef);
  private readonly maxVisibleProducts = ProductListComponent.MAX_VISIBLE;

  protected products: Product[] = [];
  protected filteredProducts: Product[] = [];
  protected visibleProducts: Product[] = [];

  protected loading = true;
  protected errorMessage = '';
  protected searchTerm = '';
  protected selectedSort: ProductSort = 'featured';

  protected stats = {
    total: 0,
    brands: 0
  };

  protected readonly sortOptions: { label: string; value: ProductSort }[] = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price-asc', label: 'Precio (menor a mayor)' },
    { value: 'price-desc', label: 'Precio (mayor a menor)' },
    { value: 'brand', label: 'Marca (A-Z)' }
  ];
  protected readonly skeletonPlaceholders = Array.from({ length: ProductListComponent.MAX_VISIBLE });

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  protected get hasActiveFilters(): boolean {
    return Boolean(this.searchTerm) || this.selectedSort !== 'featured';
  }

  protected onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  protected onSortChange(sort: ProductSort): void {
    this.selectedSort = sort;
    this.applyFilters();
  }

  protected onSortSelectionChange(value: string): void {
    this.onSortChange(value as ProductSort);
  }

  protected resetFilters(): void {
    this.searchTerm = '';
    this.selectedSort = 'featured';
    this.searchComponent?.clear();
    this.applyFilters();
  }

  protected onSelectProduct(productId?: string): void {
    if (productId) {
      this.router.navigate(['/product', productId]);
    }
  }

  protected retry(): void {
    this.loadProducts(true);
  }

  protected trackByProductId(_: number, item: Product): string {
    return item.id;
  }

  private loadProducts(notifySuccess: boolean = false): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.productService
      .getProducts(ProductListComponent.MAX_VISIBLE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.stats = {
            total: products.length,
            brands: new Set(products.map((product) => product.brand)).size
          };
          this.applyFilters();
          this.loading = false;
          if (notifySuccess) {
            this.alertService.success('Catálogo actualizado correctamente.');
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'No se pudieron cargar los productos. Inténtalo de nuevo.';
          this.alertService.error(this.errorMessage, { autoClose: false });
          this.cdr.markForCheck();
        }
      });
  }

  private applyFilters(): void {
    const normalized = this.searchTerm.trim().toLowerCase();
    let result = [...this.products];

    if (normalized) {
      result = result.filter((product) => {
        const haystack = `${product.brand} ${product.model}`.toLowerCase();
        return haystack.includes(normalized);
      });
    }

    this.filteredProducts = this.sortProducts(result, this.selectedSort);
    this.visibleProducts = this.filteredProducts.slice(0, this.maxVisibleProducts);
    this.cdr.markForCheck();
  }

  private sortProducts(products: Product[], sort: ProductSort): Product[] {
    switch (sort) {
      case 'price-asc':
        return [...products].sort((a, b) => this.comparePricesAsc(a, b));
      case 'price-desc':
        return [...products].sort((a, b) => this.comparePricesDesc(a, b));
      case 'brand':
        return [...products].sort((a, b) => a.brand.localeCompare(b.brand));
      default:
        return [...products];
    }
  }

  private comparePricesAsc(a: Product, b: Product): number {
    const priceA = this.getNumericPrice(a);
    const priceB = this.getNumericPrice(b);

    if (priceA === null && priceB === null) {
      return 0;
    }

    if (priceA === null) {
      return 1;
    }

    if (priceB === null) {
      return -1;
    }

    return priceA - priceB;
  }

  private comparePricesDesc(a: Product, b: Product): number {
    const priceA = this.getNumericPrice(a);
    const priceB = this.getNumericPrice(b);

    if (priceA === null && priceB === null) {
      return 0;
    }

    if (priceA === null) {
      return 1;
    }

    if (priceB === null) {
      return -1;
    }

    return priceB - priceA;
  }

  private getNumericPrice(product: Product): number | null {
    if (!product.price) {
      return null;
    }

    const parsed = Number(product.price);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
