import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { Searchbar } from '@/components/common/searchbar';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { signal, Component, ChangeDetectionStrategy, inject, computed, OnInit, Input } from '@angular/core';

interface City {
  name: string;
  state: string;
  isCurrentLocation?: boolean;
}

@Component({
  selector: 'city-selection-modal',
  templateUrl: './city-selection-modal.html',
  styleUrl: './city-selection-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, CommonModule, Searchbar]
})
export class CitySelectionModal implements OnInit {
  modalService = inject(ModalService);
  eventService = inject(EventService);
  private modalCtrl = inject(ModalController);

  @Input() selectedCity?: { city: string; state: string };

  searchQuery = signal('');
  allCities = signal<City[]>([]);
  isLoading = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    await this.loadCities();
  }

  private async loadCities(): Promise<void> {
    try {
      this.isLoading.set(true);
      const cities = await this.eventService.getTopCities();
      const mappedCities: City[] = cities.map(city => ({
        name: city.city || '',
        state: city.state,
        isCurrentLocation: false
      }));
      this.allCities.set(mappedCities);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  filteredCities = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cities = this.allCities();
    if (!query) {
      return cities;
    }
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query) ||
        `${city.name}, ${city.state}`.toLowerCase().includes(query)
    );
  });

  isSelected = computed(() => {
    const selected = this.selectedCity;
    if (!selected || (!selected.city && !selected.state)) {
      return (city: City | 'all') => city === 'all';
    }
    
    return (city: City | 'all') => {
      if (city === 'all') return false;
      return city.name === selected.city && city.state === selected.state;
    };
  });

  isAllSelected = computed(() => {
    const selected = this.selectedCity;
    return !selected || (!selected.city && !selected.state);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onSearchClear(): void {
    this.searchQuery.set('');
  }

  selectAll(): void {
    this.modalCtrl.dismiss({
      city: '',
      state: '',
      fullName: 'All'
    });
  }

  selectCity(city: City): void {
    this.modalCtrl.dismiss({
      city: city.name,
      state: city.state,
      fullName: `${city.name}, ${city.state}`
    });
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
