import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { Searchbar } from '@/components/common/searchbar';
import { IonContent, IonHeader, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Component, inject, signal, effect, ChangeDetectionStrategy, computed } from '@angular/core';

@Component({
  selector: 'user-list',
  styleUrl: './user-list.scss',
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonHeader, IonContent, CommonModule, Searchbar, Button]
})
export class UserList {
  navCtrl = inject(NavController);

  searchQuery = signal<string>('');
  ticket = signal<any>(null);

  networkSuggestions = [
    { id: '1', name: 'Kathryn Murphy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '2', name: 'Esther Howard', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '3', name: 'Arlene McCoy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '4', name: 'Darlene Robertson', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '5', name: 'Ronald Richards', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '6', name: 'Albert Flores', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '7', name: 'Eleanor Pena', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '8', name: 'Savannah Nguyen', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' }
  ];

  filteredSuggestions = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.networkSuggestions;

    return this.networkSuggestions.filter((s) => s.name.toLowerCase().includes(search));
  });

  private navEffect = effect(() => {
    const state = history.state as { ticket?: any };

    if (state?.ticket) {
      this.ticket.set(state.ticket);
    }
  });

  getSaleDateRange(ticket: any): string {
    return ticket.dateRange;
  }

  penniesToDollars(value: number): string {
    return (value / 100).toFixed(2);
  }

  getStatusChip(ticket: any) {
    switch (ticket.status) {
      case 'upcoming':
        return 'assets/svg/ticket/upcoming-chip.svg';
      case 'ongoing':
        return 'assets/svg/ticket/on-going-chip.svg';
      case 'ended':
        return 'assets/svg/ticket/ended-chip.svg';
      default:
        return 'assets/svg/ticket/regular-chip.svg';
    }
  }

  getTicketTypeChip(ticket: any) {
    switch (ticket.ticket_type) {
      case 'early-bird':
        return 'assets/svg/ticket/early-bird-chip.svg';
      case 'sponsor':
        return 'assets/svg/ticket/sponsor-chip.svg';
      default:
        return 'assets/svg/ticket/regular-chip.svg';
    }
  }
}
