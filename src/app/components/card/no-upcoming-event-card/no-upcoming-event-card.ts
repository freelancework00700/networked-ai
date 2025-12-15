import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  imports: [Button, IonIcon],
  selector: 'no-upcoming-event-card',
  styleUrl: './no-upcoming-event-card.scss',
  templateUrl: './no-upcoming-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoUpcomingEventCard {
  onBrowseClick = output<void>();
}
