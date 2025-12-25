import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { signal, Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

type Tab = 'events' | 'feed';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeFeed, IonHeader, HomeEvent, IonToolbar, IonContent, SegmentButton]
})
export class Home {
  tab = signal<Tab>('events');
  navCtrl = inject(NavController);
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
