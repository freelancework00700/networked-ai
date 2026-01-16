import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { NavController } from '@ionic/angular/standalone';
import { EventCard } from '@/components/card/event-card';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { IonHeader, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'scity-events',
  styleUrl: './city-events.scss',
  templateUrl: './city-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText, EventCard, Searchbar, EmptyState]
})
export class CityEvents implements OnInit, OnDestroy {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  eventService = inject(EventService);
  private destroyRef = inject(DestroyRef);

  selectedCity = signal<{ city: string; state: string; fullName: string; image_url?: string; thumbnail_url?: string }>({
    city: '',
    state: '',
    fullName: ''
  });

  private formatFullName(city: string, state: string): string {
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    return '';
  }

  private async loadCityImage(city: string, state: string): Promise<{ image_url?: string; thumbnail_url?: string } | undefined> {
    try {
      const cities = await this.eventService.getTopCities();
      const matchedCity = cities.find(c => 
        (c.city || '').toLowerCase() === city.toLowerCase() && 
        c.state.toLowerCase() === state.toLowerCase()
      );
      return matchedCity ? { image_url: matchedCity.image_url, thumbnail_url: matchedCity.thumbnail_url } : undefined;
    } catch (error) {
      console.error('Error loading city image:', error);
      return undefined;
    }
  }
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = signal('');
  private searchSubject = new Subject<string>();
  allEvents = signal<IEvent[]>([]);
  isLoadingEvents = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  private isInitialLoad = signal<boolean>(true);
  private readonly pageLimit = 10;

  hasMore = computed(() => this.currentPage() < this.totalPages());

  ngOnInit(): void {
    // Setup debounced search
    this.setupSearchDebounce();
    
    // Check for city object in navigation state first
    const navigation = this.router.currentNavigation();
    const state: any = navigation?.extras?.state;
    
    const params = this.route.snapshot.queryParamMap;
    const cityParam = params.get('city');
    const stateParam = params.get('state');
    
    // If coming from "see all" button (no query params), don't set city/state
    const hasQueryParams = cityParam || stateParam;
    
    if (state?.city) {
      const cityObj = state.city;
      const city = cityObj.city || '';
      const stateName = cityObj.state || '';
      this.selectedCity.set({
        city: city,
        state: stateName,
        fullName: this.formatFullName(city, stateName),
        image_url: cityObj.image_url,
        thumbnail_url: cityObj.thumbnail_url
      });
      this.loadEvents();
    } else if (hasQueryParams) {
      // Only load events if query params are present
      const city = cityParam || '';
      const stateName = stateParam || '';
      // Set initial values first
      this.selectedCity.set({
        city: city,
        state: stateName,
        fullName: this.formatFullName(city, stateName),
        image_url: undefined,
        thumbnail_url: undefined
      });

      this.loadCityImage(city, stateName).then((cityData) => {
        if (cityData) {
          this.selectedCity.update(current => ({
            ...current,
            image_url: cityData.image_url,
            thumbnail_url: cityData.thumbnail_url
          }));
        }
      });
      this.loadEvents();
    } else {
      this.selectedCity.set({
        city: '',
        state: '',
        fullName: 'All',
        image_url: undefined,
        thumbnail_url: undefined
      });
      this.loadEvents();
    }
  }

  private async loadEvents(search?: string, isSearch: boolean = false, page: number = 1, append: boolean = false): Promise<void> {
    try {
      if (this.isInitialLoad()) {
        this.isLoadingEvents.set(true);
      }
      
      const city = this.selectedCity();
      
      const params: any = {
        page: page,
        limit: this.pageLimit,
        order_by: 'start_date',
        order_direction: 'ASC',
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      if (city.city) {
        params.city = city.city;
      }
      if (city.state) {
        params.state = city.state;
      }
      
      const response = await this.eventService.getEvents(params);

      if (response?.data?.data) {
        const events = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        if (append) {
          this.allEvents.update(current => [...current, ...events]);
        } else {
          // Replace content directly without showing loader
          this.allEvents.set(events);
        }
        
        // Update pagination
        const pagination = response?.data?.pagination;
        if (pagination) {
          this.currentPage.set(pagination.currentPage || page);
          this.totalPages.set(pagination.totalPages || 0);
        }
      }
      
      // Mark initial load as complete
      if (this.isInitialLoad()) {
        this.isInitialLoad.set(false);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      if (this.isLoadingEvents()) {
        this.isLoadingEvents.set(false);
      }
    }
  }


  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((query: string) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.totalPages.set(0);
      this.loadEvents(query, true, 1, false);
    });
  }

  async openCitySelection(): Promise<void> {
    const currentCity = this.selectedCity();
    const result = await this.modalService.openCitySelectionModal(
      currentCity.city || currentCity.state ? { city: currentCity.city, state: currentCity.state } : undefined
    );
    if (result) {
      const city = result.city || '';
      const stateName = result.state || '';
      
      if (!city && !stateName) {
        this.selectedCity.set({
          city: '',
          state: '',
          fullName: 'All',
          image_url: undefined,
          thumbnail_url: undefined
        });
      } else {
        const cities = await this.eventService.getTopCities();
        const matchedCity = cities.find(c => 
          (c.city || '').toLowerCase() === city.toLowerCase() && 
          c.state.toLowerCase() === stateName.toLowerCase()
        );
        
        this.selectedCity.set({
          city: city,
          state: stateName,
          fullName: this.formatFullName(city, stateName),
          image_url: matchedCity?.image_url,
          thumbnail_url: matchedCity?.thumbnail_url
        });
      }
      
      this.currentPage.set(1);
      this.totalPages.set(0);
      await this.loadEvents(); // Reload events when city changes
    }
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onSearchClear(): void {
    this.searchSubject.next('');
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
      const search = this.searchQuery().trim() || undefined;
      await this.loadEvents(search, false, nextPage, true);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
    this.modalService.dismissAllModals();
  }

  goBack(): void {
    this.navCtrl.back();
  }
}
