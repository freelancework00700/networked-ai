import { Subscription } from 'rxjs';
import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { EventCard } from '@/components/card/event-card';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { inject, signal, computed, Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-all-events',
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, EventCard, Searchbar, Button, EmptyState],
  templateUrl: './all-events.html',
  styleUrl: './all-events.scss'
})
export class AllEvents implements OnInit, OnDestroy {
  // services
  modalService = inject(ModalService);
  eventService = inject(EventService);
  route = inject(ActivatedRoute);
  navigationService = inject(NavigationService);
  // signals
  searchQuery = signal('');
  selectedDate = signal<string>('');
  selectedLocation = signal<string>('');
  selectedDistance = signal<number>(20);
  allEvents = signal<IEvent[]>([]);
  isLoadingEvents = signal<boolean>(false);
  currentPage = signal<number>(1);
  hasMorePages = signal<boolean>(true);
  private queryParamsSubscription?: Subscription;

  ngOnInit(): void {
    this.loadEvents(true);
    
    this.queryParamsSubscription = this.route.queryParams.subscribe(() => {
      this.currentPage.set(1);
      this.allEvents.set([]);
      this.hasMorePages.set(true);
      this.loadEvents(true);
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  private async loadEvents(reset: boolean = false): Promise<void> {
    try {
      this.isLoadingEvents.set(true);
      const params = this.route.snapshot.queryParamMap;
      const eventFilter = params.get('eventFilter');
      const isPublicEvents = eventFilter === 'public';
      const isRecommendedEvents = eventFilter === 'recommended';
      
      const page = reset ? 1 : this.currentPage();
      const limit = 10;
      
      const todayDate = new Date().toISOString();
      
      let response;
      if (isRecommendedEvents) {
        response = await this.eventService.getRecommendedEvents({
          page,
          limit,
          start_date: todayDate
        });
      } else {
        response = await this.eventService.getEvents({
          page,
          limit,
          order_by: 'start_date',
          order_direction: 'ASC',
          start_date: todayDate,
          ...(isPublicEvents 
            ? { is_public: true }
            : { is_my_events: false, is_included_me_event: true }
          )
        });
      }

      if (response?.data?.data) {
        const events = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        if (reset) {
          this.allEvents.set(events);
          this.currentPage.set(1);
        } else {
          this.allEvents.update(existing => [...existing, ...events]);
        }
        
        const totalPages = response?.data?.totalPages || response?.data?.total_pages || 0;
        const currentPageNum = this.currentPage();
        
        if (totalPages > 0) {
          this.hasMorePages.set(currentPageNum < totalPages);
        } else {
          const totalEvents = response?.data?.total || response?.data?.count || 0;
          const currentTotal = this.allEvents().length;
          const hasMore = events.length === limit && (totalEvents === 0 || currentTotal < totalEvents);
          this.hasMorePages.set(hasMore);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoadingEvents.set(false);
    }
  }


  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const location = this.selectedLocation();
    const date = this.selectedDate();
    let events = [...this.allEvents()];

    if (location) {
      events = events.filter((event) => {
        const eventLocation = this.eventService.formatLocation(
          event.address,
          event.city,
          event.state,
          event.country
        );
        return eventLocation.toLowerCase().includes(location.toLowerCase());
      });
    }
    
    if (date) {
      events = events.filter((event) => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        const filterDate = new Date(date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    if (query) {
      events = events.filter((event) => {
        const title = (event.title || '').toLowerCase();
        const hostName = event.participants?.find((p: any) => 
          (p.role || '').toLowerCase() === 'host'
        )?.user?.name || '';
        const eventLocation = this.eventService.formatLocation(
          event.address,
          event.city,
          event.state,
          event.country
        ).toLowerCase();
        
        return title.includes(query) ||
          hostName.toLowerCase().includes(query) ||
          eventLocation.includes(query);
      });
    }

    return events;
  });


  hasMoreEvents = computed(() => {
    return this.hasMorePages() && !this.isLoadingEvents();
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.allEvents.set([]);
    this.hasMorePages.set(true);
    this.loadEvents(true);
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.allEvents.set([]);
    this.hasMorePages.set(true);
    this.loadEvents(true);
  }

  async openFilter(): Promise<void> {
    const result = await this.modalService.openEventFilterModal({
      location: this.selectedLocation(),
      eventDate: this.selectedDate(),
      distance: this.selectedDistance()
    });
    if (result) {
      this.selectedLocation.set(result.location || '');
      this.selectedDate.set(result.eventDate || '');
      this.selectedDistance.set(result.distance || 20); 
      this.currentPage.set(1);
      this.allEvents.set([]);
      this.hasMorePages.set(true);
      this.loadEvents(true);
    }
  }

  loadMore(): void {
    if (this.hasMorePages() && !this.isLoadingEvents()) {
      this.currentPage.update(page => page + 1);
      this.loadEvents();
    }
  }

  goBack(): void {
    this.navigationService.back();
  }
}
