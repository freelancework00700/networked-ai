import {
  input,
  inject,
  effect,
  Inject,
  DOCUMENT,
  Component,
  viewChild,
  signal,
  OnDestroy,
  ElementRef,
  PLATFORM_ID,
  AfterViewInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { Feature, Polygon } from 'geojson';
import { isPlatformBrowser } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { NetworkService } from '@/services/network.service';
import { ToasterService } from '@/services/toaster.service';
import { environment } from 'src/environments/environment';
import { IUser } from '@/interfaces/IUser';

type MapCenter = [number, number];

@Component({
  selector: 'network-map-view',
  styleUrl: './network-map-view.scss',
  templateUrl: './network-map-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkMapView implements AfterViewInit, OnDestroy {
  // inputs
  radius = input(20);
  latitude = input<string>('');
  longitude = input<string>('');
  isActive = input(false);

  // view child
  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  // platform
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // services
  private modalService = inject(ModalService);
  private networkService = inject(NetworkService);
  private toasterService = inject(ToasterService);
  @Inject(DOCUMENT) private document = inject(DOCUMENT);

  // signals
  users = signal<IUser[]>([]);
  isLoading = signal<boolean>(false);

  // MapTiler (lazy-loaded)
  private Maptiler!: typeof import('@maptiler/sdk');

  // map state
  private map: import('@maptiler/sdk').Map | null = null;
  private markers: import('@maptiler/sdk').Marker[] = [];

  // default center coordinates (Atlanta, GA)
  private readonly DEFAULT_ZOOM = 11;
  private readonly CIRCLE_POINTS = 64;
  private readonly MILES_TO_METERS = 1609.34;
  private readonly DEFAULT_CENTER: MapCenter = [-84.390648, 33.748533];

  constructor() {
    // Load users when radius, latitude, or longitude changes (only after map is initialized)
    effect(() => {
      const radiusValue = this.radius();
      const lat = this.latitude();
      const lng = this.longitude();
      this.loadUsers(radiusValue, lat, lng);
    });

    effect(() => {
      const usersValue = this.users();
      if (this.map && usersValue.length > 0) {
        this.addOrUpdateMarkers(usersValue);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    await this.initializeMap();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeMap(): Promise<void> {
    if (this.map || !this.isBrowser) return;

    // SSR-safe lazy import
    this.Maptiler = await import('@maptiler/sdk');

    this.Maptiler.config.apiKey = environment.maptilerApiKey;

    const center = this.getMapCenter();
    const container = this.mapContainer().nativeElement;

    this.map = new this.Maptiler.Map({
      center,
      container,
      zoom: this.DEFAULT_ZOOM,
      style: this.Maptiler.MapStyle.STREETS
    });

    this.map.on('load', () => {
      this.addOrUpdateRadius(this.radius());

      if (this.users().length > 0) {
        this.addOrUpdateMarkers(this.users());
      }
      // Load initial users if we don't have any yet
      if (this.users().length === 0) {
        this.loadUsers(this.radius(), this.latitude(), this.longitude());
      }
    });
  }

  private async loadUsers(radius: number, latitude?: string, longitude?: string): Promise<void> {
    if (!this.isBrowser) return;

    try {
      this.isLoading.set(true);

      const params: { radius: number; latitude?: string; longitude?: string } = { radius, latitude, longitude };

      const { data: users, message } = await this.networkService.getNetworksWithinRadius(params);
      this.users.set(users);

      if (this.isActive() && users.length === 0 && message) {
        this.toasterService.showError(message);
      }

      // Update markers immediately if map is ready
      if (this.map) {
        this.addOrUpdateMarkers(users);
      }

      if (latitude && longitude && this.map) {
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
          this.map.setCenter([lngNum, latNum]);
          this.addOrUpdateRadius(radius);
        }
      } else if (users.length > 0 && this.map) {
        // Center map on first user if no location filter
        const firstUser = users[0];
        if (firstUser?.longitude && firstUser?.latitude) {
          const lngNum = typeof firstUser.longitude === 'string' ? parseFloat(firstUser.longitude) : firstUser.longitude;
          const latNum = typeof firstUser.latitude === 'string' ? parseFloat(firstUser.latitude) : firstUser.latitude;
          if (!isNaN(lngNum) && !isNaN(latNum)) {
            this.map.setCenter([lngNum, latNum]);
            // Update radius circle with new center
            this.addOrUpdateRadius(radius);
          }
        }
      } else if (this.map) {
        this.addOrUpdateRadius(radius);
      }
    } catch (error) {
      console.error('Error loading users for map:', error);
      this.users.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getMapCenter(): MapCenter {
    const lat = this.latitude();
    const lng = this.longitude();

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return [lngNum, latNum];
      }
    }

    const firstUser = this.users()[0];
    if (firstUser?.longitude && firstUser?.latitude) {
      const lngNum = typeof firstUser.longitude === 'string' ? parseFloat(firstUser.longitude) : firstUser.longitude;
      const latNum = typeof firstUser.latitude === 'string' ? parseFloat(firstUser.latitude) : firstUser.latitude;
      if (!isNaN(lngNum) && !isNaN(latNum)) {
        return [lngNum, latNum];
      }
    }

    return this.DEFAULT_CENTER;
  }

  private addOrUpdateRadius(radiusValue: number): void {
    if (!this.map) return;

    const radiusInMeters = radiusValue * this.MILES_TO_METERS;
    const center = this.getMapCenter();
    const circleCoordinates = this.createCircleCoordinates(center, radiusInMeters);

    const maskGeoJson: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-180, -90],
            [-180, 90],
            [180, 90],
            [180, -90],
            [-180, -90]
          ],
          circleCoordinates
        ]
      }
    };

    const source = this.map.getSource('mask') as import('@maptiler/sdk').GeoJSONSource | undefined;

    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [maskGeoJson]
      });
    } else {
      this.map.addSource('mask', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [maskGeoJson]
        }
      });

      this.map.addLayer({
        id: 'dark-layer',
        type: 'fill',
        source: 'mask',
        paint: {
          'fill-color': 'rgba(0,0,0,0.5)',
          'fill-opacity': 0.6
        }
      });
    }
  }

  private addOrUpdateMarkers(users: IUser[]): void {
    if (!this.map) return;

    // remove old markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    users.forEach((user) => {
      const longitude = user.longitude ? (typeof user.longitude === 'string' ? parseFloat(user.longitude) : user.longitude) : null;
      const latitude = user.latitude ? (typeof user.latitude === 'string' ? parseFloat(user.latitude) : user.latitude) : null;

      if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) return;

      const markerElement = this.createMarkerElement(user);
      const position = this.getAdjustedPosition(longitude, latitude);
      const marker = new this.Maptiler.Marker({ element: markerElement }).setLngLat(position).addTo(this.map!);

      marker.getElement().addEventListener('click', () => {
        this.modalService.openUserDetailModal(user);
      });

      this.markers.push(marker);
    });
  }

  private createMarkerElement(user: IUser): HTMLDivElement {
    const container = this.document.createElement('div');
    container.className = 'custom-marker-container';

    const img = this.document.createElement('div');
    img.className = 'custom-marker';
    const imageUrl = user.thumbnail_url || user.image_url || 'assets/images/profile.jpeg';
    img.style.backgroundImage = `url(${imageUrl})`;

    container.appendChild(img);
    return container;
  }

  private createCircleCoordinates(center: MapCenter, radiusInMeters: number): MapCenter[] {
    const coords: MapCenter[] = [];

    for (let i = 0; i < this.CIRCLE_POINTS; i++) {
      const angle = (i * 360) / this.CIRCLE_POINTS;
      const offsetX = radiusInMeters * Math.cos((angle * Math.PI) / 180);
      const offsetY = radiusInMeters * Math.sin((angle * Math.PI) / 180);

      const latOffset = offsetY / 111320;
      const lngOffset = offsetX / ((40075000 * Math.cos((center[1] * Math.PI) / 180)) / 360);
      coords.push([center[0] + lngOffset, center[1] + latOffset]);
    }

    coords.push(coords[0]); // close the circle
    return coords;
  }

  private getAdjustedPosition(lng: number, lat: number): MapCenter {
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = Math.random() * 2;
    const deltaLat = (randomDistance * Math.cos(randomAngle)) / 111;
    const deltaLng = (randomDistance * Math.sin(randomAngle)) / (111 * Math.cos(lat * (Math.PI / 180)));
    return [lng + deltaLng, lat + deltaLat];
  }

  private cleanup(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
