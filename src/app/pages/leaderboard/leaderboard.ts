import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';

import { IonContent, IonToolbar, IonHeader, IonFooter } from '@ionic/angular/standalone';
type Tab = 'this-week' | 'all-time';
interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  profileImage: string;
  rankChange?: 'up' | 'down' | null;
}

@Component({
  selector: 'leaderboard',
  styleUrl: './leaderboard.scss',
  templateUrl: './leaderboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonFooter, IonHeader, IonToolbar, IonContent, CommonModule, SegmentButton]
})
export class Leaderboard {
  navCtrl = inject(NavController);
  tab = signal<Tab>('this-week');

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

  // Top 3 users with medals
  topThree: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'Rachelle K.',
      score: 55000, // diamond-50k
      profileImage: 'assets/images/profile.jpeg',
      rankChange: null
    },
    {
      rank: 2,
      name: 'Janice R.',
      score: 45000, // diamond-40k
      profileImage: 'assets/images/profile.jpeg',
      rankChange: null
    },
    {
      rank: 3,
      name: 'Michael S.',
      score: 35000, // diamond-30k
      profileImage: 'assets/images/profile.jpeg',
      rankChange: null
    }
  ];

  // Ranks 4-10
  leaderboardEntries: LeaderboardEntry[] = [
    {
      rank: 4,
      name: 'Kathryn Murphy',
      score: 109888,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'up'
    },
    {
      rank: 5,
      name: 'Kathryn Murphy',
      score: 88900,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'up'
    },
    {
      rank: 6,
      name: 'Kathryn Murphy',
      score: 82433,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'up'
    },
    {
      rank: 7,
      name: 'Kathryn Murphy',
      score: 78766,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'up'
    },
    {
      rank: 8,
      name: 'Kathryn Murphy',
      score: 61900,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'up'
    },
    {
      rank: 9,
      name: 'Kathryn Murphy',
      score: 43100,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'down'
    },
    {
      rank: 10,
      name: 'Kathryn Murphy',
      score: 41870,
      profileImage: 'assets/images/profile.jpeg',
      rankChange: 'down'
    }
  ];

  // User's own rank
  userRank: LeaderboardEntry = {
    rank: 55,
    name: 'You',
    score: 14610,
    profileImage: 'assets/images/profile.jpeg',
    rankChange: 'up'
  };

  formatScore(score: number): string {
    return score.toLocaleString();
  }

  getDiamondPath(score: number): string {
    if (score >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (score >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (score >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (score >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (score >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (score >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else if (score >= 1000) {
      return '/assets/svg/gamification/diamond-1k.svg';
    } else {
      return '/assets/svg/gamification/diamond-black.svg';
    }
  }

  onSegmentChange(value: string): void {
    this.tab.set(value as Tab);
  }
}
