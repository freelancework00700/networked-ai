import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { UserCard } from '@/components/card/user-card';
import { Searchbar } from '@/components/common/searchbar';
import { UserCardList } from '@/components/card/user-card-list';
import { SearchEmptyState } from '@/components/common/search-empty-state';
import { UserNetworkRequestCard } from '@/components/card/user-network-request-card';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { inject, signal, computed, Component, afterEveryRender, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'add-network',
  styleUrl: './add-network.scss',
  templateUrl: './add-network.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, UserCard, Searchbar, IonHeader, IonToolbar, IonContent, UserCardList, SearchEmptyState, UserNetworkRequestCard]
})
export class AddNetwork {
  // services
  private navCtrl = inject(NavController);

  // signals
  showAll = signal(false);
  searchQuery = signal<string>('');

  visibleSuggestions = computed(() => {
    const list = this.networkSuggestions();
    return this.showAll() ? list : list.slice(0, 3);
  });

  remainingCount = computed(() => {
    const total = this.networkSuggestions().length;
    return total > 3 ? total - 3 : 0;
  });

  peopleCards = [
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
    this.navCtrl.back()
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
    this.navCtrl.navigateForward(['/chat-room', id]);
  }

  constructor() {
    afterEveryRender(() => this.initSwiper());
  }

  private initSwiper(): void {
    new Swiper('.swiper-user-recommendation', {
      spaceBetween: 8,
      slidesPerView: 2.2,
      allowTouchMove: true,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16
    });
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
