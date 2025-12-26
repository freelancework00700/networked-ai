import { AfterViewInit, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Button } from '@/components/form/button';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-event-detail',
  imports: [
    IonIcon,
    IonButton,
    IonButtons,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonContent,
    Avatar,
    AvatarGroup,
    Button,
    IonFooter,
    IonSegment,
    IonSegmentButton,
    FormsModule
  ],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
  standalone: true
})
export class EventDetail implements AfterViewInit {
  isScrolled = signal(false);
  selectedDate = '10/01';
  private platformId = inject(PLATFORM_ID);

  getProgressWidth(): number {
    const dates = ['09/24', '10/01', '10/08', '10/15'];
    const index = dates.indexOf(this.selectedDate);
    return ((index + 1) / dates.length) * 100;
  }

  isDateSelected(date: string): boolean {
    return this.selectedDate === date;
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      new Swiper('.swiper-event-detail', {
        modules: [Pagination],
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: true,
        pagination: {
          el: '.swiper-event-detail .swiper-pagination',
          clickable: true
        }
      });
    }
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled.set(scrollTop > 100);
  }
}
