import { HomeFeed } from '@/pages/home/home-feed';
import { HomeEvent } from '@/pages/home/home-event';
import { signal, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeFeed, IonHeader, HomeEvent, IonToolbar, IonContent]
})
export class Home {
  segmentValue = signal<'events' | 'feed'>('events');
}
