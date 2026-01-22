import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { SocketService } from '@/services/socket.service';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { PermissionsService } from '@/services/permissions.service';
import { inject, effect, Component, viewChild } from '@angular/core';
import { PushNotificationService } from '@/services/push-notification.service';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet],
  template: `
    <!-- dynamic routes -->
    <ion-router-outlet />
  `
})
export class AppComponent {
  // services
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private socketService = inject(SocketService);
  private navigationService = inject(NavigationService);
  private permissionsService = inject(PermissionsService);
  private pushNotificationService = inject(PushNotificationService);

  // view child
  private routerOutlet = viewChild(IonRouterOutlet);

  constructor() {
    // set the router outlet to the navigation service
    effect(() => this.navigationService.setRouterOutlet(this.routerOutlet()));

    // update FCM token and location when user is logged in or switches accounts
    effect(() => {
      // user is logged in, update FCM token and location
      const currentUser = this.authService.currentUser();
      if (Capacitor.isNativePlatform() && currentUser?.id) {
        this.pushNotificationService.updateFcmTokenInDatabase();
      }
      this.updateCurrentLocation();
    });

    // add icons
    addIcons(icons);

    // refresh current user from API on app initialization
    this.authService.refreshCurrentUser();

    // initialize push notifications on native platforms
    if (Capacitor.isNativePlatform()) {
      this.pushNotificationService.initialize();
    }
  }

  private async updateCurrentLocation(): Promise<void> {
    try {
      const location = await this.permissionsService.getCurrentLocation();
      if (location) {
        await this.userService.updateFcmTokenAndLocation('', location.latitude, location.longitude);
      } else {
        console.log('Location not available');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }
}
