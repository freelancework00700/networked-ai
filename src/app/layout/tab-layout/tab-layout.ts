import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonTabs, IonLabel, IonTabBar, IonTabButton, IonRouterLink } from '@ionic/angular/standalone';

@Component({
  selector: 'tab-layout',
  styleUrl: './tab-layout.scss',
  templateUrl: './tab-layout.html',
  imports: [IonTabs, IonLabel, IonTabBar, RouterLink, IonTabButton, IonRouterLink]
})
export class TabLayout {}
