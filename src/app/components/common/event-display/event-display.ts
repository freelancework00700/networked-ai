import {
  inject,
  input,
  computed,
  OnDestroy,
  viewChild,
  Component,
  ElementRef,
  DestroyRef,
  PLATFORM_ID,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectionStrategy,
  effect
} from '@angular/core';
import Swiper from 'swiper';
import { Capacitor } from '@capacitor/core';
import { Pagination } from 'swiper/modules';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { EventDisplayData } from '@/interfaces/event';
import { ModalService } from '@/services/modal.service';
import { NavigationService } from '@/services/navigation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { SegmentButton } from '@/components/common/segment-button';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { AvatarGroupComponent } from '@/components/common/avatar-group';
import { HostEventPromoCard } from '@/components/card/host-event-promo-card';
@Component({
  selector: 'event-display',
  imports: [SegmentButton, AvatarGroupComponent, HostEventPromoCard, IonIcon, Button, NgOptimizedImage],
  styleUrl: './event-display.scss',
  templateUrl: './event-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDisplay implements AfterViewInit, AfterViewChecked, OnDestroy {
  eventData = input.required<Partial<EventDisplayData>>();
  showPreviewBanner = input(false);
  showHostPromo = input(false);
  onDateChange = input<(date: string) => void>();
  onUserListClick = input<(title: string, users: any[]) => void>();
  selectedDate = input<string>('');
  onManageEventClick = input<() => void>();
  onEventChatClick = input<() => void>();
  showActionButtons = input(false);
  hideDateSelector = input(false);

  // platform
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private modalService = inject(ModalService);
  private navigationService = inject(NavigationService);
  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  swiperEventDisplayEl = viewChild<ElementRef<HTMLDivElement>>('swiperEl');

  // MapTiler (lazy loaded)
  private Maptiler!: typeof import('@maptiler/sdk');

  private map: import('@maptiler/sdk').Map | null = null;
  private marker: import('@maptiler/sdk').Marker | null = null;

  private swiper: Swiper | null = null;
  private readonly DEFAULT_ZOOM = 14;

  description = computed(() => {
    const description = this.eventData().description;
    return description ? this.sanitizer.bypassSecurityTrustHtml(description) : '';
  });

  dateItemsForDisplay = computed(() => {
    return this.eventData().dateItems || [];
  });

  displayMediasForDisplay = computed(() => {
    const medias = this.eventData().displayMedias || [];
    return medias.slice(1);
  });

  hasMultipleMedias = computed(() => {
    return this.displayMediasForDisplay().length > 1;
  });

  openMapFromLatLng(mapCenter: number[]): void {
    if (!this.showHostPromo()) return;
    if (!mapCenter || mapCenter.length !== 2) return;

    const [lng, lat] = mapCenter;
    const platform = Capacitor.getPlatform();

    let url = '';

    if (platform === 'ios') {
      url = `https://maps.apple.com/?daddr=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    window.open(url, '_system');
  }

  hasMultipleTickets = computed(() => {
    const tickets = this.eventData().tickets || [];
    return tickets.length > 1;
  });

  canViewAttendees = computed(() => {
    const d = this.eventData();
    return !!(d?.isCurrentUserHost || d?.isCurrentUserAttendee || d?.isCurrentUserCoHost);
  });

  hostUsername = computed(() => {
    const participants = (this.eventData() as any)?.participants;
    if (!Array.isArray(participants)) return null;
    const host = participants.find((p: any) => p?.role === 'Host');
    return host?.user?.username ?? null;
  });

  onHostClick(): void {
    const username = this.hostUsername();
    if (username) this.navigationService.navigateForward(`/${username}`);
  }

  handleDateChange(date: string): void {
    const handler = this.onDateChange();
    if (handler) {
      handler(date);
    }
  }

  handleUserListClick(title: string, users: any[]): void {
    if ((title == 'Going' || title == 'Maybe') && !this.canViewAttendees()) return;
    const handler = this.onUserListClick();
    if (handler) {
      handler(title, users);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initMap();
    }
  }

  ngAfterViewChecked(): void {
    const swiperElement = this.swiperEventDisplayEl()?.nativeElement;
    const medias = this.displayMediasForDisplay();
    const hasMultiple = this.hasMultipleMedias();

    if (swiperElement && hasMultiple) {
      if (!this.swiper) {
        this.swiper = new Swiper(swiperElement, {
          modules: [Pagination],
          slidesPerView: 1,
          spaceBetween: 0,
          allowTouchMove: true,
          observer: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          }
        });
      } else {
        this.swiper.update();
      }
    } else if (this.swiper && (!hasMultiple || medias.length === 0)) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    if (this.isBrowser) {
      const mapCenter = this.eventData().mapCenter;
      if (mapCenter && this.mapContainer() && !this.map) {
        this.initMap();
      } else if (mapCenter && this.map && this.marker) {
        try {
          const currentCenter = this.map.getCenter();
          if (Math.abs(currentCenter.lng - mapCenter[0]) > 0.0001 || Math.abs(currentCenter.lat - mapCenter[1]) > 0.0001) {
            this.map.setCenter(mapCenter);
            this.marker.setLngLat(mapCenter);
          }
        } catch (e) {
          console.warn('Map not ready for update', e);
        }
      }
    }
  }

  private async initMap(): Promise<void> {
    const mapCenter = this.eventData().mapCenter;
    if (!mapCenter || !this.mapContainer() || this.map) return;

    // SSR-safe lazy import
    this.Maptiler = await import('@maptiler/sdk');

    this.Maptiler.config.apiKey = environment.maptilerApiKey;

    const map = new this.Maptiler.Map({
      container: this.mapContainer()!.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${environment.maptilerApiKey}`, // Use newer style URL with API key to avoid deprecation
      center: mapCenter,
      zoom: this.DEFAULT_ZOOM
    });

    map.on('styleimagemissing', (e: any) => {
      if (e && e.id && !map.hasImage(e.id)) {
        const transparentPixel = {
          width: 1,
          height: 1,
          data: new Uint8Array([0, 0, 0, 0])
        };
        map.addImage(e.id, transparentPixel);
      }
    });

    map.on('load', () => {
      map.resize();
      if (!this.marker) {
        this.marker = new this.Maptiler.Marker({ color: '#D33' }).setLngLat(mapCenter).addTo(map);
      }
    });

    this.map = map;
  }

  ngOnDestroy(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  async handleAdmissionClick(): Promise<void> {
    if (this.hasMultipleTickets()) {
      const tickets = this.eventData().tickets || [];
      await this.modalService.openTicketsListModal(tickets);
    }
  }

  async handleCalendarClick(): Promise<void> {
    if (this.eventData().isCurrentUserHost || this.eventData().isCurrentUserAttendee || this.eventData().isCurrentUserCoHost)
      await this.modalService.openAddToCalendarModal(this.eventData());
  }
}
