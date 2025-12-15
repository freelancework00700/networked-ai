import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabs, IonLabel, IonTabBar, IonTabButton, IonRouterLink, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'tab-layout',
  styleUrl: './tab-layout.scss',
  templateUrl: './tab-layout.html',
  imports: [IonIcon, IonTabs, IonLabel, IonTabBar, RouterLink, RouterLinkActive, IonTabButton, IonRouterLink]
})
export class TabLayout {}
