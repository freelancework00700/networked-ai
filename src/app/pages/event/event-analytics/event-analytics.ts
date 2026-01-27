import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { EventService } from '@/services/event.service';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { AnalyticsTickets } from '@/pages/event/components/analytics-tickets';
import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { AnalyticsPromoCodes } from '@/pages/event/components/analytics-promo-codes';
import { IonContent, IonHeader, IonToolbar, IonIcon, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';

@Component({
  selector: 'event-analytics',
  styleUrl: './event-analytics.scss',
  templateUrl: './event-analytics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    CommonModule,
    AnalyticsPromoCodes,
    AnalyticsTickets,
    IonIcon,
    NgOptimizedImage
  ]
})
export class EventAnalytics implements OnInit {
  navigationService = inject(NavigationService);

  authService = inject(AuthService);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);
  eventService = inject(EventService);
  route = inject(ActivatedRoute);

  isDownloading = signal<boolean>(false);
  eventData = signal<any>(null);
  promoCodes = signal<any>(null);
  summary = signal<any>(null);
  isLoggedIn = computed(() => !!this.authService.currentUser());

  async ngOnInit(): Promise<void> {
    if (!this.isLoggedIn()) {
      const result = await this.modalService.openLoginModal();
      if (!result?.success) {
        this.navigationService.back();
        return;
      }
    }

    // Get route params
    const eventId = this.route.snapshot.paramMap.get('id');

    if (eventId) {
      await this.loadAnalytics(eventId);
    }
  }

  async loadAnalytics(eventId: string): Promise<void> {
    try {
      const response = await this.eventService.getEventAnalytics(eventId);
      const event = response?.event;
      this.eventData.set(event);
      this.promoCodes.set(response?.promo_codes);
      this.summary.set(response?.summary);
    } catch (error) {
      console.error('Error loading analytics:', error);
      this.toasterService.showError('Failed to load analytics');
      this.navigationService.navigateForward(`/event/${eventId}`, true);
    }
  }

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      const eventId = this.route.snapshot.paramMap.get('id');
      if (eventId) {
        await this.loadAnalytics(eventId);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      event.target.complete();
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
