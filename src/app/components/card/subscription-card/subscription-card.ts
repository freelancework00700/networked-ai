import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';

export type SubscriptionCardType = 'event' | 'sponsor';

export interface ISubscription {
  id?: string;
  type?: SubscriptionCardType;
  // For subscription plans
  name?: string;
  subscribers?: number;
  priceRange?: string;
  // For subscriptions
  planName?: string;
  creatorName?: string;
  renewDate?: Date;
  price?: string;
}

export type SubscriptionCardMode = 'plan' | 'subscription';

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.html',
  styleUrl: './subscription-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Button, IonIcon]
})
export class SubscriptionCard {
  data = input.required<ISubscription>();
  mode = input<SubscriptionCardMode>('plan');

  // Outputs for plan mode
  manage = output<ISubscription>();
  events = output<ISubscription>();

  // Output for subscription mode
  click = output<ISubscription>();

  onManage(): void {
    this.manage.emit(this.data());
  }

  onEvents(): void {
    this.events.emit(this.data());
  }

  onClick(): void {
    this.click.emit(this.data());
  }

  // Helper methods
  getDisplayName(): string {
    return this.mode() === 'plan' ? this.data().name || '' : this.data().planName || '';
  }

  isPlanMode(): boolean {
    return this.mode() === 'plan';
  }
}