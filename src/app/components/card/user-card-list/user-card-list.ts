import { Button } from '@/components/form/button';
import { NavController } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { input, inject, output, Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';

@Component({
  imports: [Button, NgOptimizedImage],
  selector: 'user-card-list',
  styleUrl: './user-card-list.scss',
  templateUrl: './user-card-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardList {
  // inputs
  user = input.required<any>();

  // outputs
  handleClick = output<string>();

  // services
  private navCtrl = inject(NavController);
  private navigationService = inject(NavigationService);

  // computed
  userImage = computed(() => {
    const user = this.user();
    return getImageUrlOrDefault(
      user?.thumbnail_url || user?.image_url || '');
  });

  diamondPath = computed(() => {
    const points = this.user()?.total_gamification_points || 0;

    if (points >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (points >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (points >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (points >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (points >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (points >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else {
      return '/assets/svg/gamification/diamond-1k.svg';
    }
  });

  onAddClick(id: string): void {
    if (this.isSelected(id)) {
      this.navCtrl.navigateForward(['/chat-room', id]);
    } else {
      this.handleClick.emit(id);
    }
  }

  onCardClick(): void {
    const username = this.user()?.username;
    this.navigationService.navigateForward(`/${username}`);
  }

  isSelected(id: string): boolean {
    return this.user().connection_status === 'Connected';
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
