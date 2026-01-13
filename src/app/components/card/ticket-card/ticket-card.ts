import { Ticket } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { IonReorder } from '@ionic/angular/standalone';
import { input, output, Inject, computed, DOCUMENT, Component, ChangeDetectionStrategy } from '@angular/core';

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

  constructor(@Inject(DOCUMENT) private document: Document) {}

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
      case 'Early Bird':
        return 'assets/svg/ticket/early-bird-card-chip.svg';
      case 'Sponsor':
        return 'assets/svg/ticket/sponsor-card-chip.svg';
      case 'Free':
        return 'assets/svg/ticket/free-card-chip.svg';
      default:
        return 'assets/svg/ticket/standard-card-chip.svg';
    }
  });

  ticketChipAlt = computed(() => {
    const ticketType = this.ticket().ticket_type;
    switch (ticketType) {
      case 'Early Bird':
        return 'Early Bird Ticket';
      case 'Sponsor':
        return 'Sponsor Ticket';
      case 'Free':
        return 'Free Ticket';
      default:
        return 'Standard Ticket';
    }
  });

  ticketTypeClass = computed(() => {
    const ticketType = this.ticket().ticket_type;
    switch (ticketType) {
      case 'Early Bird':
        return 'ticket-early-bird';
      case 'Sponsor':
        return 'ticket-sponsor';
      case 'Standard':
        return 'ticket-standard';
      default:
        return '';
    }
  });

  formattedPrice = computed(() => {
    const ticket = this.ticket();
    if (ticket.ticket_type === 'Free') {
      return 'FREE';
    }
    const price = typeof ticket?.price === 'number' ? ticket.price : parseFloat(String(ticket?.price || 0).replace('$', ''));
    return '$' + price.toFixed(2);
  });

  formattedQuantity = computed(() => {
    const quantity = this.ticket().quantity;
    return quantity ? quantity.toString() : 'Unlimited';
  });

  private combineDateAndTime(dateStr: string | null | undefined, timeStr: string | null | undefined): string | null {
    if (!dateStr || !timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  saleStartDisplay = computed(() => {
    const ticket = this.ticket();
    const combinedDateTime = this.combineDateAndTime(ticket.sale_start_date, ticket.sale_start_time);
    if (combinedDateTime) {
      return `${this.formatDate(combinedDateTime)}, ${this.formatTime(combinedDateTime)}`;
    }
    return 'Not set';
  });

  saleEndDisplay = computed(() => {
    const ticket = this.ticket();
    if (ticket.end_at_event_start) {
      const eventDate = this.eventDate();
      const eventTime = this.eventStartTime();
      if (eventDate && eventTime) {
        return `${this.formatEventDate(eventDate)}, ${this.formatEventTime(eventTime)}`;
      }
    } else {
      const combinedDateTime = this.combineDateAndTime(ticket.sale_end_date, ticket.sale_end_time);
      if (combinedDateTime) {
        return `${this.formatDate(combinedDateTime)}, ${this.formatTime(combinedDateTime)}`;
      }
    }
    return 'Not set';
  });

  description = computed(() => {
    const ticketDescription = this.ticket().description;
    if (!ticketDescription) {
      return 'Insert one or two lines of the description here.';
    }
    const tempDiv = this.document.createElement('div');
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
