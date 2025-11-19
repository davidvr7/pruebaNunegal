import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private static readonly TTL_MS = 60 * 60 * 1000; // 1 hour

  get<T>(key: string): T | null {
    if (!this.canUseStorage()) {
      return null;
    }

    try {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) {
        return null;
      }

      const parsed: CacheEntry<T> = JSON.parse(rawValue);
      if (Date.now() - parsed.timestamp > CacheService.TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn(`Cache get failed for key ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.canUseStorage()) {
      return;
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Cache set failed for key ${key}`, error);
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
