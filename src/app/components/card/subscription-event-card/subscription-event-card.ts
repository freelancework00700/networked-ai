import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
@Component({
  selector: 'subscription-event-card',
  imports: [CommonModule, CheckboxModule, FormsModule, NgOptimizedImage],
  styleUrl: './subscription-event-card.scss',
  templateUrl: './subscription-event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionEventCard {
  event = input.required<any>();
  selected = input<boolean>(false);
  showCheckbox = input<boolean>(true);
  
  toggle = output<string>();
  
  eventImage = computed(() => {
    const eventData = this.event();
    const imageUrl = eventData?.image_url || 'assets/images/profile.jpeg';
    return getImageUrlOrDefault(imageUrl);
  });
  
  isWeekend = computed(() => {
    const eventData = this.event();
    if (!eventData) return false;
    
    // Check if dayOfWeek is Saturday or Sunday
    const dayOfWeek = eventData.dayOfWeek;
    if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') {
      return true;
    }
    
    // Fallback: check date property if available
    if (eventData.date) {
      const date = new Date(eventData.date);
      const day = date.getDay();
      return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
    }
    
    return false;
  });
  
  onImageError = onImageError;
  
  onToggle(): void {
    this.toggle.emit(this.event().id);
  }

}
