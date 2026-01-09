import { IEvent } from '@/interfaces/event';
import { NgOptimizedImage } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { input, Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';

@Component({
  selector: 'event-card',
  imports: [NgOptimizedImage],
  styleUrl: './event-card.scss',
  templateUrl: './event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCard {
  private navigationService = inject(NavigationService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private eventService = inject(EventService);

  event = input.required<IEvent>();
  variant = input<'default' | 'compact'>('default');
  localEvent = signal<IEvent | null>(null);

  currentEvent = computed(() => this.localEvent() || this.event());

  isEventLiked = computed(() => {
    const currentEvent = this.currentEvent();
    return currentEvent?.is_like || false;
  });

  formattedDate = computed(() => {
    const event = this.currentEvent();
    if (!event) return 'Date not set';
    
    if (event.start_date) {
      const formatted = this.eventService.formatDateTime(event.start_date, event.end_date);
      return formatted || 'Date not set';
    }
    
    if (event.date) {
      return event.date;
    }
    
    return 'Date not set';
  });

  formattedLocation = computed(() => {
    const event = this.currentEvent();
    if (!event) return 'Location not specified';
    
    if (event.address) {
      return event.address;
    }    
    return 'Location not specified';
  });

  eventImage = computed(() => {
    const event = this.currentEvent();
    const imageUrl = event?.thumbnail_url || 
      (event?.medias && event.medias.length > 0 
        ? (event.medias[0].media_url || event.medias[0].url) 
        : '') ||
      event?.image || '';
    return getImageUrlOrDefault(imageUrl);
  });

  eventViews = computed(() => {
    const event = this.currentEvent();
    if (Array.isArray(event?.viewers)) {
      return event.viewers.length.toString();
    }
    return event?.views?.toString() || '0';
  });

  eventOrganization = computed(() => {
    const event = this.currentEvent();
    const hostName = event?.participants?.find((p: any) => 
      (p.role || '').toLowerCase() === 'host'
    )?.user?.name;
    return hostName || event?.organization || 'Networked AI';
  });

  viewEvent() {
    const eventSlug = this.event().slug;
    if (eventSlug) {
      this.navigationService.navigateForward(`/event/${eventSlug}`);
    }
  }

  async shareEvent() {
    const eventId = this.event().id;
    if (eventId) {
      const result = await this.modalService.openShareModal(eventId, 'Event');
      if (result) {
        this.toasterService.showSuccess('Event shared');
      }
    }
  }

  async likeEvent(event: Event) {
    event.stopPropagation();
    const eventId = this.event().id;
    if (!eventId) return;

    const currentEvent = this.currentEvent();
    const currentIsLiked = currentEvent?.is_like || false;
    const newIsLiked = !currentIsLiked;

    this.localEvent.set({
      ...currentEvent,
      is_like: newIsLiked,    
    });

    try {
      await this.eventService.likeEvent(eventId);
    } catch (error) {
      console.error('Error toggling event like:', error);
      this.localEvent.set({
        ...currentEvent,
        is_like: currentIsLiked,
      });
    }
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: any): void {
    onImageError(event);
  }
}
