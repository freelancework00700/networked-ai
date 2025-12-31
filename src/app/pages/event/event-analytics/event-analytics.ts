import { CommonModule } from '@angular/common';
import { AnalyticsTickets } from '@/pages/event/components/analytics-tickets';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AnalyticsPromoCodes } from '@/pages/event/components/analytics-promo-codes';
import { IonContent, IonHeader, IonToolbar, NavController, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'event-analytics',
  styleUrl: './event-analytics.scss',
  templateUrl: './event-analytics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, CommonModule, AnalyticsPromoCodes, AnalyticsTickets, IonIcon]
})
export class EventAnalytics {
  navCtrl = inject(NavController);

  totalSales = signal<number>(466098);
  totalTicketsSold = signal<number>(233);
  isDownloading = signal<boolean>(false);
  eventImage = signal<string>('assets/images/profile.jpeg');

  eventData = signal<any>({
    title: 'Event Title',
    date: '2025-01-01',
    time: '10:00',
    location: 'Event Location',
    description: 'Event Description',
    tiers: [
      {
        name: 'Early Bird',
        ticket_type: 'early-bird',
        price: '$10',
        sold: 40,
        total: 50,
        revenue: 40000,
        status: 'ended',
        dateRange: '7 Aug - No end date'
      },
      {
        name: 'Standard',
        ticket_type: 'sponsor',
        price: '$20',
        sold: 120,
        total: 150,
        revenue: 240000,
        status: 'ongoing',
        dateRange: '7 Aug - 30 Aug'
      },
      {
        name: 'Free Entry',
        ticket_type: 'free',
        price: '$0',
        sold: 0,
        total: 100,
        revenue: 0,
        status: 'upcoming',
        dateRange: '1 Sep - 10 Sep'
      }
    ]
  });

  promoCodes = signal<any[]>([
    {
      code: 'NEWUSER1',
      uses: 4,
      users: [
        {
          username: 'aiden',
          name: 'Aiden J.',
          thumbnail: 'assets/images/profile.jpeg'
        },
        {
          username: 'jashan',
          name: 'Jashan D.',
          thumbnail: 'assets/images/profile.jpeg'
        },
        {
          username: 'natasha',
          name: 'Natasha K.',
          thumbnail: 'assets/images/profile.jpeg'
        },
        {
          username: 'karen',
          name: 'Karen G.',
          thumbnail: 'assets/images/profile.jpeg'
        }
      ]
    },
    {
      code: '50OFF',
      uses: 2,
      users: [
        {
          username: 'alex',
          name: 'Alex M.',
          thumbnail: 'assets/images/profile.jpeg'
        },
        {
          username: 'sara',
          name: 'Sara L.',
          thumbnail: 'assets/images/profile.jpeg'
        }
      ]
    },
    {
      code: 'JUNEDEALS',
      uses: 0,
      users: []
    }
  ]);

  penniesToDollars(value: number): string {
    return (value / 100).toFixed(2);
  }

  downloadCSV() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }
}
