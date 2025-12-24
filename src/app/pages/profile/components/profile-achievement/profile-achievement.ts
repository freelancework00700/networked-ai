import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NetworkingScoreCard } from '@/components/card/networking-score-card';
import { NavController, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { AchievementCard, AchievementCardData } from '@/components/card/achievement-card';

@Component({
  selector: 'profile-achievement',
  styleUrl: './profile-achievement.scss',
  templateUrl: './profile-achievement.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AchievementCard, IonHeader, IonToolbar, NetworkingScoreCard]
})
export class ProfileAchievement {
  modalService = inject(ModalService);
  navCtrl = inject(NavController);
  router = inject(Router);

  get isStandalonePage(): boolean {
    return this.router.url === '/achievements';
  }

  eventsHostedCount = 144;
  eventsHostedTotal = 250;
  eventsAttendedCount = 15144;
  networksCount = 6771;
  networksTotal = 10000;

  // Check if all achievements are completed
  isAllEventsHostedCompleted(): boolean {
    return this.eventsHostedAchievements.every((a) => !a.isLocked);
  }

  isAllEventsAttendedCompleted(): boolean {
    return this.eventsAttendedAchievements.every((a) => !a.isLocked);
  }

  isAllNetworksCompleted(): boolean {
    return this.networksAchievements.every((a) => !a.isLocked);
  }

  // Get completed count
  getEventsHostedCompleted(): number {
    return this.eventsHostedAchievements.filter((a) => !a.isLocked).length;
  }

  getEventsAttendedCompleted(): number {
    return this.eventsAttendedAchievements.filter((a) => !a.isLocked).length;
  }

  getNetworksCompleted(): number {
    return this.networksAchievements.filter((a) => !a.isLocked).length;
  }

  // Get total achievements (always 10)
  getTotalAchievements(): number {
    return 10;
  }

  // Get progress percentage
  getEventsHostedProgress(): number {
    return (this.eventsHostedCount / this.eventsHostedTotal) * 100;
  }

  getNetworksProgress(): number {
    return (this.networksCount / this.networksTotal) * 100;
  }

  eventsHostedAchievements: AchievementCardData[] = [
    { id: 1, threshold: '10K', isLocked: true, progress: 50, type: 'events-hosted' },
    { id: 2, threshold: '5K', isLocked: true, progress: 8, type: 'events-hosted' },
    { id: 3, threshold: '2K', isLocked: true, progress: 8, type: 'events-hosted' },
    { id: 4, threshold: '1K', isLocked: true, progress: 8, type: 'events-hosted' },
    { id: 5, threshold: '500', isLocked: true, progress: 8, type: 'events-hosted' },
    { id: 6, threshold: '250', isLocked: true, progress: 8, type: 'events-hosted' },
    { id: 7, threshold: '100', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'purple', type: 'events-hosted' },
    { id: 8, threshold: '50', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'teal', type: 'events-hosted' },
    { id: 9, threshold: '25', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'red', type: 'events-hosted' },
    { id: 10, threshold: '10', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'green', type: 'events-hosted' }
  ];

  eventsAttendedAchievements: AchievementCardData[] = [
    { id: 11, threshold: '10K', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'gold', type: 'events-attended' },
    { id: 12, threshold: '5K', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'silver', type: 'events-attended' },
    { id: 13, threshold: '2K', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'light-purple', type: 'events-attended' },
    { id: 14, threshold: '1K', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'light-gold', type: 'events-attended' },
    { id: 15, threshold: '500', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'dark-gold', type: 'events-attended' },
    { id: 16, threshold: '250', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'dark-gold', type: 'events-attended' },
    { id: 17, threshold: '100', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'purple', type: 'events-attended' },
    { id: 18, threshold: '50', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'teal', type: 'events-attended' },
    { id: 19, threshold: '25', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'red', type: 'events-attended' },
    { id: 20, threshold: '10', isLocked: false, progress: 8, achievedDate: '22/08/25', badgeColor: 'green', type: 'events-attended' }
  ];

  networksAchievements: AchievementCardData[] = [
    { id: 21, threshold: '10K', isLocked: true, progress: 8, type: 'networks' },
    { id: 22, threshold: '5K', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'silver', type: 'networks' },
    { id: 23, threshold: '2K', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'light-purple', type: 'networks' },
    { id: 24, threshold: '1K', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'light-gold', type: 'networks' },
    { id: 25, threshold: '500', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'dark-gold', type: 'networks' },
    { id: 26, threshold: '250', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'dark-gold', type: 'networks' },
    { id: 27, threshold: '100', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'purple', type: 'networks' },
    { id: 28, threshold: '50', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'teal', type: 'networks' },
    { id: 29, threshold: '25', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'red', type: 'networks' },
    { id: 30, threshold: '10', isLocked: false, progress: 8, achievedDate: '22/06/25', badgeColor: 'green', type: 'networks' }
  ];

  openAchievementDetailModal(achievement: AchievementCardData) {
    this.modalService.openAchievementDetailModal(achievement);
  }

  navigateToAchievements() {
    this.navCtrl.navigateForward('/achievements');
  }
}
