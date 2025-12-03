import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { Component } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet],
  template: `
    <!-- dynamic routes -->
    <ion-router-outlet />
  `
})
export class AppComponent {
  constructor(private authService: AuthService) {
    this.authService.initializeOnAuthStateChanged();
    addIcons(icons);
  }
}
