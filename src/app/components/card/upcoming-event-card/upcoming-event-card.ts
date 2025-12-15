import { IEvent } from '../event-card/event-card';
import { Button } from '@/components/form/button';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'upcoming-event-card',
  styleUrl: './upcoming-event-card.scss',
  templateUrl: './upcoming-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingEventCard {
  onViewTicket = output<void>();
  event = input.required<IEvent>();
}
