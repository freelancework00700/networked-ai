import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { NgOptimizedImage } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'analytics-promo-codes',
  styleUrl: './analytics-promo-codes.scss',
  templateUrl: './analytics-promo-codes.html',
  imports: [IonIcon, CommonModule, Button, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsPromoCodes {
  router = inject(Router);
  promoCodes = input.required<any[]>();
  eventId = input.required<string>();
  visiblePromoCodes: Record<string, boolean> = {};
  navigationService = inject(NavigationService);
  togglePromo(code: string) {
    this.visiblePromoCodes[code] = !this.visiblePromoCodes[code];
  }

  goToUser(user: any) {
    if (user.parent_user_id) {
      return;
    }
    this.navigationService.navigateForward(`/${user.username}`);
  }

  getTotalUses(): number {
    return this.promoCodes() ? this.promoCodes().reduce((sum: number, promo: any) => sum + promo.total_uses, 0) : 0;
  }

  onCreatePromoCode() {
    this.navigationService.navigateForward(`/event/edit/${this.eventId()}?step=2`);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: any): void {
    onImageError(event);
  }
}
