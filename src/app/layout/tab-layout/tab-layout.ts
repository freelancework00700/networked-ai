import { Component, inject, computed, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabs, IonLabel, IonTabBar, IonTabButton, IonRouterLink, IonIcon } from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import { MessagesService } from '@/services/messages.service';

@Component({
  selector: 'tab-layout',
  styleUrl: './tab-layout.scss',
  templateUrl: './tab-layout.html',
  imports: [IonIcon, IonTabs, IonLabel, IonTabBar, RouterLink, RouterLinkActive, IonTabButton, IonRouterLink]
})
export class TabLayout {
  private router = inject(Router);
  messagesService = inject(MessagesService);
  currentUrl = signal<string>('');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects.split('?')[0]));
  }

  isHomeActive = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '';
  });
}
