import { CommonModule, NgOptimizedImage, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { EventData } from '@/interfaces/event';
import { getImageUrlOrDefault } from '@/utils/helper';

@Component({
  imports: [CommonModule, NgOptimizedImage, DatePipe],
  selector: 'post-event-card',
  styleUrl: './post-event-card.scss',
  templateUrl: './post-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostEventCard {
  onRemove = output<any>();
  onAdd = output<any>();
  event = input<EventData>();
  isModal = input<boolean>(false);

  eventDate = computed(() => {
    const evt = this.event();
    return evt?.start_date || null;
  });

  eventImage = computed(() => {
    const evt = this.event();
    if (evt?.medias && evt.medias.length > 0) {
      return getImageUrlOrDefault(evt.medias[0].media_url);
    }
    return getImageUrlOrDefault('');
  });

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }
}
