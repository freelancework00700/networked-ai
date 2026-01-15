import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { UserService } from '@/services/user.service';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { IonContent, IonToolbar, IonHeader, IonFooter } from '@ionic/angular/standalone';
import { LeaderboardUser } from '@/interfaces/IGamification';

type Tab = 'this-week' | 'all-time';

@Component({
  selector: 'leaderboard',
  styleUrl: './leaderboard.scss',
  templateUrl: './leaderboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonFooter, IonHeader, IonToolbar, IonContent, CommonModule, SegmentButton, NgOptimizedImage]
})
export class Leaderboard implements OnInit {
  navCtrl = inject(NavController);
  private userService = inject(UserService);
  private toasterService = inject(ToasterService);
  private navigationService = inject(NavigationService);
  
  tab = signal<Tab>('this-week');
  isLoading = signal<boolean>(false);
  leaderboardData = signal<{ weekly: LeaderboardUser[]; alltime: LeaderboardUser[]; currentUserWeekly: LeaderboardUser | null; currentUserAlltime: LeaderboardUser | null } | null>(null);

  tabItems: SegmentButtonItem[] = [
    {
      value: 'this-week',
      label: 'This Week'
    },
    {
      value: 'all-time',
      label: 'All Time'
    }
  ];

  // Computed properties for current tab data
  currentLeaderboard = computed(() => {
    const data = this.leaderboardData();
    if (!data) return [];
    return this.tab() === 'this-week' ? data.weekly : data.alltime;
  });

  currentUser = computed(() => {
    const data = this.leaderboardData();
    if (!data) return null;
    return this.tab() === 'this-week' ? data.currentUserWeekly : data.currentUserAlltime;
  });

  // Top 3 users with medals
  topThree = computed(() => {
    const leaderboard = this.currentLeaderboard();
    return leaderboard.slice(0, 3);
  });

  // Ranks 4-10
  leaderboardEntries = computed(() => {
    const leaderboard = this.currentLeaderboard();
    return leaderboard.slice(3, 10);
  });

  // User's own rank
  userRank = computed(() => {
    return this.currentUser();
  });

  async ngOnInit(): Promise<void> {
    await this.loadLeaderboard();
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await this.userService.getLeaderboard();
      if (response.success && response.data) {
        this.leaderboardData.set({
          weekly: response.data.weekly?.leaderboard || [],
          alltime: response.data.alltime?.leaderboard || [],
          currentUserWeekly: response.data.weekly?.current_user || null,
          currentUserAlltime: response.data.alltime?.current_user || null
        });
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.toasterService.showError('Failed to load leaderboard');
    } finally {
      this.isLoading.set(false);
    }
  }

  getUserImage(user: LeaderboardUser): string {
    return getImageUrlOrDefault(user.thumbnail_url || '');
  }

  getUserDisplayName(user: LeaderboardUser): string {
    return user.is_current_user ? 'You' : user.name || user.username;
  }

  formatScore(score: number): string {
    return score.toLocaleString();
  }

  getDiamondPath(points: number): string {
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

  onSegmentChange(value: string): void {
    this.tab.set(value as Tab);
  }

  onUserClick(username?: string): void {
    if (username) {
      this.navigationService.navigateForward(`/${username}`);
    }
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
