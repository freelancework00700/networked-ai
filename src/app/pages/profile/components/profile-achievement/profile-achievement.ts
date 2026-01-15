import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, computed, input, signal, OnInit } from '@angular/core';
import { NavController, IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { AchievementsContent } from '@/components/common/achievements-content';

@Component({
  selector: 'profile-achievement',
  styleUrl: './profile-achievement.scss',
  templateUrl: './profile-achievement.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, AchievementsContent]
})
export class ProfileAchievement implements OnInit {
  navCtrl = inject(NavController);
  router = inject(Router);

  user = input<any>(null);

  // For standalone page, get data from navigation state
  navigationUser = signal<any>(null);

  isStandalonePage = computed(() => this.router.url === '/achievements');

  ngOnInit(): void {
    // Get data from navigation state if on standalone page
    if (this.isStandalonePage()) {
      const navigation = this.router.currentNavigation();
      const state = navigation?.extras?.state || history.state;
      
      if (state?.user) {
        this.navigationUser.set(state.user);
      }
    }
  }

  navigateToAchievements() {
    const user = this.user();
    this.navCtrl.navigateForward('/achievements', {
      state: { user }
    });
  }

  effectiveUser = computed(() => {
    return this.user() || this.navigationUser();
  });
}
