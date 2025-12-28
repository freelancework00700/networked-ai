import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
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

  // view child
  private routerOutlet = viewChild(IonRouterOutlet);

  constructor() {
    // set the router outlet to the navigation service
    effect(() => this.navigationService.setRouterOutlet(this.routerOutlet()));

    // add icons
    addIcons(icons);
  }
}
