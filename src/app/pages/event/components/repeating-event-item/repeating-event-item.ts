import { CommonModule } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';

@Component({
  selector: 'repeating-event-item',
  styleUrl: './repeating-event-item.scss',
  templateUrl: './repeating-event-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class RepeatingEventItem {
  event = input.required<any>();
  isMainEvent = input<boolean>(false);
  edit = output<any>();
  delete = output<string>();

  eventImage = computed(() => {
    const eventData = this.event();
    const mainEvent = this.isMainEvent();

    // For main events, use image property or first media from form data
    if (mainEvent) {
      if (eventData?.image) {
        return eventData.image;
      }
      // Fallback to first media item if image property is not set
      if (eventData?.medias && Array.isArray(eventData.medias) && eventData.medias.length > 0) {
        const firstMedia = eventData.medias[0];
        if (firstMedia?.url) {
          return firstMedia.url;
        }
      }
      return 'assets/images/profile.jpeg';
    }

    // For non-main events, find media with order 1
    if (eventData?.medias && Array.isArray(eventData.medias)) {
      const orderOneMedia = eventData.medias.find((media: any) => media.order === 1);
      if (orderOneMedia?.url) {
        return orderOneMedia.url;
      }
    }

    // Fallback to image property or default
    return eventData?.image || 'assets/images/profile.jpeg';
  });

  onEdit(): void {
    this.edit.emit(this.event());
  }

  onDelete(): void {
    this.delete.emit(this.event().id);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }
}
