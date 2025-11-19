import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, defer, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { CacheService } from './cache.service';
import { Product, ProductDetail, ProductOption, ProductOptions } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly productListCacheKey = 'products-cache';

  constructor(private http: HttpClient, private cache: CacheService) {}

  getProducts(limit?: number): Observable<Product[]> {
    return defer(() => {
      const cacheKey = limit ? `${this.productListCacheKey}-${limit}` : this.productListCacheKey;
      const cached = this.cache.get<Product[]>(cacheKey);
      if (cached) {
        return of(cached);
      }

      const url = `${this.baseUrl}/product`;
      let params = new HttpParams();
      if (typeof limit === 'number') {
        params = params.set('limit', limit.toString());
      }

      return this.http.get<Product[]>(url, { params }).pipe(
        tap((products) => this.cache.set(cacheKey, products))
      );
    });
  }

  getProductDetails(id: string): Observable<ProductDetail> {
    const cacheKey = `product-${id}`;
    return defer(() => {
      const cached = this.cache.get<ProductDetail>(cacheKey);
      if (cached) {
        return of(cached);
      }

      const url = `${this.baseUrl}/product/${id}`;
      return this.http.get<ProductDetail>(url).pipe(
        map((detail) => this.normalizeDetail(detail)),
        tap((detail) => this.cache.set(cacheKey, detail))
      );
    });
  }

  private normalizeDetail(detail: ProductDetail): ProductDetail {
    const normalized: ProductDetail = {
      ...detail,
      primaryCamera: this.normalizeValue(detail.primaryCamera),
      secondaryCmera: this.normalizeValue(detail.secondaryCmera),
      internalMemory: this.normalizeValue(detail.internalMemory),
      colors: this.normalizeValue(detail.colors),
      options: this.normalizeOptions(detail.options)
    };

    return normalized;
  }

  private normalizeOptions(options?: ProductOptions): ProductOptions {
    if (!options) {
      return { colors: [], storages: [] };
    }

    return {
      colors: this.normalizeOptionArray(options.colors),
      storages: this.normalizeOptionArray(options.storages)
    };
  }

  private normalizeOptionArray(list?: ProductOption[] | string[]): ProductOption[] {
    if (!list) {
      return [];
    }

    return list.map((item) => {
      if (typeof item === 'string') {
        return { code: item, name: item };
      }
      return { ...item, code: String(item.code) };
    });
  }

  private normalizeValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(', ');
    }

    return value as string | undefined;
  }
}
