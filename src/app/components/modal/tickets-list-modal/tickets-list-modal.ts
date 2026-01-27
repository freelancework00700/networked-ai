import { Ticket } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'tickets-list-modal',
  imports: [CommonModule, IonHeader, IonToolbar, IonContent],
  styleUrl: './tickets-list-modal.scss',
  templateUrl: './tickets-list-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsListModal {
  private modalCtrl = inject(ModalController);

  @Input() tickets: Ticket[] = [];

  getTicketIcon(ticketType: string): string {
    switch (ticketType) {
      case 'Early Bird':
        return 'assets/svg/ticket/early-bird.svg';
      case 'Sponsor':
        return 'assets/svg/ticket/sponsor.svg';
      case 'Free':
        return 'assets/svg/ticket/free-ticket.svg';
      default:
        return 'assets/svg/ticket/paid-ticket.svg';
    }
  }

  formatPrice(price: number, ticketType: string): string {
    if (ticketType === 'Free') {
      return 'Free';
    }
    return `$${price.toFixed(2)}`;
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
