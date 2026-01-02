import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { EventCard } from '@/components/card/event-card';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'scity-events',
  styleUrl: './city-events.scss',
  templateUrl: './city-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, EventCard, Searchbar, EmptyState]
})
export class CityEvents {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);

  selectedCity = signal<{ city: string; state: string; fullName: string }>({
    city: 'Atlanta',
    state: 'GA',
    fullName: 'Atlanta, GA'
  });

  searchQuery = signal('');
  displayedEventsCount = signal(6);

  allEvents: IEvent[] = [
    {
      title: 'Tech Innovation Summit',
      organization: 'Atlanta Tech Hub',
      date: 'Fri 8/30, 7:00 AM',
      location: 'Atlanta, GA',
      views: '12',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '12'
    },
    {
      title: 'Music Festival 2024',
      organization: 'Atlanta Music Scene',
      date: 'Sat 9/1, 2:00 PM',
      location: 'Atlanta, GA',
      views: '45',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '1'
    },
    {
      title: 'Business Networking Night',
      organization: 'Atlanta Chamber',
      date: 'Wed 9/4, 6:00 PM',
      location: 'Atlanta, GA',
      views: '28',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Wed',
      day: '4'
    },
    {
      title: 'Broadway Showcase',
      organization: 'NYC Arts Council',
      date: 'Sun 9/2, 3:00 PM',
      location: 'New York, NJ',
      views: '89',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '2'
    },
    {
      title: 'Startup Pitch Night',
      organization: 'NYC Ventures',
      date: 'Thu 9/5, 7:00 PM',
      location: 'New York, NJ',
      views: '156',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Thu',
      day: '5'
    },
    {
      title: 'Mountain Hiking Adventure',
      organization: 'Denver Outdoors',
      date: 'Sat 9/7, 8:00 AM',
      location: 'Denver, CO',
      views: '67',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '7'
    },
    {
      title: 'Craft Beer Festival',
      organization: 'Denver Brewers',
      date: 'Sun 9/8, 12:00 PM',
      location: 'Denver, CO',
      views: '234',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '8'
    },
    {
      title: 'Jazz Night Live',
      organization: 'Chicago Jazz Club',
      date: 'Fri 9/6, 9:00 PM',
      location: 'Chicago, IL',
      views: '91',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '6'
    },
    {
      title: 'Food & Wine Expo',
      organization: 'Chicago Culinary',
      date: 'Sat 9/14, 11:00 AM',
      location: 'Chicago, IL',
      views: '178',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '14'
    },
    {
      title: 'Desert Photography Workshop',
      organization: 'Arizona Photographers',
      date: 'Sun 9/15, 6:00 AM',
      location: 'Phoenix, AZ',
      views: '34',
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '15'
    },
    {
      title: 'Yoga in the Park',
      organization: 'Phoenix Wellness',
      date: 'Mon 9/16, 7:00 AM',
      location: 'Phoenix, AZ',
      views: '56',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Mon',
      day: '16'
    },
    {
      title: 'Film Festival Opening',
      organization: 'Toronto Cinema',
      date: 'Thu 9/12, 7:30 PM',
      location: 'Toronto, CA',
      views: '201',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Thu',
      day: '12'
    },
    {
      title: 'Hockey Game Night',
      organization: 'Toronto Sports',
      date: 'Sat 9/21, 8:00 PM',
      location: 'Toronto, CA',
      views: '312',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '21'
    },
    {
      title: 'Rock & Roll Hall of Fame Tour',
      organization: 'Cleveland Music',
      date: 'Sun 9/22, 2:00 PM',
      location: 'Cleveland, OH',
      views: '78',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '22'
    },
    {
      title: 'Lake Erie Sailing',
      organization: 'Cleveland Yacht Club',
      date: 'Sat 9/28, 10:00 AM',
      location: 'Cleveland, OH',
      views: '43',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '28'
    },
    {
      title: 'Beach Volleyball Tournament',
      organization: 'Miami Sports',
      date: 'Sun 9/29, 9:00 AM',
      location: 'Miami, FL',
      views: '145',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '29'
    },
    {
      title: 'Latin Music Night',
      organization: 'Miami Nights',
      date: 'Fri 10/4, 10:00 PM',
      location: 'Miami, FL',
      views: '267',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Fri',
      day: '4'
    },
    {
      title: 'Coffee Cupping Experience',
      organization: 'Seattle Roasters',
      date: 'Sat 10/5, 10:00 AM',
      location: 'Seattle, WA',
      views: '89',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '5'
    },
    {
      title: 'Tech Meetup',
      organization: 'Seattle Tech Hub',
      date: 'Wed 10/9, 6:30 PM',
      location: 'Seattle, WA',
      views: '112',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Wed',
      day: '9'
    },
    {
      title: 'Historical Walking Tour',
      organization: 'Boston Heritage',
      date: 'Sun 10/6, 11:00 AM',
      location: 'Boston, MA',
      views: '56',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '6'
    },
    {
      title: 'Marathon Training Session',
      organization: 'Boston Runners',
      date: 'Sat 10/12, 7:00 AM',
      location: 'Boston, MA',
      views: '134',
      image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sat',
      day: '12'
    },
    {
      title: 'Hollywood Movie Premiere',
      organization: 'LA Entertainment',
      date: 'Thu 10/10, 8:00 PM',
      location: 'Los Angeles, CA',
      views: '423',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Thu',
      day: '10'
    },
    {
      title: 'Surfing Competition',
      organization: 'LA Beach Sports',
      date: 'Sun 10/13, 7:00 AM',
      location: 'Los Angeles, CA',
      views: '298',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      dayOfWeek: 'Sun',
      day: '13'
    }
  ];

  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const city = this.selectedCity();
    let events = this.allEvents;

    events = events.filter((event) => event.location.includes(city.fullName));

    if (query) {
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.organization.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
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
