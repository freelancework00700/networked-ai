import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { EventCard } from '@/components/card/event-card';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { IonHeader, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { inject, signal, computed, Component, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-all-events',
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, EventCard, Searchbar, Button, EmptyState],
  templateUrl: './all-events.html',
  styleUrl: './all-events.scss'
})
export class AllEvents implements OnInit, OnDestroy {
  // services
  modalService = inject(ModalService);
  eventService = inject(EventService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  navigationService = inject(NavigationService);
  authService = inject(AuthService);
  userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  // signals
  searchQuery = signal('');
  selectedDate = signal<string>('');
  selectedLocation = signal<string>('');
  latitude = signal<string>('');
  longitude = signal<string>('');
  selectedDistance = signal<number>(20);
  allEvents = signal<IEvent[]>([]);
  isLoadingEvents = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  userFromState = signal<any>(null);
  hasMore = computed(() => this.currentPage() < this.totalPages());
  private queryParamsSubscription?: Subscription;
  private searchSubject = new Subject<string>();

  // Constants
  private readonly pageLimit = 10;

  async ngOnInit(): Promise<void> {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state || history.state;
    if (state?.user) {
      this.userFromState.set(state.user);
    }

    this.setupSearchDebounce();
    this.loadEvents(true);
    
    this.queryParamsSubscription = this.route.queryParams.subscribe(() => {
      this.currentPage.set(1);
      this.allEvents.set([]);
      this.totalPages.set(0);
      this.loadEvents(true);
    });
  }

  // Helper methods
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getQueryParams(): { eventFilter: string | null; userId: string | null } {
    const params = this.route.snapshot.queryParamMap;
    return {
      eventFilter: params.get('eventFilter'),
      userId: params.get('userId')
    };
  }

  private getFilterParams(): {
    search: string | undefined;
    latitude: string | undefined;
    longitude: string | undefined;
    radius: number | undefined;
    startDate: string | undefined;
    todayDate: string;
  } {
    const search = this.searchQuery().trim() || undefined;
    const latitude = this.latitude() || undefined;
    const longitude = this.longitude() || undefined;
    const radius = this.selectedDistance() || undefined;
    const todayDate = this.formatDate(new Date());

    let startDate: string | undefined = undefined;
    if (this.selectedDate()) {
      const date = new Date(this.selectedDate());
      if (!isNaN(date.getTime())) {
        startDate = this.formatDate(date);
      }
    }

    return { search, latitude, longitude, radius, startDate, todayDate };
  }

  private async fetchEvents(page: number, useTodayAsDefault: boolean = false): Promise<any> {
    const { eventFilter, userId } = this.getQueryParams();
    const { search, latitude, longitude, radius, startDate, todayDate } = this.getFilterParams();

    const isPublicEvents = eventFilter === 'public';
    const isRecommendedEvents = eventFilter === 'recommended';
    const isHostedEvents = eventFilter === 'hosted';
    const isAttendedEvents = eventFilter === 'attended';
    const isLikedEvents = eventFilter === 'liked';

    const defaultStartDate = useTodayAsDefault ? todayDate : startDate;

    if (isRecommendedEvents) {
      return await this.eventService.getRecommendedEvents({
        page,
        limit: this.pageLimit,
        start_date: defaultStartDate || todayDate
      });
    }

    const baseParams: any = {
      page,
      limit: this.pageLimit,
      search,
      radius,
      start_date: startDate,
      order_by: 'start_date' as const,
      order_direction: 'ASC' as const
    };

    // Only add latitude/longitude if location is selected (not city)
    if (latitude && longitude) {
      baseParams.latitude = latitude;
      baseParams.longitude = longitude;
    }

    if (isHostedEvents && userId) {
      return await this.eventService.getEvents({
        ...baseParams,
        roles: 'Host,CoHost,Sponsor',
        user_id: userId
      });
    }

    if (isAttendedEvents && userId) {
      return await this.eventService.getEvents({
        ...baseParams,
        roles: 'Attendees',
        user_id: userId
      });
    }

    if (isLikedEvents) {
      return await this.eventService.getEvents({
        ...baseParams,
        is_liked: true
      });
    }

    return await this.eventService.getEvents({
      ...baseParams,
      ...(isPublicEvents ? { is_public: true } : { is_my_events: false, is_included_me_event: true })
    });
  }

  private handleEventsResponse(response: any, reset: boolean, page: number): void {
    if (!response?.data?.data) return;

    const events = Array.isArray(response.data.data) ? response.data.data : [];
    const pagination = response?.data?.pagination || {};
    const totalPages = pagination.totalPages || pagination.total_pages || 0;
    const currentPageNum = pagination.currentPage || page;

    if (reset) {
      this.allEvents.set(events);
    } else {
      this.allEvents.update((existing) => [...existing, ...events]);
    }

    this.currentPage.set(currentPageNum);
    this.totalPages.set(totalPages || Math.ceil((pagination.totalCount || 0) / this.pageLimit));
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe((query: string) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.totalPages.set(0);
      this.loadEvents(true, true); // true for reset, true for isSearch
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  private async loadEvents(reset: boolean = false, isSearch: boolean = false): Promise<void> {
    try {
      if (reset && !isSearch) {
        this.isLoadingEvents.set(true);
      }

      const page = reset ? 1 : this.currentPage();
      const response = await this.fetchEvents(page);
      this.handleEventsResponse(response, reset, page);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoadingEvents.set(false);
    }
  }

  filteredEvents = computed(() => this.allEvents());

  // Computed header text based on user and event filter
  headerText = computed(() => {
    const { eventFilter, userId } = this.getQueryParams();
    const user = this.userFromState();
    const currentUser = this.authService.currentUser();
    
    // Check if viewing current user's events
    const isCurrentUser = currentUser && userId && currentUser.id === userId;
    
    // Get user name for display
    const userName = user?.name || user?.username || '';
    
    if (eventFilter === 'hosted') {
      return isCurrentUser ? 'My Events' : userName ? `${userName}'s Events` : 'Browse Events';
    } else if (eventFilter === 'attended') {
      return isCurrentUser ? 'My Attended Events' : userName ? `${userName}'s Attended Events` : 'Browse Events';
    }
    
    return 'Browse Events';
  });

  // Check if any filter is active
  isFilterActive = computed(() => {
    const hasLocation = !!(this.latitude() && this.longitude());
    const hasDate = !!this.selectedDate();
    const hasCustomDistance = this.selectedDistance() !== 20;
    
    return hasLocation || hasDate || hasCustomDistance;
  });

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onSearchClear(): void {
    this.searchSubject.next('');
  }

  async openFilter(): Promise<void> {
    const result = await this.modalService.openEventFilterModal({
      location: this.selectedLocation(),
      eventDate: this.selectedDate(),
      distance: this.selectedDistance(),
      latitude: this.latitude(),
      longitude: this.longitude()
    });

    if (!result) return;

    this.selectedLocation.set(result.location || '');
    this.selectedDate.set(result.eventDate || '');
    this.selectedDistance.set(result.distance || 20);
    this.latitude.set(result.latitude || '');
    this.longitude.set(result.longitude || '');

    // Reload events with new filters
    this.resetAndLoadEvents();
  }

  private resetAndLoadEvents(): void {
    this.currentPage.set(1);
    this.allEvents.set([]);
    this.totalPages.set(0);
    this.loadEvents(true);
  }

  async loadMoreEvents(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);
      const nextPage = this.currentPage() + 1;
      const response = await this.fetchEvents(nextPage, true);
      this.handleEventsResponse(response, false, nextPage);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  }

  goBack(): void {
    this.navigationService.back();
  }
}
