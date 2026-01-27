import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { TicketTypeCard } from '@/components/card/ticket-type-card';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

export interface TicketTypeOption {
  type: 'Standard' | 'Early Bird' | 'Sponsor' | 'Free' | 'Paid';
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
      type: 'Standard',
      label: 'Standard Paid Ticket',
      description: 'Create a standard paid ticket.',
      icon: 'assets/svg/ticket/paid-ticket.svg',
      isPaid: true
    },
    {
      type: 'Early Bird',
      label: 'Early Bird Ticket',
      description: 'Allow early access for a special price.',
      icon: 'assets/svg/ticket/early-bird.svg',
      isPaid: true
    },
    {
      type: 'Sponsor',
      label: 'Sponsor Ticket',
      description: 'Allow people to become sponsors.',
      icon: 'assets/svg/ticket/sponsor.svg',
      isPaid: true
    },
    {
      type: 'Free',
      label: 'Free Ticket',
      description: 'Allow guest to RSVP for free.',
      icon: 'assets/svg/ticket/free-ticket.svg',
      isPaid: false
    },
    {
      type: 'Paid',
      label: 'Paid Ticket',
      description: 'Allow guest to RSVP for a paid ticket.',
      icon: 'assets/svg/ticket/paid-ticket.svg',
      isPaid: false
    }
  ];

  selectTicketType(type: 'Standard' | 'Early Bird' | 'Sponsor' | 'Free' | 'Paid'): void {
    this.modalCtrl.dismiss(type, 'select');
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
