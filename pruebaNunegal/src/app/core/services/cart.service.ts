import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AddToCartRequest, AddToCartResponse } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly storageKey = 'cart-count';
  private readonly cartCountSubject = new BehaviorSubject<number>(this.loadPersistedCount());

  constructor(private http: HttpClient) {}

  get cartCount$(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  addToCart(payload: AddToCartRequest): Observable<AddToCartResponse> {
    const url = `${this.baseUrl}/cart`;
    return this.http.post<AddToCartResponse>(url, payload).pipe(
      tap((response) => this.persistCount(response.count))
    );
  }

  private persistCount(count: number): void {
    this.cartCountSubject.next(count);
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, count.toString());
  }

  private loadPersistedCount(): number {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 0;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    return storedValue ? Number(storedValue) || 0 : 0;
  }
}
