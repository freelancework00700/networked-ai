import { PromoCode } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

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
    if (promo.type === 'Percentage') {
      return `${promo.value}% OFF`;
    }
    return `$${promo.value} OFF`;
  });

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
