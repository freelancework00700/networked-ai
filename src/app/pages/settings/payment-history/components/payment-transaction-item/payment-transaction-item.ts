import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'payment-transaction-item',
  templateUrl: './payment-transaction-item.html',
  styleUrl: './payment-transaction-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe,CommonModule]
})
export class PaymentTransactionItem {
  transaction = input.required<any>();
}