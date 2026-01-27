import { Swiper } from 'swiper';
import { isPlatformBrowser } from '@angular/common';
import { UserCard } from '@/components/card/user-card';
import { UserRecommendationsService } from '@/services/user-recommendations.service';
import { Component, inject, afterEveryRender, ChangeDetectionStrategy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'user-recommendations',
  styleUrl: './user-recommendations.scss',
  templateUrl: './user-recommendations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserCard]
})
export class UserRecommendations {
  swiper?: Swiper;

  private platformId = inject(PLATFORM_ID);
  private recommendationsService = inject(UserRecommendationsService);

  // Use shared state from service
  peopleCards = this.recommendationsService.peopleCards;

  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

  constructor() {
    this.recommendationsService.loadRecommendations();

    afterEveryRender(() => {
      const count = this.peopleCards().length;

      // 🔥 went from filled → empty
      if (count === 0) {
        this.destroySwiper();
      }

      // 🔥 went from empty → filled
      if (count > 0) {
        this.initSwiperIfPossible();
      }
    });
  }

  private initSwiperIfPossible(): void {
    if (!this.swiperEl) return;
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.swiper) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      spaceBetween: 8,
      slidesPerView: 2.2,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      allowTouchMove: true
    });
  }

  private destroySwiper(): void {
    this.swiper?.destroy(true, true);
    this.swiper = undefined;
  }

  onUserAdded(userId: string): void {
    this.recommendationsService.removeUser(userId);
  }
}
