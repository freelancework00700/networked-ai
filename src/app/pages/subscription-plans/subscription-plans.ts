import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { NavController, IonHeader, IonToolbar, IonContent, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { Button } from '@/components/form/button';
import { SubscriptionCard, ISubscription } from '@/components/card/subscription-card';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';

@Component({
  selector: 'subscription-plans',
  templateUrl: './subscription-plans.html',
  styleUrl: './subscription-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, IonFooter, IonIcon, DatePipe, Button, SubscriptionCard, SegmentButton]
})
export class SubscriptionPlans {
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

  // Mock data
  eventPlans = signal<ISubscription[]>([
    {
      id: '1',
      name: 'Skills & Agility',
      subscribers: 122,
      priceRange: '$60/m / $300/y',
      type: 'event'
    },
    {
      id: '2',
      name: 'Skills & Agility',
      subscribers: 122,
      priceRange: '$60/m / $300/y',
      type: 'event'
    }
  ]);

  sponsorPlans = signal<ISubscription[]>([
    {
      id: '3',
      name: 'Skills & Agility',
      subscribers: 122,
      priceRange: '$60/m / $300/y',
      type: 'sponsor'
    },
    {
      id: '4',
      name: 'Skills & Agility',
      subscribers: 122,
      priceRange: '$60/m / $300/y',
      type: 'sponsor'
    }
  ]);

  // computed
  currentPlans = computed(() => {
    return this.segmentValue() === 'event' ? this.eventPlans() : this.sponsorPlans();
  });

  hasPlans = computed(() => this.currentPlans().length > 0);

  back(): void {
    this.navCtrl.back();
  }

  onSegmentChange(value: string): void {
    this.segmentValue.set(value);
  }

  onManage(plan: ISubscription): void {
    console.log('Manage plan:', plan);
  }

  onEvents(plan: ISubscription): void {
    console.log('Plan events:', plan);
  }
}