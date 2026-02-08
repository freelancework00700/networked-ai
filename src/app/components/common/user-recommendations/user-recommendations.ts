import { UserCard } from '@/components/card/user-card';
import { IonicSlides } from '@ionic/angular/standalone';
import { UserRecommendationsService } from '@/services/user-recommendations.service';
import { inject, Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [UserCard],
  selector: 'user-recommendations',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './user-recommendations.scss',
  templateUrl: './user-recommendations.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRecommendations {
  // services
  private recommendationsService = inject(UserRecommendationsService);
  peopleCards = this.recommendationsService.peopleCards;

  // variables
  swiperModules = [IonicSlides];

  constructor() {
    this.recommendationsService.loadRecommendations();
  }

  onUserAdded(userId: string): void {
    this.recommendationsService.removeUser(userId);
  }
}
