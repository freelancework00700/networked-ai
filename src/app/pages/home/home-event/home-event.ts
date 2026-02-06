import { Swiper } from 'swiper';
import { Subscription } from 'rxjs';
import { IEvent } from '@/interfaces/event';
import { SwiperOptions } from 'swiper/types';
import { EventService } from '@/services/event.service';
import { AuthService } from '@/services/auth.service';
import { EventCard } from '@/components/card/event-card';
import { ActivatedRoute, Router } from '@angular/router';
import { CityCard, ICity } from '@/components/card/city-card';
import { NavigationService } from '@/services/navigation.service';
import { UpcomingEventCard } from '@/components/card/upcoming-event-card';
import { HostFirstEventCard } from '@/components/card/host-first-event-card';
import { NoUpcomingEventCard } from '@/components/card/no-upcoming-event-card';
import { UserRecommendations } from '@/components/common/user-recommendations';
import { IonSkeletonText } from '@ionic/angular/standalone';
import {
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  effect,
  ViewChild,
  ElementRef,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface FeedPost {
  id: string;
  primaryUser: {
    name: string;
    profileImage: string;
  };
  otherCount: number;
  event: IEvent;
}

interface NetworkSuggestion {
  id: string;
  name: string;
  location: string;
  distance: string;
  timeAgo: string;
  profileImage: string;
  mapImage: string;
}

@Component({
  selector: 'home-event',
  styleUrl: './home-event.scss',
  templateUrl: './home-event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CityCard, EventCard, UpcomingEventCard, HostFirstEventCard, NoUpcomingEventCard, UserRecommendations, IonSkeletonText]
})
export class HomeEvent implements OnInit, OnDestroy {
  swiper?: Swiper;
  citySwiper?: Swiper;
  eventSwiper?: Swiper;
  recommendationSwiper?: Swiper;
  private platformId = inject(PLATFORM_ID);

  @ViewChild('swiperEl')
  set citySwiperEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (!isPlatformBrowser(this.platformId)) return;

    // When Angular removes the element (skeleton -> real), el becomes undefined
    if (!el) {
      this.citySwiper?.destroy(true, true);
      this.citySwiper = undefined;
      return;
    }

    // Re-init swiper for the new DOM
    this.citySwiper?.destroy(true, true);

    this.citySwiper = new Swiper(el.nativeElement, {
      ...this.swiperConfigs['cities'],
      observer: true,
      observeParents: true
    });
  }

  @ViewChild('swiperPublicEvents')
  set eventSwiperEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (!isPlatformBrowser(this.platformId)) return;

    // When Angular removes the element
    if (!el) {
      this.eventSwiper?.destroy(true, true);
      this.eventSwiper = undefined;
      return;
    }

    // Re-init for new DOM
    this.eventSwiper?.destroy(true, true);

    this.eventSwiper = new Swiper(el.nativeElement, {
      ...this.swiperConfigs['events'],
      observer: true,
      observeParents: true
    });
  }
  @ViewChild('swiperEventRecommendation')
  set recommendationSwiperEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!el) {
      this.recommendationSwiper?.destroy(true, true);
      this.recommendationSwiper = undefined;
      return;
    }

    this.recommendationSwiper?.destroy(true, true);

    this.recommendationSwiper = new Swiper(el.nativeElement, {
      ...this.swiperConfigs['events'],
      observer: true,
      observeParents: true
    });
  }

  navigationService = inject(NavigationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  filter = signal<'browse' | 'upcoming'>('browse');
  isLoading = signal<boolean>(false);

  private queryParamsSubscription?: Subscription;

  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.authService.currentUser());

  private previousUserId: string | null = null;
  private previousLoginState: boolean | null = null;

  recommendedEvents = computed(() => this.eventService.recommendedEvents());
  publicEvents = computed(() => this.eventService.publicEvents());
  upcomingEvents = computed(() => this.eventService.upcomingEvents());

  cityCards = computed(() => this.eventService.cityCards());
  isLoadingCities = computed(() => this.eventService.isLoadingCities());

  networkSuggestions: NetworkSuggestion[] = [
    {
      id: '1',
      name: 'Alicia P.',
      location: 'Atlanta, GA',
      distance: '2.5 miles',
      timeAgo: '2m ago',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      mapImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80'
    }
  ];

  isBrowseMode = computed(() => this.filter() === 'browse');
  isUpcomingMode = computed(() => this.filter() === 'upcoming');

  constructor() {
    effect(() => {
      const currentUser = this.currentUser();
      const currentUserId = currentUser?.id || null;
      const currentLoginState = this.isLoggedIn();

      if (this.previousLoginState === null) {
        this.previousUserId = currentUserId;
        this.previousLoginState = currentLoginState;

        this.loadEventsIfNeeded();
        this.loadTopCities();
        return;
      }

      const loginStateChanged = this.previousLoginState !== currentLoginState;
      const userIdChanged = this.previousUserId !== null && this.previousUserId !== currentUserId;

      if (userIdChanged) {
        this.handleAccountChangeAndLogin();
      } else if (loginStateChanged && currentLoginState && !this.previousLoginState) {
        this.handleAccountChangeAndLogin();
      } else if (loginStateChanged && !currentLoginState && this.previousLoginState) {
        // User logged out - reset filter to browse and reset cities
        this.filter.set('browse');
        this.eventService.cityCards.set([]);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { eventFilter: 'browse' },
          queryParamsHandling: 'merge'
        });
      }

      this.previousUserId = currentUserId;
      this.previousLoginState = currentLoginState;
    });
  }

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      const eventFilter = params['eventFilter'];
      const tab = params['tab'];

      if (eventFilter === 'browse' || eventFilter === 'upcoming') {
        this.filter.set(eventFilter as 'browse' | 'upcoming');
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { eventFilter: this.filter(), tab: tab || 'events' },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  private async loadEventsIfNeeded(): Promise<void> {
    this.destroySwipers();
    const hasRecommendedEvents = this.eventService.recommendedEvents().length > 0;
    const hasPublicEvents = this.eventService.publicEvents().length > 0;
    const hasUpcomingEvents = this.eventService.upcomingEvents().length > 0;
    const loggedIn = this.isLoggedIn();

    if (loggedIn && hasRecommendedEvents && hasPublicEvents) return;
    if (!loggedIn && hasPublicEvents) return;

    // Only load if events don't exist
    if (!loggedIn) {
      if (!hasPublicEvents) {
        await this.loadPublicEvents();
      }
    } else {
      if (!hasRecommendedEvents && !hasPublicEvents) {
        await this.loadAllEvents();
      } else if (!hasRecommendedEvents) {
        await this.loadRecommendedEvents();
      } else if (!hasPublicEvents) {
        await this.loadPublicEvents();
      }

      // Load upcoming events if in upcoming mode and not already loaded
      if (!hasUpcomingEvents) {
        await this.loadUpcomingEvents();
      }
    }
  }

  private async handleAccountChangeAndLogin(): Promise<void> {
    this.destroySwipers();
    this.eventService.resetAllEvents();
    this.eventService.cityCards.set([]);
    await this.loadAllEvents(true);
    await this.loadUpcomingEvents();
    await this.loadTopCities(true);
  }

  private async loadRecommendedEvents(reset: boolean = true): Promise<void> {
    // Don't call API if user is not logged in
    if (!this.isLoggedIn()) {
      return;
    }

    try {
      this.isLoading.set(true);
      await this.eventService.getEvents({
        limit: 3,
        append: !reset,
        is_recommended: true,
        start_date: new Date().toString()
      });
    } catch (error) {
      console.error('Error loading recommended events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadPublicEvents(reset: boolean = true): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.eventService.getEvents({
        is_public: true,
        limit: 3,
        append: !reset,
        start_date: new Date().toString()
      });
    } catch (error) {
      console.error('Error loading public events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAllEvents(reset: boolean = true): Promise<void> {
    try {
      this.isLoading.set(true);
      const loggedIn = this.isLoggedIn();

      if (!loggedIn) {
        // When not logged in, only load public events
        await this.loadPublicEvents(reset);
      } else {
        // When logged in, load both recommended and public events
        await Promise.all([
          this.eventService.getEvents({
            limit: 3,
            append: !reset,
            is_recommended: true,
            start_date: new Date().toString()
          }),
          this.eventService.getEvents({
            limit: 3,
            is_public: true,
            append: !reset,
            start_date: new Date().toString()
          })
        ]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  onFilterChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { eventFilter: this.filter() },
      queryParamsHandling: 'merge'
    });
  }

  async refresh(): Promise<void> {
    try {
      this.destroySwipers();
      this.eventService.resetAllEvents();
      this.loadAllEvents(true);
      if (this.isLoggedIn()) {
        this.loadUpcomingEvents(true);
      }
      this.loadTopCities(true);
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  }

  private destroySwipers(): void {
    this.citySwiper?.destroy(true, true);
    this.eventSwiper?.destroy(true, true);
    this.recommendationSwiper?.destroy(true, true);

    this.citySwiper = undefined;
    this.eventSwiper = undefined;
    this.recommendationSwiper = undefined;
  }

  private async loadTopCities(reset: boolean = false): Promise<void> {
    this.destroySwipers();

    if (!reset && this.eventService.cityCards().length > 0) return;

    try {
      this.eventService.isLoadingCities.set(true);
      const cities = await this.eventService.getTopCities();
      this.eventService.cityCards.set(cities);
    } catch (error) {
      console.error('Error loading top cities:', error);
    } finally {
      this.eventService.isLoadingCities.set(false);
    }
  }

  onCityClick(city: ICity): void {
    this.navigationService.navigateForward(`/event/city?city=${encodeURIComponent(city.city || '')}&state=${encodeURIComponent(city.state)}`, false, {
      city: city
    });
  }

  private async loadUpcomingEvents(reset: boolean = true): Promise<void> {
    if (!this.isLoggedIn()) return;

    const currentUser = this.currentUser();
    if (!currentUser?.id) return;

    try {
      this.isLoading.set(true);
      await this.eventService.getEvents({
        page: 1,
        limit: 3,
        roles: 'Host,CoHost,Sponsor,Speaker,Staff,Attendees',
        user_id: currentUser.id,
        is_upcoming_event: true,
        append: !reset
      });
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private readonly swiperConfigs: Record<string, SwiperOptions> = {
    cities: { spaceBetween: 8, slidesPerView: 2.7, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
    events: { spaceBetween: 8, slidesPerView: 1.5, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
    people: { spaceBetween: 8, slidesPerView: 2.2, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 }
  };
}
