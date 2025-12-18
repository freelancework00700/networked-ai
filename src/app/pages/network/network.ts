import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { NetworkMapView } from '@/pages/network/components/network-map-view';
import { NetworkListView } from '@/pages/network/components/network-list-view';
import { inject, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonIcon, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'network',
  styleUrl: './network.scss',
  templateUrl: './network.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, IonHeader, Searchbar, IonToolbar, IonContent, NetworkMapView, NetworkListView]
})
export class Network {
  // signals
  radius = signal<number>(20);
  searchQuery = signal<string>('');
  segmentValue = signal<string>('list');

  // services
  private navCtrl = inject(NavController);
  private modalService = inject(ModalService);

  filteredSuggestions = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();

    if (!search) {
      return this.networkSuggestions;
    }

    return this.networkSuggestions.filter(
      (s) => s.name.toLowerCase().includes(search) || s.jobTitle.toLowerCase().includes(search) || s.company.toLowerCase().includes(search)
    );
  });

  networkSuggestions = [
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
      langLocation: { lng: -84.387, lat: 33.744 }
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true,
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
      myProfile: true,
      langLocation: { lng: -84.386, lat: 33.7475 }
    }
  ];

  async openLocationFilterModal() {
    const result = await this.modalService.openLocationFilterModal();
    if (result) {
      this.radius.set(result as number);
    }
  }

  navigateToAddNetwork() {
    this.navCtrl.navigateForward('/add-network');
  }
}
