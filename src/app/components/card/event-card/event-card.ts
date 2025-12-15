import { input, Component, ChangeDetectionStrategy } from '@angular/core';

export interface IEvent {
  date: string;
  day?: string;
  views: string;
  title: string;
  image: string;
  location: string;
  dayOfWeek?: string;
  organization: string;
}

@Component({
  selector: 'event-card',
  styleUrl: './event-card.scss',
  templateUrl: './event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCard {
  event = input.required<IEvent>();
  variant = input<'default' | 'compact'>('default');
}
