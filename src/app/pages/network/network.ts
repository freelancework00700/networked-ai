import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { NetworkMapView } from '@/pages/network/components/network-map-view';
import { NetworkListView } from '@/pages/network/components/network-list-view';
import { AuthEmptyState } from '@/components/common/auth-empty-state';
import { AuthService } from '@/services/auth.service';
import { inject, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonIcon, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'network',
  styleUrl: './network.scss',
  templateUrl: './network.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, IonHeader, Searchbar, IonToolbar, IonContent, NetworkMapView, NetworkListView, AuthEmptyState]
})
export class Network {
  // signals
  radius = signal<number>(20);
  searchQuery = signal<string>('');
  segmentValue = signal<string>('list');

  // services
  private navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  // computed
  isLoggedIn = computed(() => !!this.authService.currentUser());

  filteredSuggestions = computed(() => {
    return this.networkSuggestions;
  });

  networkSuggestions: any[] = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.748533,
      longitude: -84.390648
    },
    {
      id: '2',
      name: 'Esther Howard',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.75,
      longitude: -84.395
    },
    {
      id: '3',
      name: 'Arlene McCoy',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'NotConnected',
      latitude: 33.745,
      longitude: -84.385
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.747,
      longitude: -84.392
    },
    {
      id: '5',
      name: 'Ronald Richards',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.749,
      longitude: -84.388
    },
    {
      id: '6',
      name: 'Albert Flores',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.746,
      longitude: -84.391
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'NotConnected',
      latitude: 33.744,
      longitude: -84.387
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      title: 'Founder & CEO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'Connected',
      latitude: 33.751,
      longitude: -84.394
    },
    {
      id: '9',
      name: 'Guy Hawkins',
      title: 'CTO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'NotConnected',
      latitude: 33.748,
      longitude: -84.389
    },
    {
      id: '10',
      name: 'Cody Fisher',
      title: 'CFO',
      company_name: 'Cortazzo Consulting',
      total_gamification_points: 200,
      connection_status: 'NotConnected',
      latitude: 33.7475,
      longitude: -84.386
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
