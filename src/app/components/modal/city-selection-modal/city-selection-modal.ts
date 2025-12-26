import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { signal, Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';

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
export class CitySelectionModal {
  modalService = inject(ModalService);

  searchQuery = signal('');

  allCities: City[] = [
    { name: 'Atlanta', state: 'GA', isCurrentLocation: true },
    { name: 'New York', state: 'NJ' },
    { name: 'Athens', state: 'GA' },
    { name: 'Phoenix', state: 'AZ' },
    { name: 'Toronto', state: 'CA' },
    { name: 'Winnipeg', state: 'CA' },
    { name: 'Denver', state: 'CO' },
    { name: 'Cleveland', state: 'OH' },
    { name: 'Pensacola', state: 'FL' },
    { name: 'Davenport', state: 'IA' },
    { name: 'Chicago', state: 'IL' },
    { name: 'Los Angeles', state: 'CA' },
    { name: 'Miami', state: 'FL' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Boston', state: 'MA' }
  ];

  filteredCities = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allCities;
    }
    return this.allCities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query) ||
        `${city.name}, ${city.state}`.toLowerCase().includes(query)
    );
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onSearchClear(): void {
    this.searchQuery.set('');
  }

  selectCity(city: City): void {
    this.modalService.close({
      city: city.name,
      state: city.state,
      fullName: `${city.name}, ${city.state}`
    });
  }

  close(): void {
    this.modalService.close();
  }
}
