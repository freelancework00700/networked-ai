import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { isPlatformBrowser } from '@angular/common';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { KEYS, LocalStorageService } from '@/services/localstorage.service';
import { signal, inject, Component, OnDestroy, PLATFORM_ID, AfterViewInit } from '@angular/core';

@Component({
  selector: 'onboarding',
  imports: [IonContent, Button],
  styleUrl: './onboarding.scss',
  templateUrl: './onboarding.html'
})
export class Onboarding implements AfterViewInit, OnDestroy {
  // services
  navCtrl = inject(NavController);
  private platformId = inject(PLATFORM_ID);
  private localStorageService = inject(LocalStorageService);

  // signals
  currentSlide = signal(0);

  // swiper instance
  swiper?: Swiper;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.swiper = new Swiper('.swiper-onboarding', {
        spaceBetween: 0,
        slidesPerView: 1,
        allowTouchMove: true,
        on: {
          slideChange: (swiper) => {
            this.currentSlide.set(swiper.activeIndex);
          }
        }
      });
    }
  }

  goToSlide(index: number) {
    if (this.swiper && index >= 0 && index <= 2) {
      this.swiper.slideTo(index);
    }
  }

  completeOnboarding() {
    this.localStorageService.setItem(KEYS.ONBOARDED, 'true');

    // navigate to login page
    this.navCtrl.navigateForward('/login');
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }
}
