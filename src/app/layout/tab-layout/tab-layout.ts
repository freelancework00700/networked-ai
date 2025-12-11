import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabs, IonLabel, IonTabBar, IonTabButton, IonRouterLink, IonIcon } from '@ionic/angular/standalone';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'tab-layout',
  styleUrl: './tab-layout.scss',
  templateUrl: './tab-layout.html',
  imports: [IonIcon, IonTabs, IonLabel, IonTabBar, RouterLink, RouterLinkActive, IonTabButton, IonRouterLink, InputIcon]
})
export class TabLayout {}
