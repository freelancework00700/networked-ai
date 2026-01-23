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
  @ViewChild('swiperEl')
  set swiperElement(el: ElementRef<HTMLDivElement>) {
    if (!el) return;
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.swiper) return;
  
    this.swiper = new Swiper(el.nativeElement, {
      spaceBetween: 8,
      slidesPerView: 2.2,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      allowTouchMove: true,
      observer: true,
      observeParents: true,
    });
    
  }
  private recommendationsService = inject(UserRecommendationsService);

  // Use shared state from service
  peopleCards = this.recommendationsService.peopleCards;

  constructor() {
    this.recommendationsService.loadRecommendations();
  }

  onUserAdded(userId: string): void {
    this.recommendationsService.removeUser(userId);
  }

}
