import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { IonContent, IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { Button } from '@/components/form/button';

@Component({
  selector: 'onboarding',
  styleUrl: './onboarding.scss',
  templateUrl: './onboarding.html',
  imports: [NgIf, IonToolbar, IonFooter, IonContent, RouterModule, Button]
})
export class Onboarding implements AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer?: ElementRef<HTMLDivElement>;
  router = inject(Router);
  currentSlide = 0;

  ngAfterViewInit() {
    // Swipe handlers disabled
  }

  onScroll(event: any) {
    // Optional: Update slide based on scroll position if needed
  }

  goToSlide(index: number) {
    if (index >= 0 && index <= 2 && this.swiperContainer?.nativeElement) {
      this.currentSlide = index;
      const container = this.swiperContainer.nativeElement;
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  }

  skipOnboarding() {
    this.goToSlide(2);
  }

  completeOnboarding() {
    this.router.navigate(['/login']);
  }
}
