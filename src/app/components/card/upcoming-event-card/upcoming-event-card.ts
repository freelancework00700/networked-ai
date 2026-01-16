import { IEvent } from '@/interfaces/event';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { EventService } from '@/services/event.service';
import { input, Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { NavigationService } from '@/services/navigation.service';

@Component({
  imports: [NgOptimizedImage, DatePipe],
  selector: 'upcoming-event-card',
  styleUrl: './upcoming-event-card.scss',
  templateUrl: './upcoming-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingEventCard {
  private eventService = inject(EventService);
  private navigationService = inject(NavigationService);

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

  isWeekend = computed(() => {
    const startDate = this.event()?.start_date;
    if (!startDate) return false;
    const date = new Date(startDate);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  });

  viewEvent() {
    const eventSlug = this.event().slug;
    if (eventSlug) {
      this.navigationService.navigateForward(`/event/${eventSlug}`);
    }
  }

  onImageError = onImageError;
}
