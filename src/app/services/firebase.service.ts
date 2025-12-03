import { getApp } from 'firebase/app';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  public readonly auth = this.getFirebaseAuth();

  private getFirebaseAuth() {
    if (Capacitor.isNativePlatform()) {
      // use IndexedDB persistence for native platforms
      return initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
    } else {
      // use default persistence for web platforms
      return getAuth(getApp());
    }
  }
}
