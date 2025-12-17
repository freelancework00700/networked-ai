import { CommonModule } from '@angular/common';
import { TicketTypeItem } from '../ticket-type-item';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

export interface TicketTypeOption {
  type: 'standard' | 'early-bird' | 'sponsor';
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'ticket-type-modal',
  styleUrl: './ticket-type-modal.scss',
  templateUrl: './ticket-type-modal.html',
  imports: [CommonModule, TicketTypeItem],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketTypeModal {
  private modalCtrl = inject(ModalController);

  ticketTypes: TicketTypeOption[] = [
    {
      type: 'standard',
      label: 'Standard Paid Ticket',
      description: 'Create a standard paid ticket.',
      icon: 'assets/svg/ticket/paid-ticket.svg'
    },
    {
      type: 'early-bird',
      label: 'Early Bird Ticket',
      description: 'Allow early access for a special price.',
      icon: 'assets/svg/ticket/early-bird.svg'
    },
    {
      type: 'sponsor',
      label: 'Sponsor Ticket',
      description: 'Allow people to become sponsors.',
      icon: 'assets/svg/ticket/sponsor.svg'
    }
  ];

  selectTicketType(type: 'standard' | 'early-bird' | 'sponsor'): void {
    this.modalCtrl.dismiss(type, 'select');
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
