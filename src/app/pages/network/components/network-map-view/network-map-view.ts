import {
  input,
  inject,
  effect,
  Inject,
  DOCUMENT,
  Component,
  viewChild,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy
} from '@angular/core';
import * as Maptiler from '@maptiler/sdk';
import { Feature, Polygon } from 'geojson';
import { ModalService } from '@/services/modal.service';
import { environment } from 'src/environments/environment';

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
  users = input<any[]>([]);

  // view child
  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  // services
  private modalService = inject(ModalService);
  @Inject(DOCUMENT) private document = inject(DOCUMENT);

  // map state
  private map: Maptiler.Map | null = null;
  private markers: Maptiler.Marker[] = [];

  // default center coordinates (Atlanta, GA)
  private readonly DEFAULT_ZOOM = 11;
  private readonly CIRCLE_POINTS = 64;
  private readonly MILES_TO_METERS = 1609.34;
  private readonly DEFAULT_CENTER: MapCenter = [-84.390648, 33.748533];

  constructor() {
    // radius changes after map is initialized
    effect(() => {
      const radiusValue = this.radius();
      if (this.map) {
        this.addOrUpdateRadius(radiusValue);
      }
    });

    // users changes after map is initialized
    effect(() => {
      const usersValue = this.users();
      if (this.map) {
        this.addOrUpdateMarkers(usersValue);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeMap(): void {
    if (this.map) return;

    Maptiler.config.apiKey = environment.maptilerApiKey;

    const center = this.getMapCenter();
    const container = this.mapContainer().nativeElement;

    this.map = new Maptiler.Map({
      center,
      container,
      zoom: this.DEFAULT_ZOOM,
      style: Maptiler.MapStyle.STREETS
    });

    this.map.on('load', () => {
      this.addOrUpdateRadius(this.radius());
      this.addOrUpdateMarkers(this.users());
    });
  }

  private getMapCenter(): MapCenter {
    const firstUser = this.users()[0];
    if (firstUser?.langLocation) {
      return [firstUser.langLocation.lng, firstUser.langLocation.lat];
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

    const source = this.map.getSource('mask') as Maptiler.GeoJSONSource | undefined;

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

  private addOrUpdateMarkers(users: any[]): void {
    if (!this.map) return;

    // remove old markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    users.forEach((user) => {
      if (!user.langLocation?.lng || !user.langLocation?.lat) return;

      const markerElement = this.createMarkerElement(user);
      const position = this.getAdjustedPosition(user.langLocation.lng, user.langLocation.lat);

      const marker = new Maptiler.Marker({ element: markerElement }).setLngLat(position).addTo(this.map!);

      marker.getElement().addEventListener('click', () => {
        this.modalService.openUserDetailModal(user);
      });

      this.markers.push(marker);
    });
  }

  private createMarkerElement(user: any): HTMLDivElement {
    const container = this.document.createElement('div');
    container.className = 'custom-marker-container';

    const img = this.document.createElement('div');
    img.className = 'custom-marker';
    img.style.backgroundImage = `url(${user.avatar || 'assets/images/profile.jpeg'})`;

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
