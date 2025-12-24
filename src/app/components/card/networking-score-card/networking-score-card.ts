import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { NavController } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';

interface TierInfo {
  currentThreshold: number;
  nextThreshold: number;
  diamondPath: string;
  targetDiamondPath: string;
  progressBarColor: string;
}

@Component({
  selector: 'networking-score-card',
  imports: [CommonModule, Button],
  styleUrl: './networking-score-card.scss',
  templateUrl: './networking-score-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkingScoreCard {
  navCtrl = inject(NavController);

  score = input<number>(37890);
  tierInfo = computed((): TierInfo => {
    const currentScore = this.score();

    if (currentScore >= 50000) {
      // Max tier
      return {
        currentThreshold: 50000,
        nextThreshold: 50000,
        diamondPath: '/assets/svg/gamification/diamond-50k.svg',
        targetDiamondPath: '/assets/svg/gray-small-diamond.svg',
        progressBarColor: 'from-[#9ca3af] via-[#d1d5db] to-[#e5e7eb]' // Gray/silver
      };
    } else if (currentScore >= 40000) {
      return {
        currentThreshold: 40000,
        nextThreshold: 50000,
        diamondPath: '/assets/svg/gamification/diamond-40k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-50k.svg',
        progressBarColor: 'from-[#9ca3af] via-[#d1d5db] to-[#e5e7eb]' // Gray/silver
      };
    } else if (currentScore >= 30000) {
      return {
        currentThreshold: 30000,
        nextThreshold: 40000,
        diamondPath: '/assets/svg/gamification/diamond-30k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-40k.svg',
        progressBarColor: 'from-[#f97316] via-[#fb923c] to-[#fdba74]' // Orange/gold
      };
    } else if (currentScore >= 20000) {
      return {
        currentThreshold: 20000,
        nextThreshold: 30000,
        diamondPath: '/assets/svg/gamification/diamond-20k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-30k.svg',
        progressBarColor: 'from-[#a855f7] via-[#c084fc] to-[#d8b4fe]' // Purple
      };
    } else if (currentScore >= 10000) {
      return {
        currentThreshold: 10000,
        nextThreshold: 20000,
        diamondPath: '/assets/svg/gamification/diamond-10k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-20k.svg',
        progressBarColor: 'from-[#9DEAFB] via-[#57E0FF] to-[#00D0FF]' // Light blue/cyan matching diamond-10k
      };
    } else if (currentScore >= 5000) {
      return {
        currentThreshold: 5000,
        nextThreshold: 10000,
        diamondPath: '/assets/svg/gamification/diamond-5k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-10k.svg',
        progressBarColor: 'from-[#ef4444] via-[#f87171] to-[#fca5a5]' // Red
      };
    } else if (currentScore >= 1000) {
      return {
        currentThreshold: 1000,
        nextThreshold: 5000,
        diamondPath: '/assets/svg/gamification/diamond-1k.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-5k.svg',
        progressBarColor: 'from-[#22c55e] via-[#4ade80] to-[#86efac]' // Green
      };
    } else {
      // New user (< 1000)
      return {
        currentThreshold: 0,
        nextThreshold: 1000,
        diamondPath: '/assets/svg/gamification/diamond-black.svg',
        targetDiamondPath: '/assets/svg/gamification/diamond-1k.svg',
        progressBarColor: 'from-white via-gray-100 to-gray-200' // White
      };
    }
  });

  diamondPath = computed(() => this.tierInfo().diamondPath);
  targetDiamondPath = computed(() => this.tierInfo().targetDiamondPath);
  progressBarColor = computed(() => this.tierInfo().progressBarColor);

  progressPercentage = computed(() => {
    const info = this.tierInfo();
    const currentScore = this.score();

    if (info.nextThreshold === info.currentThreshold) {
      // Max tier reached
      return 100;
    }

    const range = info.nextThreshold - info.currentThreshold;
    const progress = currentScore - info.currentThreshold;
    const percentage = (progress / range) * 100;

    return Math.min(Math.max(percentage, 0), 100);
  });

  targetDisplay = computed(() => {
    const info = this.tierInfo();
    const nextThreshold = info.nextThreshold;

    if (nextThreshold >= 1000) {
      return nextThreshold / 1000 + 'K';
    }
    return nextThreshold.toString();
  });

  isMaxTier = computed(() => this.score() >= 50000);
}
