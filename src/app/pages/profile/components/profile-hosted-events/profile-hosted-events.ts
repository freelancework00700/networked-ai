import { NavController } from '@ionic/angular/standalone';
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { ProfileEmptyState } from '@/components/common/profile-empty-state';
import { EventCard } from '@/components/card/event-card';
import { EventService } from '@/services/event.service';
import { input, inject, Component, ChangeDetectionStrategy, signal, effect, untracked } from '@angular/core';
import { IEvent } from '@/interfaces/event';

@Component({
  imports: [ProfileEmptyState, EventCard, IonInfiniteScroll, IonInfiniteScrollContent],
  selector: 'profile-hosted-events',
  styleUrl: './profile-hosted-events.scss',
  templateUrl: './profile-hosted-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHostedEvents {
  // inputs
  userId = input<string | null>(null);

  // services
  navCtrl = inject(NavController);
  private eventService = inject(EventService);

  // signals
  events = signal<IEvent[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);

  // Constants
  private readonly pageLimit = 10;

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
        untracked(() => {
          this.loadHostedEvents(true);
        });
      }
    });
  }

  async loadHostedEvents(reset: boolean = true): Promise<void> {
    const userId = this.userId();
    if (!userId || this.isLoading()) return;

    this.isLoading.set(true);
    const page = reset ? 1 : this.currentPage();

    try {
      const response = await this.eventService.getEvents({
        page,
        limit: this.pageLimit,
        roles: 'Host,CoHost,Sponsor',
        user_id: userId
      });

      const eventsData = response?.data?.data || [];
      const pagination = response?.data?.pagination || {};
      const total = pagination.totalCount || 0;

      if (reset) {
        this.events.set(eventsData);
      } else {
        this.events.update((current) => [...current, ...eventsData]);
      }

      this.currentPage.set(pagination.currentPage || page);
      this.totalPages.set(pagination.totalPages || Math.ceil(total / this.pageLimit));
      this.hasMore.set((pagination.currentPage || page) < (pagination.totalPages || Math.ceil(total / this.pageLimit)));
    } catch (error) {
      console.error('Error loading hosted events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreEvents(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);

      const userId = this.userId();
      const nextPage = this.currentPage() + 1;

      if (userId) {
        const response = await this.eventService.getEvents({
          page: nextPage,
          limit: this.pageLimit,
          roles: 'Host,CoHost,Sponsor',
          user_id: userId
        });

        const eventsData = response?.data?.data || [];
        const pagination = response?.data?.pagination || {};
        const total = pagination.totalCount || 0;

        this.events.update((current) => [...current, ...eventsData]);
        this.currentPage.set(pagination.currentPage || nextPage);
        this.totalPages.set(pagination.totalPages || Math.ceil(total / this.pageLimit));
        this.hasMore.set((pagination.currentPage || nextPage) < (pagination.totalPages || Math.ceil(total / this.pageLimit)));
      }

      infiniteScroll.complete();
    } catch (error) {
      console.error('Error loading more events:', error);
      infiniteScroll.complete();
    } finally {
      this.isLoadingMore.set(false);
    }
  }
}
