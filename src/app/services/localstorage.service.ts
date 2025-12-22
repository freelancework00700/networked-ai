import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

export enum KEYS {
  USERS = 'users',
  ONBOARDED = 'onboarded'
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  // checks if the code is running in a browser environment with localstorage available.
  private get canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  getItem(key: KEYS): string | null {
    if (!this.canUseStorage) return null;

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: KEYS, value: string): void {
    if (!this.canUseStorage) return;

    try {
      localStorage.setItem(key, value);
    } catch {
      // silently fail if storage is full or unavailable
    }
  }

  removeItem(key: KEYS): void {
    if (!this.canUseStorage) return;

    try {
      localStorage.removeItem(key);
    } catch {
      // silently fail if storage is unavailable
    }
  }

  clear(): void {
    if (!this.canUseStorage) return;

    try {
      localStorage.clear();
    } catch {
      // silently fail if storage is unavailable
    }
  }
}
