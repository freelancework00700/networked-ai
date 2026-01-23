import { UserService } from './user.service';
import { inject, Injectable } from '@angular/core';
import { NavigationService } from './navigation.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalStorageService, KEYS } from './localstorage.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  // services
  private userService = inject(UserService);
  private navigationService = inject(NavigationService);
  private localStorageService = inject(LocalStorageService);

  async initialize(): Promise<void> {
    const permissionResult = await PushNotifications.requestPermissions();

    if (permissionResult.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      console.warn('Push notification permission denied');
    }

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', ({ value }) => {
      console.log('Push registration success, token: ' + value);
      this.localStorageService.setItem(KEYS.FCM_TOKEN, value);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', () => this.navigationService.navigateForward('/notification'));
  }

  async updateFcmTokenInDatabase(): Promise<void> {
    try {
      const token = this.localStorageService.getItem(KEYS.FCM_TOKEN);

      if (!token) {
        console.warn('FCM token not available in localStorage');
        return;
      }

      await this.userService.updateFcmTokenAndLocation(token);
      console.log('FCM token updated successfully in database');
    } catch (error) {
      console.error('Error updating FCM token in database:', error);
    }
  }
}
