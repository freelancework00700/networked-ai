import { IEvent } from '@/interfaces/event';
import { Button } from '@/components/form/button';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { EventService } from '@/services/event.service';
import { input, output, Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';

@Component({
  imports: [Button, NgOptimizedImage, DatePipe],
  selector: 'upcoming-event-card',
  styleUrl: './upcoming-event-card.scss',
  templateUrl: './upcoming-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingEventCard {
  private eventService = inject(EventService);

  onViewTicket = output<void>();
  event = input.required<IEvent>();

  eventImage = computed(() => {
    const event = this.event();
    const imageUrl = event?.thumbnail_url || 
      (event?.medias && event.medias.length > 0 
        ? (event.medias[0].media_url || event.medias[0].url) 
        : '') ||
      event?.image || '';
    return getImageUrlOrDefault(imageUrl);
  });

  formattedLocation = computed(() => {
    const event = this.event();
    return this.eventService.formatLocation(event.city, event.state);
  });

  onImageError = onImageError;
}
