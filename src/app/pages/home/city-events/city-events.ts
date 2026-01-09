import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { NavController } from '@ionic/angular/standalone';
import { EventCard } from '@/components/card/event-card';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'scity-events',
  styleUrl: './city-events.scss',
  templateUrl: './city-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, EventCard, Searchbar, EmptyState]
})
export class CityEvents implements OnInit {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  eventService = inject(EventService);

  selectedCity = signal<{ city: string; state: string; fullName: string }>({
    city: 'Atlanta',
    state: 'GA',
    fullName: 'Atlanta, GA'
  });

  searchQuery = signal('');
  displayedEventsCount = signal(6);
  allEvents = signal<IEvent[]>([]);
  isLoadingEvents = signal<boolean>(false);

  ngOnInit(): void {
    this.loadEvents();
  }

  private async loadEvents(): Promise<void> {
    try {
      this.isLoadingEvents.set(true);
      const city = this.selectedCity();
      const response = await this.eventService.getEvents({
        page: 1,
        limit: 100,
        order_by: 'start_date',
        order_direction: 'ASC',
        is_my_events: false,
        is_included_me_event: true,
        city: city.city,
        state: city.state
      });

      if (response?.data?.data) {
        const events = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        this.allEvents.set(events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoadingEvents.set(false);
    }
  }

  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let events = [...this.allEvents()];

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

  displayedEvents = computed(() => {
    return this.filteredEvents().slice(0, this.displayedEventsCount());
  });

  hasMoreEvents = computed(() => {
    return this.displayedEventsCount() < this.filteredEvents().length;
  });

  async openCitySelection(): Promise<void> {
    const result = await this.modalService.openCitySelectionModal();
    if (result) {
      this.selectedCity.set(result);
      this.displayedEventsCount.set(6);
      await this.loadEvents(); // Reload events when city changes
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.displayedEventsCount.set(6);
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.displayedEventsCount.set(6);
  }

  loadMore(): void {
    const currentCount = this.displayedEventsCount();
    const maxCount = this.filteredEvents().length;
    this.displayedEventsCount.set(Math.min(currentCount + 6, maxCount));
  }

  goBack(): void {
    this.navCtrl.back();
  }
}
