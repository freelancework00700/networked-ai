import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { signal, Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { PageHeader } from '@/components/common/page-header';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { AuthService } from '@/services/auth.service';

type Tab = 'events' | 'feed';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeFeed, IonHeader, HomeEvent, IonToolbar, IonContent, SegmentButton, PageHeader]
})
export class Home {
  tab = signal<Tab>('events');
  navCtrl = inject(NavController);
  private authService = inject(AuthService);
  
  isLoggedIn = computed(() => !!this.authService.currentUser());
  
  tabItems: SegmentButtonItem[] = [
    {
      value: 'events',
      label: 'Events',
      iconClass: 'pi-calendar-clock'
    },
    {
      value: 'feed',
      label: 'My Feed',
      iconClass: 'pi-book'
    }
  ];

  onSegmentChange(value: string): void {
    this.tab.set(value as Tab);
  }
}
