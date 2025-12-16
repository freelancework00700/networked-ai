import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { signal, inject, Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'onboarding',
  imports: [IonContent, Button],
  styleUrl: './onboarding.scss',
  templateUrl: './onboarding.html'
})
export class Onboarding implements AfterViewInit, OnDestroy {
  // services
  navCtrl = inject(NavController);

  // signals
  currentSlide = signal(0);

  // swiper instance
  swiper?: Swiper;

  ngAfterViewInit() {
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

  goToSlide(index: number) {
    if (this.swiper && index >= 0 && index <= 2) {
      this.swiper.slideTo(index);
    }
  }

  completeOnboarding() {
    // set onboarded flag in localStorage
    localStorage.setItem('onboarded', 'true');

    // navigate to login page
    this.navCtrl.navigateForward('/login');
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }
}
