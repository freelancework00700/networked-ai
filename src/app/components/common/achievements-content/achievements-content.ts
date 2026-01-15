import { CommonModule } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { UserService } from '@/services/user.service';
import { AuthService } from '@/services/auth.service';
import { ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit, computed, effect, untracked } from '@angular/core';
import { AchievementCard } from '@/components/card/achievement-card';
import { NetworkingScoreCard } from '@/components/card/networking-score-card';
import { GamificationBadge, GamificationCategory } from '@/interfaces/IGamification';

@Component({
  selector: 'achievements-content',
  styleUrl: './achievements-content.scss',
  templateUrl: './achievements-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AchievementCard, NetworkingScoreCard]
})
export class AchievementsContent implements OnInit {
  modalService = inject(ModalService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Inputs
  showHeader = input(false);
  showSeeAll = input(false);
  showNetworkingScore = input(false);
  user = input<any>(null);

  // Signals for API data
  isLoading = signal<boolean>(false);
  gamificationData = signal<Record<string, GamificationCategory>>({});

  userId = computed(() => {
    const userObj = this.user() || this.authService.currentUser();
    return userObj?.id || null;
  });

  networkingScore = computed(() => {
    const userObj = this.user() || this.authService.currentUser();
    return userObj?.total_gamification_points || 0;
  });

  // Category display names mapping
  categoryDisplayNames: Record<string, string> = {
    total_events_attended: 'Events Attended',
    total_events_hosted: 'Events Hosted',
    total_networks: 'Networks',
    total_messages_sent: 'Messages',
    total_qr_codes_scanned: 'QR Scans'
  };

  // Computed array of all categories for rendering
  categories = computed(() => {
    const data = this.gamificationData();

    return Object.keys(data)
      .filter((key) => data[key])
      .map((key) => {
        const category = data[key];
        const badges = (category.badges || []).sort((a, b) => b.event_count - a.event_count);
        const allCompleted = badges.every((b) => !b.is_locked);

        return {
          key,
          displayName: this.categoryDisplayNames[key] || category.category_name || key,
          category,
          badges,
          currentCount: category.current_count || 0,
          nextBadgeCount: category.next_badge_count || 0,
          allCompleted,
          progress: category.next_badge_count ? (category.current_count / category.next_badge_count) * 100 : 0
        };
      });
  });

  // Outputs
  onSeeAll = output<void>();

  constructor() {
    // Reload data when user changes
    effect(() => {
      const userObj = this.user();
      untracked(() => {
        this.loadData();
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const userId = this.userId();

      const response = await this.userService.getUserGamificationBadges(userId || undefined);
      const data = response?.data || {};

      // Store all categories dynamically
      this.gamificationData.set(data as Record<string, GamificationCategory>);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  openAchievementDetailModal(badge: GamificationBadge, categoryKey: string) {
    this.modalService.openAchievementDetailModal(badge, categoryKey);
  }

  handleSeeAll() {
    this.onSeeAll.emit();
  }
}
