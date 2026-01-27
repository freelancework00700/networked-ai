import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '@/services/event.service';
import { NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { AnalyticsTickets } from '@/pages/event/components/analytics-tickets';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AnalyticsPromoCodes } from '@/pages/event/components/analytics-promo-codes';
import { IonContent, IonHeader, IonToolbar, NavController, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'event-analytics',
  styleUrl: './event-analytics.scss',
  templateUrl: './event-analytics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, CommonModule, AnalyticsPromoCodes, AnalyticsTickets, IonIcon, NgOptimizedImage]
})
export class EventAnalytics {
  navCtrl = inject(NavController);

  isDownloading = signal<boolean>(false);
  eventData = signal<any>(null);
  promoCodes = signal<any>(null);
  summary = signal<any>(null);
  eventService = inject(EventService);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Get route params
    const eventId = this.route.snapshot.paramMap.get('id');

    if (eventId) {
      this.eventService.getEventAnalytics(eventId).then((response) => {
        this.eventData.set(response?.event);
        this.promoCodes.set(response?.promo_codes);
        this.summary.set(response?.summary);
      });
    }
  }

  downloadCSV() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }

  onImageError(event: any): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }
}
