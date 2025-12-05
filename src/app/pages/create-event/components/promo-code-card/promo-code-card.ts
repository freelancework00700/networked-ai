import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

export interface PromoCode {
  promoCode: string;
  promotion_type: 'percentage' | 'fixed';
  promoPresent: string;
  capped_amount?: string | null;
  redemption_limit?: number | null;
  max_use_per_user?: number;
}

@Component({
  selector: 'promo-code-card',
  templateUrl: './promo-code-card.html',
  styleUrl: './promo-code-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class PromoCodeCard {
  promo = input.required<PromoCode>();
  edit = output<void>();
  delete = output<void>();

  calculatePromoDiscount = computed(() => {
    const promo = this.promo();
    if (promo.promotion_type === 'percentage') {
      return parseFloat(promo.promoPresent) * 100 + '% OFF';
    }
    return `$${promo.promoPresent} OFF`;
  });

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
