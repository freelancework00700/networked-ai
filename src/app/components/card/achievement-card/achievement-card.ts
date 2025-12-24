import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface AchievementCardData {
  id: number;
  threshold: string;
  isLocked: boolean;
  progress: number;
  achievedDate?: string; // Format: "22/06/25"
  badgeColor?: 'gold' | 'silver' | 'purple' | 'teal' | 'red' | 'green' | 'light-purple' | 'light-gold' | 'dark-gold';
  type?: 'events-hosted' | 'events-attended' | 'networks';
}

@Component({
  selector: 'achievement-card',
  imports: [IonIcon, CommonModule],
  styleUrl: './achievement-card.scss',
  templateUrl: './achievement-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchievementCard {
  achievement = input.required<AchievementCardData>();
  onClick = output<AchievementCardData>();

  getPolygonIcon(): string {
    const threshold = this.achievement().threshold;

    const polygonMap: { [key: string]: string } = {
      '10': 'assets/svg/gamification/polygon-10.svg',
      '25': 'assets/svg/gamification/polygon-25.svg',
      '50': 'assets/svg/gamification/polygon-50.svg',
      '100': 'assets/svg/gamification/polygon-100.svg',
      '250': 'assets/svg/gamification/polygon-250.svg',
      '500': 'assets/svg/gamification/polygon-500.svg',
      '1K': 'assets/svg/gamification/polygon-1k.svg',
      '2K': 'assets/svg/gamification/polygon-2k.svg',
      '5K': 'assets/svg/gamification/polygon-5k.svg',
      '10K': 'assets/svg/gamification/polygon-10k.svg'
    };

    return polygonMap[threshold] || 'assets/svg/gamification/hexagon-bg.svg';
  }

  getTypeIcon(): string {
    const type = this.achievement().type;

    const iconMap: { [key: string]: string } = {
      'events-hosted': 'assets/svg/gamification/event-hosted.svg',
      'events-attended': 'assets/svg/gamification/event-attended.svg',
      networks: 'assets/svg/gamification/network.svg'
    };

    return iconMap[type || ''] || '';
  }

  handleClick(): void {
    if (!this.achievement().isLocked) {
      this.onClick.emit(this.achievement());
    }
  }
}
