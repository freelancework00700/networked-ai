import { Swiper } from 'swiper';
import { Router } from '@angular/router';
import { Button } from '@/components/form/button';
import { Searchbar } from '@/components/common/searchbar';
import { IUser, UserCard } from '@/components/card/user-card';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Component, computed, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
interface SwiperConfig {
  spaceBetween: number;
  slidesPerView: number;
  allowTouchMove: boolean;
}
@Component({
  selector: 'add-network',
  styleUrl: './add-network.scss',
  templateUrl: './add-network.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonHeader, IonContent, Searchbar, Button, UserCard]
})
export class AddNetwork {
  @ViewChild('swiperContainerPeople', { static: false }) swiperContainerPeople?: ElementRef<HTMLDivElement>;
  private router = inject(Router);
  searchQuery = signal<string>('');
  showAll = signal(false);

  visibleSuggestions = computed(() => {
    const list = this.networkSuggestions();
    return this.showAll() ? list : list.slice(0, 3);
  });

  remainingCount = computed(() => {
    const total = this.networkSuggestions().length;
    return total > 3 ? total - 3 : 0;
  });

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

  networkSuggestions = signal([
    {
      id: '1',
      name: 'Kathryn Murphy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.390648, lat: 33.748533 }
    },
    {
      id: '2',
      name: 'Esther Howard',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.395, lat: 33.75 }
    },
    {
      id: '3',
      name: 'Arlene McCoy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: false,
      requested: true,
      langLocation: { lng: -84.385, lat: 33.745 }
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.392, lat: 33.747 }
    },
    {
      id: '5',
      name: 'Ronald Richards',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.388, lat: 33.749 }
    },
    {
      id: '6',
      name: 'Albert Flores',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.391, lat: 33.746 }
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: false,
      requested: true,
      langLocation: { lng: -84.387, lat: 33.744 }
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      langLocation: { lng: -84.394, lat: 33.751 }
    },
    {
      id: '9',
      name: 'Guy Hawkins',
      value: 200,
      jobTitle: 'CTO',
      company: 'Cortazzo Consulting',
      networked: false,
      langLocation: { lng: -84.389, lat: 33.748 }
    },
    {
      id: '10',
      name: 'Cody Fisher',
      value: 200,
      jobTitle: 'CFO',
      company: 'Cortazzo Consulting',
      networked: true,
      langLocation: { lng: -84.386, lat: 33.7475 }
    }
  ]);

  filteredSuggestions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.networkSuggestions().filter((item) => item.name.toLowerCase().includes(q));
  });

  navigateBack() {
    this.router.navigate(['/network']);
  }

  scanQRCode() {
    console.log('scanQRCode');
  }

  addSuggestion(id: string) {
    const user = this.networkSuggestions().find((item) => item.id === id);
    if (!user) return;

    user.requested = true;
    user.networked = false;
  }

  removeSuggestion(id: string) {
    this.networkSuggestions().find((item) => item.id === id)!.networked = false;
  }

  messageUser(id: string) {
    this.router.navigate(['/chat-room', id]);
  }

  private readonly swiperConfigs: Record<string, SwiperConfig> = {
    cities: { spaceBetween: 8, slidesPerView: 2.7, allowTouchMove: true },
    events: { spaceBetween: 8, slidesPerView: 1.5, allowTouchMove: true },
    people: { spaceBetween: 8, slidesPerView: 2.2, allowTouchMove: true }
  };

  private initializeSwiper(element: ElementRef<HTMLDivElement> | undefined, config: SwiperConfig): Swiper | undefined {
    if (!element?.nativeElement) return undefined;

    return new Swiper(element.nativeElement, {
      ...config,
      on: {
        slideChange: () => {}
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeSwiper(this.swiperContainerPeople, this.swiperConfigs['people']);
  }

  acceptNetwork(id: string) {
    this.networkSuggestions.update((list) => list.filter((item) => item.id !== id));
  }

  rejectNetwork(id: string) {
    this.networkSuggestions.update((list) => list.filter((item) => item.id !== id));
  }

  toggleView() {
    this.showAll.update((v) => !v);
  }
}
