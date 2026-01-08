import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { NavController, IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { AchievementsContent } from '@/components/common/achievements-content';

@Component({
  selector: 'profile-achievement',
  styleUrl: './profile-achievement.scss',
  templateUrl: './profile-achievement.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, AchievementsContent]
})
export class ProfileAchievement {
  navCtrl = inject(NavController);
  router = inject(Router);

  isStandalonePage = computed(() => this.router.url === '/achievements');

  navigateToAchievements() {
    this.navCtrl.navigateForward('/achievements');
  }
}
