import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { Component } from '@angular/core';
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
  constructor() {
    addIcons(icons);
  }
}
