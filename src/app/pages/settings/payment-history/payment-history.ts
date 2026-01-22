import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from 'src/app/services/user.service';
import { PaymentTransactionItem } from './components/payment-transaction-item';
import { NavController, IonHeader, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';

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
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonContent,
    CommonModule,
    IonInfiniteScroll,
    PaymentTransactionItem,
    IonInfiniteScrollContent,
  ]
})
export class PaymentHistory implements OnInit {

  private navCtrl = inject(NavController);
  private userService = inject(UserService);

  isDownloading = signal(false);
  isLoading = signal(false);

  transactions = signal<any[]>([]);

  private page = 1;
  private limit = 20;
  hasMore = signal(true);

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  async loadPaymentHistory(
    event?: CustomEvent
  ): Promise<void> {

    if (this.isLoading() || !this.hasMore()) {
      event?.target && (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    try {
      this.isLoading.set(true);

      const response = await this.userService.paymentHistory(
        this.page,
        this.limit
      );

      const newTransactions = response?.data ?? [];

      this.transactions.update(prev => [
        ...prev,
        ...newTransactions
      ]);

      if (newTransactions.length < this.limit) {
        this.hasMore.set(false);
      } else {
        this.page++;
      }

    } catch (error) {
      console.error('Error loading payment history', error);
    } finally {
      this.isLoading.set(false);
      event?.target && (event.target as HTMLIonInfiniteScrollElement).complete();
    }
  }

  groupedTransactions = computed(() => {
    const transactions = this.transactions();

    const groups = new Map<string, any[]>();

    transactions.forEach(tx => {
      const dateKey = this.formatDateKey(tx.created_at);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }

      groups.get(dateKey)!.push(tx);
    });

    return Array.from(groups.entries()).map(([dateKey, transactions]) => ({
      dateKey,
      date: new Date(dateKey),
      transactions
    }));
  });

  hasTransactions = computed(() => this.transactions().length > 0);

  private formatDateKey(dateValue?: string | null): string {
    if (!dateValue) {
      return new Date().toISOString().split('T')[0];
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
  }

  back(): void {
    this.navCtrl.back();
  }
}

