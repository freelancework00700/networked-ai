import { Swiper } from 'swiper';
import { UserCard } from '@/components/card/user-card';
import { UserRecommendationsService } from '@/services/user-recommendations.service';
import { Component, inject, afterEveryRender, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'user-recommendations',
  styleUrl: './user-recommendations.scss',
  templateUrl: './user-recommendations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserCard]
})
export class UserRecommendations {
  private recommendationsService = inject(UserRecommendationsService);

  // Use shared state from service
  peopleCards = this.recommendationsService.peopleCards;

  constructor() {
    afterEveryRender(() => this.initSwiper());
    this.recommendationsService.loadRecommendations();
  }

  onUserAdded(userId: string): void {
    this.recommendationsService.removeUser(userId);
  }

  private initSwiper(): void {
    new Swiper('.swiper-user-recommendation', {
      spaceBetween: 8,
      slidesPerView: 2.2,
      allowTouchMove: true,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16
    });
  }
}
