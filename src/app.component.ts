import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { AuthService } from '@/services/auth.service';
import { SocketService } from '@/services/socket.service';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { inject, effect, Component, viewChild } from '@angular/core';

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
  private navigationService = inject(NavigationService);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);

  // view child
  private routerOutlet = viewChild(IonRouterOutlet);

  constructor() {
    // set the router outlet to the navigation service
    effect(() => this.navigationService.setRouterOutlet(this.routerOutlet()));

    // add icons
    addIcons(icons);

    // refresh current user from API on app initialization
    this.authService.refreshCurrentUser();
  }
}
