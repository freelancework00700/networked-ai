import { Swiper } from 'swiper';
import { Subscription } from 'rxjs';
import { IEvent } from '@/interfaces/event';
import { SwiperOptions } from 'swiper/types';
import { Button } from '@/components/form/button';
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
import { signal, computed, Component, afterEveryRender, ChangeDetectionStrategy, inject, OnInit, OnDestroy, effect } from '@angular/core';

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
  imports: [Button, CityCard, EventCard, UpcomingEventCard, HostFirstEventCard, NoUpcomingEventCard, UserRecommendations]
})
export class HomeEvent implements OnInit, OnDestroy {
  navigationService = inject(NavigationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  filter = signal<'browse' | 'upcoming'>('browse');
  upcomingEvents = signal<IEvent[]>([]);
  eventCards = signal<IEvent[]>([]);
  isLoading = signal<boolean>(false);

  private queryParamsSubscription?: Subscription;
  
  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.authService.currentUser());

  private previousUserId: string | null = null;
  private previousLoginState: boolean | null = null;

  recommendedEvents = computed(() => this.eventService.recommendedEvents());
  publicEvents = computed(() => this.eventService.publicEvents());

  cityCards: ICity[] = [
    {
      city: 'Atlanta, GA',
      events: '17 Events',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Chicago, IL',
      events: '17 Events',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Denver, CO',
      events: '12 Events',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80'
    }
  ];


  feedPosts: FeedPost[] = [
    {
      id: '1',
      primaryUser: {
        name: 'Ricky James',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      otherCount: 3,
      event: {
        title: 'Atlanta Makes Me Laugh',
        organization: 'Networked AI',
        date: 'Fri 8/30, 7.00AM',
        location: 'Atlanta, GA',
        views: '12',
        image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
      }
    }
  ];

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
    afterEveryRender(() => this.initSwipers());

    effect(() => {
      const currentUser = this.currentUser();
      const currentUserId = currentUser?.id || null;
      const currentLoginState = this.isLoggedIn();

      if (this.previousLoginState === null) {
        this.previousUserId = currentUserId;
        this.previousLoginState = currentLoginState;
        
        this.loadEventsIfNeeded();
        return;
      }

      const loginStateChanged = this.previousLoginState !== currentLoginState;
      const userIdChanged = this.previousUserId !== null && this.previousUserId !== currentUserId;

      if (userIdChanged) {
        this.handleAccountChangeAndLogin();
      } else if (loginStateChanged && currentLoginState && !this.previousLoginState) {
        this.handleAccountChangeAndLogin();
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
    const hasRecommendedEvents = this.eventService.recommendedEvents().length > 0;
    const hasPublicEvents = this.eventService.publicEvents().length > 0;
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
    }
  }

  private async handleAccountChangeAndLogin(): Promise<void> {
    this.eventService.resetAllEvents();
    await this.loadAllEvents(true);
  }

  private async loadRecommendedEvents(reset: boolean = true): Promise<void> {
    // Don't call API if user is not logged in
    if (!this.isLoggedIn()) {
      return;
    }
    
    try {
      this.isLoading.set(true);
      await this.eventService.getRecommendedEvents({
        limit: 3,
        append: !reset
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
        append: !reset
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
          this.eventService.getRecommendedEvents({
            limit: 3,
            append: !reset
          }),
          this.eventService.getEvents({
            limit: 3,
            is_public: true,
            append: !reset
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

  handleViewTicket(): void {
    // TODO: Implement view ticket functionality
  }

  private readonly swiperConfigs: Record<string, SwiperOptions> = {
    cities: { spaceBetween: 8, slidesPerView: 2.7, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
    events: { spaceBetween: 8, slidesPerView: 1.5, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
    people: { spaceBetween: 8, slidesPerView: 2.2, allowTouchMove: true, slidesOffsetBefore: 16, slidesOffsetAfter: 16 }
  };

  private initSwipers(): void {
    this.initializeSwiper('.swiper-city', this.swiperConfigs['cities']);
    this.initializeSwiper('.swiper-public-event', this.swiperConfigs['events']);
    this.initializeSwiper('.swiper-event-recommendation', this.swiperConfigs['events']);
  }

  private initializeSwiper(selector: string, config: SwiperOptions): Swiper | undefined {
    return new Swiper(selector, config);
  }
}
