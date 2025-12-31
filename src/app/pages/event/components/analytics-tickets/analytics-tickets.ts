import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
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

  eventData: any = input.required();
  totalTicketsSold = 233;
  totalSales = 466098; // pennies

  getTicketCountsForTier(ticket: any) {
    const remaining = ticket.total - ticket.sold;
    const percentageSold = ticket.total > 0 ? Math.round((ticket.sold / ticket.total) * 100) : 0;

    return {
      sold: ticket.sold,
      remaining,
      total: ticket.total,
      percentageSold,
      revenue: ticket.revenue
    };
  }

  getSaleStatus(ticket: any) {
    return { type: ticket.status };
  }

  getStatusChip(ticket: any) {
    if (ticket.status === 'upcoming') {
      return 'assets/svg/ticket/upcoming-chip.svg';
    } else if (ticket.status === 'ongoing') {
      return 'assets/svg/ticket/on-going-chip.svg';
    } else if (ticket.status === 'ended') {
      return 'assets/svg/ticket/ended-chip.svg';
    }
    return 'assets/svg/ticket/regular-chip.svg';
  }

  getTicketTypeChip(ticket: any) {
    if (ticket.ticket_type === 'early-bird') {
      return 'assets/svg/ticket/early-bird-chip.svg';
    } else if (ticket.ticket_type === 'sponsor') {
      return 'assets/svg/ticket/sponsor-chip.svg';
    } else {
      return 'assets/svg/ticket/regular-chip.svg';
    }
  }

  getSaleDateRange(ticket: any): string {
    return ticket.dateRange;
  }

  openUserList(ticket: any) {
    this.router.navigate(['/event/analytics/guests', 1111], {
      state: {
        ticket
      }
    });
  }

  penniesToDollars(value: number): string {
    return (value / 100).toFixed(2);
  }
}
