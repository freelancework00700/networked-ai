import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentTransaction } from '../../payment-history';

@Component({
  selector: 'payment-transaction-item',
  templateUrl: './payment-transaction-item.html',
  styleUrl: './payment-transaction-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe]
})
export class PaymentTransactionItem {
  transaction = input.required<PaymentTransaction>();

  // Format amount for display
  formatAmount(): string {
    const amount = this.transaction().amount;
    const prefix = this.transaction().isPayout ? '+' : '';
    return `${prefix}$${amount.toFixed(2)}`;
  }
}