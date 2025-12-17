import { CommonModule } from '@angular/common';
import { IonReorder } from '@ionic/angular/standalone';
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

export interface Ticket {
  id?: string;
  name: string;
  ticket_type: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard';
  is_free_ticket: boolean;
  price: string;
  quantity?: number | null;
  description?: string | null;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
  end_sale_on_event_start?: boolean;
}

@Component({
  selector: 'ticket-card',
  templateUrl: './ticket-card.html',
  styleUrl: './ticket-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonReorder, CommonModule]
})
export class TicketCard {
  ticket = input.required<Ticket>();
  eventDate = input<string | null>();
  eventStartTime = input<string | null>();

  edit = output<void>();
  delete = output<void>();

  constructor() {}

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  private formatTime(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  }

  private formatEventDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  private formatEventTime(timeString: string | null | undefined): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  }

  ticketChipImage = computed(() => {
    const ticketType = this.ticket().ticket_type;
    switch (ticketType) {
      case 'early-bird':
        return 'assets/svg/ticket/early-bird-card-chip.svg';
      case 'sponsor':
        return 'assets/svg/ticket/sponsor-card-chip.svg';
      case 'free':
        return 'assets/svg/ticket/free-card-chip.svg';
      default:
        return 'assets/svg/ticket/standard-card-chip.svg';
    }
  });

  ticketChipAlt = computed(() => {
    const ticketType = this.ticket().ticket_type;
    switch (ticketType) {
      case 'early-bird':
        return 'Early Bird Ticket';
      case 'sponsor':
        return 'Sponsor Ticket';
      case 'free':
        return 'Free Ticket';
      default:
        return 'Standard Ticket';
    }
  });

  ticketTypeClass = computed(() => {
    const ticketType = this.ticket().ticket_type;
    switch (ticketType) {
      case 'early-bird':
        return 'ticket-early-bird';
      case 'sponsor':
        return 'ticket-sponsor';
      case 'standard':
        return 'ticket-standard';
      default:
        return '';
    }
  });

  formattedPrice = computed(() => {
    const ticket = this.ticket();
    if (ticket.is_free_ticket) {
      return 'FREE';
    }
    return ticket?.price?.startsWith('$') ? ticket.price : '$' + ticket.price;
  });

  formattedQuantity = computed(() => {
    const quantity = this.ticket().quantity;
    return quantity ? quantity.toString() : 'Unlimited';
  });

  saleStartDisplay = computed(() => {
    const salesStartDate = this.ticket().sale_start_date;
    if (salesStartDate) {
      return `${this.formatDate(salesStartDate)}, ${this.formatTime(salesStartDate)}`;
    }
    return 'Not set';
  });

  saleEndDisplay = computed(() => {
    const ticket = this.ticket();
    if (ticket.end_sale_on_event_start) {
      const eventDate = this.eventDate();
      const eventTime = this.eventStartTime();
      if (eventDate && eventTime) {
        return `${this.formatEventDate(eventDate)}, ${this.formatEventTime(eventTime)}`;
      }
      return 'When event starts';
    } else if (ticket.sale_end_date) {
      return `${this.formatDate(ticket.sale_end_date)}, ${this.formatTime(ticket.sale_end_date)}`;
    }
    return 'Not set';
  });

  description = computed(() => {
    const ticketDescription = this.ticket().description;
    if (!ticketDescription) {
      return 'Insert one or two lines of the description here.';
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ticketDescription;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.trim() || 'Insert one or two lines of the description here.';
  });

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
