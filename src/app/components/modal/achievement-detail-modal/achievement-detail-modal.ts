import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { AchievementCardData } from '@/components/card/achievement-card';
import { IonFooter, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';

@Component({
  selector: 'achievement-detail-modal',
  styleUrl: './achievement-detail-modal.scss',
  templateUrl: './achievement-detail-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonIcon, IonToolbar, IonFooter, Button]
})
export class AchievementDetailModal {
  private modalService = inject(ModalService);

  @Input() achievement: AchievementCardData | null = null;

  getPolygonIcon(): string {
    if (!this.achievement) return '';
    const threshold = this.achievement.threshold;

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
    if (!this.achievement) return '';
    const type = this.achievement.type;

    const iconMap: { [key: string]: string } = {
      'events-hosted': 'assets/svg/gamification/event-hosted.svg',
      'events-attended': 'assets/svg/gamification/event-attended.svg',
      networks: 'assets/svg/gamification/network.svg'
    };

    return iconMap[type || ''] || '';
  }

  getTitle(): string {
    if (!this.achievement) return '';
    const type = this.achievement.type;

    const titleMap: { [key: string]: string } = {
      'events-hosted': 'Events Hosted',
      'events-attended': 'Events Attended',
      networks: 'Networks'
    };

    return titleMap[type || ''] || 'Achievement';
  }

  getDescription(): string {
    if (!this.achievement) return '';
    const threshold = this.achievement.threshold;
    const type = this.achievement.type;

    const typeName = type === 'events-hosted' ? 'hosting an event' : type === 'events-attended' ? 'attending an event' : 'building networks';

    return `This achievement is earned by ${typeName} ${threshold} times!`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    const date = new Date(`20${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  close() {
    this.modalService.close(null, 'close');
  }
}
