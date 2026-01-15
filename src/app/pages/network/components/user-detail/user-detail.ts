import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { IUser } from '@/interfaces/IUser';
import { NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';

@Component({
  selector: 'user-detail',
  styleUrl: './user-detail.scss',
  templateUrl: './user-detail.html',
  imports: [ToggleSwitchModule, Button, Chip, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetail {
  // inputs
  @Input() user: IUser | null = null;

  messages = ["Hey, let's network!", 'Wanna hang out?', 'Hey, are you free for some coffee?'];

  getUserImage(): string {
    const imageUrl = this.user?.thumbnail_url || '';
    return getImageUrlOrDefault(imageUrl);
  }

  getAchievementDiamondPath(): string {
    const points = this.user?.total_gamification_points || 0;
    
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
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
