import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { TicketTypeCard } from '@/components/card/ticket-type-card';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

export interface TicketTypeOption {
  type: 'standard' | 'early-bird' | 'sponsor' | 'free' | 'paid';
  label: string;
  description: string;
  icon: string;
  isPaid: boolean;
}
@Component({
  selector: 'ticket-type-modal',
  styleUrl: './ticket-type-modal.scss',
  templateUrl: './ticket-type-modal.html',
  imports: [CommonModule, TicketTypeCard],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketTypeModal {
  private modalCtrl = inject(ModalController);

  @Input() isPaid: boolean = true;
  @Input() hasFreeTicket: boolean = false;

  ticketTypes: TicketTypeOption[] = [
    {
      type: 'standard',
      label: 'Standard Paid Ticket',
      description: 'Create a standard paid ticket.',
      icon: 'assets/svg/ticket/paid-ticket.svg',
      isPaid: true
    },
    {
      type: 'early-bird',
      label: 'Early Bird Ticket',
      description: 'Allow early access for a special price.',
      icon: 'assets/svg/ticket/early-bird.svg',
      isPaid: true
    },
    {
      type: 'sponsor',
      label: 'Sponsor Ticket',
      description: 'Allow people to become sponsors.',
      icon: 'assets/svg/ticket/sponsor.svg',
      isPaid: true
    },
    {
      type: 'free',
      label: 'Free Ticket',
      description: 'Allow guest to RSVP for free.',
      icon: 'assets/svg/ticket/free-ticket.svg',
      isPaid: false
    },
    {
      type: 'paid',
      label: 'Paid Ticket',
      description: 'Allow guest to RSVP for a paid ticket.',
      icon: 'assets/svg/ticket/paid-ticket.svg',
      isPaid: false
    }
  ];

  selectTicketType(type: 'standard' | 'early-bird' | 'sponsor' | 'free' | 'paid'): void {
    this.modalCtrl.dismiss(type, 'select');
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
