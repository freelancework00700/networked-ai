import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabs, IonLabel, IonTabBar, IonTabButton, IonRouterLink, IonIcon } from '@ionic/angular/standalone';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Component({
  selector: 'tab-layout',
  styleUrl: './tab-layout.scss',
  templateUrl: './tab-layout.html',
  imports: [IonIcon, IonTabs, IonLabel, IonTabBar, RouterLink, RouterLinkActive, IonTabButton, IonRouterLink]
})
export class TabLayout implements OnInit {
  isLoggedIn = signal<boolean>(false);

  async ngOnInit() {
    const { user } = await FirebaseAuthentication.getCurrentUser();
    this.isLoggedIn.set(!!user);
  }
}
