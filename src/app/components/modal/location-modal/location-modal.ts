import { HttpClient } from '@angular/common/http';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { environment } from 'src/environments/environment';
import { IonHeader, IonToolbar, IonContent, ModalController } from '@ionic/angular/standalone';
import { of, Subject, catchError, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { Input, inject, OnInit, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';

interface LocationResult {
  city?: string;
  state?: string;
  address: string;
  country?: string;
  latitude: number;
  distance: number; // in miles
  longitude: number;
}

interface MapTilerContext {
  id: string;
  text: string;
  kind?: string;
  text_en?: string;
  country_code?: string;
  place_designation?: string;
}

interface MapTilerFeature {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  text: string;
  text_en?: string;
  relevance: number;
  place_name: string;
  place_name_en?: string;
  context?: MapTilerContext[];
  properties?: Record<string, any>;
}

interface MapTilerGeocodingResponse {
  type: string;
  query: string[];
  attribution: string;
  features: MapTilerFeature[];
}

@Component({
  selector: 'location-modal',
  templateUrl: './location-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, IconFieldModule, InputIconModule, InputTextModule]
})
export class LocationModal implements OnInit {
  // inputs
  @Input() location = '';
  @Input() title = 'Select Location';

  // services
  private modalCtrl = inject(ModalController);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private searchSubject = new Subject<string>();

  // signals
  searchQuery = signal('');
  isSearching = signal(true);
  searchResults = signal<LocationResult[]>([]);

  // default coordinates: 33.7501° N, 84.3885° W (Atlanta, GA)
  private readonly DEFAULT_LAT = 33.7501;
  private readonly DEFAULT_LNG = -84.3885;

  // computed coordinates from current user or defaults
  private readonly currentLat = computed(() => {
    const user = this.authService.currentUser();
    return user?.latitude ?? this.DEFAULT_LAT;
  });

  private readonly currentLng = computed(() => {
    const user = this.authService.currentUser();
    return user?.longitude ?? this.DEFAULT_LNG;
  });

  ngOnInit(): void {
    // set search query
    this.searchQuery.set(this.location);

    // setup debounced search first
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query: string) => {
          if (!query || query.trim().length < 2) {
            return this.searchLocations('Atlanta, GA');
          }
          return this.searchLocations(query);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearching.set(false);
        },
        error: () => {
          this.isSearching.set(false);
          this.searchResults.set([]);
        }
      });

    // trigger the search by emitting to the subject
    this.searchSubject.next(this.searchQuery() || 'Atlanta, GA');
  }

  /**
   * Searches for locations using MapTiler Geocoding API
   * @param query - Search query string
   * @returns Observable of location results with distance calculations
   */
  private searchLocations(query: string) {
    this.isSearching.set(true);
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`;

    return this.http
      .get<MapTilerGeocodingResponse>(url, {
        params: {
          limit: '10',
          key: environment.maptilerApiKey,
          proximity: `${this.currentLng()},${this.currentLat()}` // Bias results towards user location or default
        }
      })
      .pipe(
        catchError((error) => {
          console.error('MapTiler geocoding error:', error);
          return of({ features: [] });
        }),
        switchMap((response) => {
          const results: LocationResult[] = response.features.map((feature) => {
            const [longitude, latitude] = feature.geometry.coordinates;

            // Extract city, state, and country from context array
            let city: string | undefined;
            let state: string | undefined;
            let country: string | undefined;

            if (feature.context && feature.context.length > 0) {
              // Context items are ordered from most specific to least specific
              // City/municipality is usually near the start
              // State/region is in the middle
              // Country is near the end
              for (const ctx of feature.context) {
                const designation = ctx.place_designation?.toLowerCase();
                if (!city && (designation === 'city' || designation === 'municipality' || designation === 'town')) {
                  city = ctx.text_en || ctx.text;
                } else if (!state && (designation === 'state' || designation === 'province' || designation === 'region')) {
                  state = ctx.text_en || ctx.text;
                } else if (!country && designation === 'country') {
                  country = ctx.text_en || ctx.text;
                }
              }
            }

            // use place_name_en or place_name as the address
            const address = feature.place_name_en || feature.place_name || feature.text_en || feature.text || '';

            // calculate distance from user location or default
            const distance = this.calculateDistance(this.currentLat(), this.currentLng(), latitude, longitude);

            return { city, state, address, country, distance, latitude, longitude };
          });

          return of(results);
        })
      );
  }

  /**
   * Calculates the distance between two coordinates using the Haversine formula
   * @param lat1 - Latitude of first point
   * @param lon1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lon2 - Longitude of second point
   * @returns Distance in miles
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Radius of the Earth in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  // converts degrees to radians
  private toRad(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  // formats distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 5280)}ft`; // Convert to feet
    }
    return `${distance}mi`;
  }

  // formats location address for display
  formatAddress(result: LocationResult): string {
    const parts: string[] = [];
    if (result.city) parts.push(result.city);
    if (result.state) parts.push(result.state);
    if (parts.length === 0 && result.country) parts.push(result.country);
    return parts.join(', ');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectLocation(result: LocationResult): void {
    this.searchQuery.set(result.address);
    this.modalCtrl.dismiss({
      address: result.address,
      latitude: String(result.latitude),
      longitude: String(result.longitude),
      city: result.city || '',
      state: result.state || '',
      country: result.country || ''
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    // set default location and trigger search
    this.searchSubject.next('Atlanta, GA');
  }
}
