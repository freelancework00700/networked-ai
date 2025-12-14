import { Injectable } from '@angular/core';

export enum KEYS {
  TOKEN = 'token'
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  getItem(key: KEYS): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: KEYS, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: KEYS): void {
    localStorage.removeItem(key);
  }
}
