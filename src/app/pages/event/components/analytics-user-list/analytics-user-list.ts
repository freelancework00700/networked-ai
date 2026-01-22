import { onImageError } from '@/utils/helper';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@/components/form/button';
import { NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault } from '@/utils/helper';
import { EventService } from '@/services/event.service';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { IonContent, IonHeader, IonToolbar, NavController, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { Component, inject, signal, effect, ChangeDetectionStrategy, computed } from '@angular/core';

@Component({
  selector: 'analytics-user-list',
  styleUrl: './analytics-user-list.scss',
  templateUrl: './analytics-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonIcon,
    IonToolbar,
    IonHeader,
    IonContent,
    CommonModule,
    Searchbar,
    Button,
    EmptyState,
    NgOptimizedImage
  ]
})
export class AnalyticsUserList {
  route = inject(ActivatedRoute);
  navCtrl = inject(NavController);
  eventService = inject(EventService);
  navigationService = inject(NavigationService);

  isLoadingMore = signal<boolean>(false);

  users = signal<any[]>([]);
  ticket = signal<any>(null);
  searchQuery = signal<string>('');
  isDownloading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  hasMore = computed(() => this.currentPage() < this.totalPages());

  filteredSuggestions = computed(async () => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.users();
    const response = await this.eventService.getEventTicketAnalytics(this.ticket()?.id, 1, 20, search);
    return response?.users;
  });

  private navEffect = effect(() => {
    const state = history.state as { ticket?: any };
    const eventId = this.route.snapshot.paramMap.get('id');
    const ticketId = state?.ticket?.id;

    if (eventId && ticketId) {
      this.eventService.getEventTicketAnalytics(ticketId, 1, 20, this.searchQuery() || '').then((response) => {
        this.ticket.set(response?.ticket);
        this.currentPage.set(response?.pagination?.currentPage || 1);
        this.totalPages.set(response?.pagination?.totalPages || 0);
        this.users.set(response?.users);
      });
    } else {
      this.users.set([]);
      this.currentPage.set(1);
      this.totalPages.set(0);
    }
  });

  penniesToDollars(value: number): string {
    return (value / 100).toFixed(2);
  }

  getTicketStatus = (ticket: any): 'sale-ended' | 'sold-out' | 'upcoming' | 'ongoing' => {
    const now = new Date();
    const saleStartDate = ticket.sales_start_date;
    const saleEndDate = ticket.sales_end_date;
    const availableQuantity = ticket.available_quantity;

    if (availableQuantity !== null && availableQuantity !== undefined && availableQuantity <= 0) {
      return 'sold-out';
    }

    if (saleEndDate) {
      const endDate = new Date(saleEndDate);
      if (now > endDate) {
        return 'sale-ended';
      }
    }

    if (saleStartDate) {
      const startDate = new Date(saleStartDate);
      if (now < startDate) {
        return 'upcoming';
      }
    }

    return 'ongoing';
  };

  getStatusChip() {
    const status = this.getTicketStatus(this.ticket());
    if (status === 'upcoming') {
      return 'assets/svg/ticket/upcoming-chip.svg';
    } else if (status === 'ongoing') {
      return 'assets/svg/ticket/on-going-chip.svg';
    } else if (status === 'sale-ended') {
      return 'assets/svg/ticket/ended-chip.svg';
    }
    return 'assets/svg/ticket/sold-out.svg';
  }

  getTicketTypeChip(ticket: any) {
    switch (ticket.ticket_type) {
      case 'Early Bird':
        return 'assets/svg/ticket/early-bird-chip.svg';
      case 'Sponsor':
        return 'assets/svg/ticket/sponsor-chip.svg';
      default:
        return 'assets/svg/ticket/regular-chip.svg';
    }
  }

  getTicketTypeClass() {
    if (this.ticket()?.ticket_type === 'Early Bird') {
      return 'ticket-type-early-bird';
    } else if (this.ticket()?.ticket_type === 'Sponsor') {
      return 'ticket-type-sponsor';
    } else {
      return 'ticket-type';
    }
  }

  async downloadCSV() {
    try {
      this.isDownloading.set(true);

      const response = await this.eventService.downloadEventTicketAnalyticsCSV(this.ticket()?.id);

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + response], {
        type: 'text/csv;charset=utf-8;'
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.ticket()?.name}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading event ticket analytics CSV:', error);
    } finally {
      this.isDownloading.set(false);
    }
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  getDiamondPath(points: number) {
    if (points >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (points >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (points >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (points >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (points >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (points >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else {
      return '/assets/svg/gamification/diamond-1k.svg';
    }
  }

  goToUser(user: any) {
    if (user.parent_user_id) {
      return;
    }
    this.navigationService.navigateForward(`/${user.username}`);
  }

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);

      const nextPage = this.currentPage() + 1;

      const response = await this.eventService.getEventTicketAnalytics(this.ticket()?.id, nextPage, 20, this.searchQuery());
      this.currentPage.set(nextPage);
      this.totalPages.set(response?.pagination?.totalPages || 0);
      this.users.update((current) => [...current, ...response?.users]);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  };
}
