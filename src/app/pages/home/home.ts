import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { AuthService } from '@/services/auth.service';
import { ProfileHeaderToolbar } from '@/components/common/profile-header-toolbar';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { signal, inject, computed, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

type Tab = 'events' | 'feed';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeFeed, IonHeader, HomeEvent, IonToolbar, IonContent, SegmentButton, ProfileHeaderToolbar]
})
export class Home {
  // services
  navCtrl = inject(NavController);
  private authService = inject(AuthService);

  // signals
  tab = signal<Tab>('events');
  isLoggedIn = computed(() => !!this.authService.currentUser());

  // variables
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
