// map-view.component.ts
import { Feature, Polygon } from 'geojson';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { ModalService } from '@/services/modal.service';
import { environment } from 'src/environments/environment';
import { Component, ElementRef, Input, ViewChild, inject, AfterViewInit, OnDestroy, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';

@Component({
  imports: [],
  selector: 'map-view',
  styleUrl: './map-view.scss',
  templateUrl: './map-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapView implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() users: any[] = [];
  @Input() radius: number = 20;
  map: maptilersdk.Map | null = null;
  markers: any[] = [];
  modalService = inject(ModalService);

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;

    if (changes['radius']) {
      this.addOrUpdateRadius();
    }

    if (changes['users']) {
      this.addOrUpdateMarkers();
    }
  }

  private initializeMap(): void {
    if (this.map) return;

    maptilersdk.config.apiKey = environment.maptilerApiKey;

    const center: [number, number] =
      this.users.length && this.users[0].langLocation ? [this.users[0].langLocation.lng, this.users[0].langLocation.lat] : [-84.390648, 33.748533];

    this.map = new maptilersdk.Map({
      container: this.mapContainer.nativeElement,
      style: maptilersdk.MapStyle.STREETS,
      center,
      zoom: 11
    });

    this.map.on('load', () => {
      this.addOrUpdateRadius();
      this.addOrUpdateMarkers();
    });
  }

  private addOrUpdateRadius(): void {
    if (!this.map) return;

    const radiusInMeters = this.radius * 1609.34;
    const center: [number, number] = [this.users[0]?.langLocation?.lng ?? -84.390648, this.users[0]?.langLocation?.lat ?? 33.748533];

    const circleCoordinates = this.createCircleCoordinates(center, radiusInMeters);

    const maskGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
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
        }
      ]
    };

    if (this.map.getSource('mask')) {
      (this.map.getSource('mask') as maptilersdk.GeoJSONSource).setData(maskGeoJson as any);
    } else {
      this.map.addSource('mask', {
        type: 'geojson',
        data: maskGeoJson as any
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

  private addOrUpdateMarkers(): void {
    if (!this.map) return;

    // Remove old markers
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    this.users.forEach((user) => {
      if (!user.langLocation?.lng || !user.langLocation?.lat) return;

      const markerContainer = document.createElement('div');
      markerContainer.className = 'custom-marker-container';

      const img = document.createElement('div');
      img.className = 'custom-marker';
      img.style.backgroundImage = `url(${user?.avatar || 'assets/images/profile.jpeg'})`;

      markerContainer.appendChild(img);

      const marker = new maptilersdk.Marker({ element: markerContainer })
        .setLngLat(this.getAdjustedPosition(user.langLocation.lng, user.langLocation.lat))
        .addTo(this.map as any);

      marker.getElement().addEventListener('click', () => {
        this.modalService.openUserDetailModal(user);
      });

      this.markers.push(marker);
    });
  }

  private createCircleCoordinates(center: [number, number], radiusInMeters: number): [number, number][] {
    const points = 64;
    const coords = [];
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const offsetX = radiusInMeters * Math.cos((angle * Math.PI) / 180);
      const offsetY = radiusInMeters * Math.sin((angle * Math.PI) / 180);

      const latOffset = offsetY / 111320;
      const lngOffset = offsetX / ((40075000 * Math.cos((center[1] * Math.PI) / 180)) / 360);
      coords.push([center[0] + lngOffset, center[1] + latOffset]);
    }
    coords.push(coords[0]);
    return coords as [number, number][];
  }

  private getAdjustedPosition(lng: number, lat: number): [number, number] {
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = Math.random() * 2;
    const deltaLat = (randomDistance * Math.cos(randomAngle)) / 111;
    const deltaLng = (randomDistance * Math.sin(randomAngle)) / (111 * Math.cos(lat * (Math.PI / 180)));
    return [lng + deltaLng, lat + deltaLat];
  }

  ngOnDestroy(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
