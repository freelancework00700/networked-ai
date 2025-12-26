import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { NavController, IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { ISubscription, SubscriptionCard } from '@/components/card/subscription-card';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';

@Component({
  selector: 'subscriptions',
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, DatePipe, SubscriptionCard, SegmentButton]
})
export class Subscriptions {
  // services
  navCtrl = inject(NavController);

  // signals
  segmentValue = signal<string>('event');

  // Segment items
  segmentItems: SegmentButtonItem[] = [
    {
      value: 'event',
      label: 'Event Plans'
    },
    {
      value: 'sponsor',
      label: 'Sponsor Plans'
    }
  ];

  // Mock data - replace with actual service call
  eventSubscriptions = signal<ISubscription[]>([
    {
      id: '1',
      planName: 'Skills & Agility',
      creatorName: 'Jonah G',
      renewDate: new Date('2026-01-21'),
      price: '$50 /m',
      type: 'event'
    },
    {
      id: '2',
      planName: 'Skills & Agility',
      creatorName: 'Jonah G',
      renewDate: new Date('2026-01-21'),
      price: '$50 /m',
      type: 'event'
    }
  ]);

  sponsorSubscriptions = signal<ISubscription[]>([
    {
      id: '3',
      planName: 'Skills & Agility',
      creatorName: 'Jonah G',
      renewDate: new Date('2026-01-21'),
      price: '$50 /m',
      type: 'sponsor'
    },
    {
      id: '4',
      planName: 'Skills & Agility',
      creatorName: 'Jonah G',
      renewDate: new Date('2026-01-21'),
      price: '$50 /m',
      type: 'sponsor'
    }
  ]);

  // computed
  currentSubscriptions = computed(() => {
    return this.segmentValue() === 'event' ? this.eventSubscriptions() : this.sponsorSubscriptions();
  });

  hasSubscriptions = computed(() => this.currentSubscriptions().length > 0);

  back(): void {
    this.navCtrl.back();
  }

  onSegmentChange(value: string): void {
    this.segmentValue.set(value);
  }

  onSubscriptionClick(subscription: ISubscription): void {
    // TODO: Navigate to subscription details page
    console.log('Subscription details:', subscription);
  }
}