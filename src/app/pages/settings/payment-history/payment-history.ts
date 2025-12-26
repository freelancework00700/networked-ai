import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavController, IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { PaymentTransactionItem } from './components/payment-transaction-item';

export interface PaymentTransaction {
  id: string;
  eventName: string;
  amount: number;
  isPayout: boolean;
  date: Date;
  icon?: string;
}

@Component({
  selector: 'payment-history',
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, PaymentTransactionItem, DatePipe]
})
export class PaymentHistory {
  // services
  navCtrl = inject(NavController);

  // signals
  isDownloading = signal(false);

  // Mock transaction data
  transactions = signal<PaymentTransaction[]>([
    {
      id: '1',
      eventName: 'Atlanta Makes Me Laugh',
      amount: 19.99,
      isPayout: false,
      date: new Date('2025-11-20T19:18:00')
    },
    {
      id: '2',
      eventName: 'Scheveningen 2',
      amount: 10.99,
      isPayout: false,
      date: new Date('2025-11-20T19:18:00')
    },
    {
      id: '3',
      eventName: 'Stripe Payout',
      amount: 200.00,
      isPayout: true,
      date: new Date('2025-11-19T19:18:00')
    },
    {
      id: '4',
      eventName: 'Atlanta Makes Me Laugh',
      amount: 19.99,
      isPayout: false,
      date: new Date('2025-11-18T19:18:00')
    },
    {
      id: '5',
      eventName: 'Scheveningen 2',
      amount: 10.99,
      isPayout: false,
      date: new Date('2025-11-18T19:18:00')
    },
    {
      id: '6',
      eventName: 'Atlanta Makes Me Laugh',
      amount: 19.99,
      isPayout: false,
      date: new Date('2025-11-10T19:18:00')
    },
    {
      id: '7',
      eventName: 'Scheveningen 2',
      amount: 10.99,
      isPayout: false,
      date: new Date('2025-11-10T19:18:00')
    },
    {
      id: '8',
      eventName: 'Atlanta Makes Me Laugh',
      amount: 19.99,
      isPayout: false,
      date: new Date('2025-11-08T19:18:00')
    },
    {
      id: '9',
      eventName: 'Scheveningen 2',
      amount: 10.99,
      isPayout: false,
      date: new Date('2025-11-08T19:18:00')
    }
  ]);

  // Group transactions by date
  groupedTransactions = computed(() => {
    const grouped = new Map<string, PaymentTransaction[]>();
    
    this.transactions().forEach(transaction => {
      const dateKey = this.formatDateKey(transaction.date);
      // console.log(dateKey);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(transaction);
    });

    console.log(grouped);

    // Convert to array and sort by date (newest first)
    return Array.from(grouped.entries())
      .map(([dateKey, transactions]) => ({
        dateKey,
        date: this.parseDateKey(dateKey),
        transactions: transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  hasTransactions = computed(() => this.transactions().length > 0);

  // Format date key for grouping (e.g., "2025-11-20")
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Parse date key back to Date
  private parseDateKey(dateKey: string): Date {
    return new Date(dateKey);
  }

  back(): void {
    this.navCtrl.back();
  }

  downloadHistory(): void {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }
}