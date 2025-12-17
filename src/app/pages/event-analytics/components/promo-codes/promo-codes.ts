import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'promo-codes',
  styleUrl: './promo-codes.scss',
  templateUrl: './promo-codes.html',
  imports: [CommonModule, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoCodes {
  router = inject(Router);
  promoCodes = input.required<any[]>();
  visiblePromoCodes: Record<string, boolean> = {};

  togglePromo(code: string) {
    this.visiblePromoCodes[code] = !this.visiblePromoCodes[code];
  }

  goToUser(username: string) {
    console.log('Navigate to:', username);
  }

  getTotalUses(): number {
    return this.promoCodes().reduce((sum: number, promo: any) => sum + promo.uses, 0);
  }

  onCreatePromoCode() {
    this.router.navigate(['/create-event']);
  }
}
