import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'analytics-tickets',
  imports: [IonIcon, CommonModule],
  styleUrl: './analytics-tickets.scss',
  templateUrl: './analytics-tickets.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsTickets {
  router = inject(Router);
  navigationService = inject(NavigationService);
  eventData: any = input.required();
  summary: any = input.required();

  getTicketTypeClass(ticket: any) {
    if (ticket.ticket_type === 'Early Bird') {
      return 'ticket-type-early-bird';
    } else if (ticket.ticket_type === 'Sponsor') {
      return 'ticket-type-sponsor';
    } else {
      return 'ticket-type-standard-paid';
    }
  }
  getSaleStatus(ticket: any) {
    return { type: ticket.status };
  }

  getTicketStatus = (ticket: any): 'sale-ended' | 'sold-out' | 'upcoming' | 'ongoing' => {
    const now = new Date();
    const saleStartDate = ticket.sales_start_date;
    const saleEndDate = ticket.sales_end_date;
    const availableQuantity = ticket.remaining_quantity;

    if (availableQuantity !== null && availableQuantity !== undefined && availableQuantity <= 0) {
      return 'sold-out';
    }

    if (saleEndDate) {
      const endDate = new Date(saleEndDate);
      if (now > endDate) {
        return 'sale-ended';
      }
    }

    if (saleStartDate) {
      const startDate = new Date(saleStartDate);
      if (now < startDate) {
        return 'upcoming';
      }
    }

    return 'ongoing';
  };

  getStatusChip(ticket: any) {
    const status = this.getTicketStatus(ticket);
    if (status === 'upcoming') {
      return 'assets/svg/ticket/upcoming-chip.svg';
    } else if (status === 'ongoing') {
      return 'assets/svg/ticket/on-going-chip.svg';
    } else if (status === 'sale-ended') {
      return 'assets/svg/ticket/ended-chip.svg';
    }
    return 'assets/svg/ticket/sold-out.svg';
  }

  getTicketTypeChip(ticket: any) {
    if (ticket.ticket_type === 'Early Bird') {
      return 'assets/svg/ticket/early-bird-chip.svg';
    } else if (ticket.ticket_type === 'Sponsor') {
      return 'assets/svg/ticket/sponsor-chip.svg';
    } else {
      return 'assets/svg/ticket/regular-chip.svg';
    }
  }

  getSaleDateRange(ticket: any): string {
    return ticket.dateRange;
  }

  openUserList(ticket: any) {
    this.navigationService.navigateForward(`/event/analytics/guests/${ticket.id}`, false, {
      ticket: ticket
    });
  }
}
