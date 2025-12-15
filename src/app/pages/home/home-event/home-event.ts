import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { CityCard, ICity } from '@/components/card/city-card';
import { UserCard, IUser } from '@/components/card/user-card';
import { EventCard, IEvent } from '@/components/card/event-card';
import { UpcomingEventCard } from '@/components/card/upcoming-event-card';
import { HostFirstEventCard } from '@/components/card/host-first-event-card';
import { NoUpcomingEventCard } from '@/components/card/no-upcoming-event-card';
import { signal, computed, Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

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

interface SwiperConfig {
  spaceBetween: number;
  slidesPerView: number;
  allowTouchMove: boolean;
}

@Component({
  selector: 'home-event',
  styleUrl: './home-event.scss',
  templateUrl: './home-event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, UserCard, CityCard, EventCard, UpcomingEventCard, HostFirstEventCard, NoUpcomingEventCard]
})
export class HomeEvent implements AfterViewInit {
  filter = signal<'browse' | 'upcoming'>('browse');
  upcomingEvents = signal<IEvent[]>([]);

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

  peopleCards: IUser[] = [
    {
      name: 'Kathryn Murphy',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Esther Howard',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Arlene McCoy',
      location: 'Atlanta, GA',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    }
  ];

  eventCards: IEvent[] = [
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '12'
    },
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Tue',
      day: '16'
    },
    {
      title: 'Scheveningen',
      organization: 'Networked AI',
      date: 'Fri 8/30, 7.00AM',
      location: 'Atlanta, GA',
      views: '12 views',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '27'
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
        views: '12 views',
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

  @ViewChild('swiperContainerPeople', { static: false }) swiperContainerPeople?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerEventByYou', { static: false }) swiperContainerEventByYou?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerPublicEvent', { static: false }) swiperContainerPublicEvent?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperContainerEventByCities', { static: false }) swiperContainerEventByCities?: ElementRef<HTMLDivElement>;

  private readonly swiperConfigs: Record<string, SwiperConfig> = {
    cities: { spaceBetween: 8, slidesPerView: 2.7, allowTouchMove: true },
    events: { spaceBetween: 8, slidesPerView: 1.5, allowTouchMove: true },
    people: { spaceBetween: 8, slidesPerView: 2.2, allowTouchMove: true }
  };

  handleViewTicket(): void {
    // TODO: Implement view ticket functionality
  }

  private initializeSwiper(element: ElementRef<HTMLDivElement> | undefined, config: SwiperConfig): Swiper | undefined {
    if (!element?.nativeElement) return undefined;

    return new Swiper(element.nativeElement, {
      ...config,
      on: {
        slideChange: () => {
          // Swiper slide change handler
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeSwiper(this.swiperContainerPeople, this.swiperConfigs['people']);
    this.initializeSwiper(this.swiperContainerEventByYou, this.swiperConfigs['events']);
    this.initializeSwiper(this.swiperContainerPublicEvent, this.swiperConfigs['events']);
    this.initializeSwiper(this.swiperContainerEventByCities, this.swiperConfigs['cities']);
  }
}
