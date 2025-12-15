import { Router } from '@angular/router';
import { Searchbar } from '@/components/common/searchbar';
import { IonHeader, IonToolbar, IonContent } from '@ionic/angular/standalone';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'new-chat',
  styleUrl: './new-chat.scss',
  templateUrl: './new-chat.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonToolbar, IonHeader, Searchbar]
})
export class NewChat {
  private router = inject(Router);
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

  searchText = signal('');
  selectedIds = signal<Set<string>>(new Set());

  // Filtered list (computed)
  filteredSuggestions = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    if (!search) return this.networkSuggestions;

    return this.networkSuggestions.filter((s) => s.name.toLowerCase().includes(search));
  });

  toggleAdd(id: string) {
    const current = new Set(this.selectedIds());
    current.has(id) ? current.delete(id) : current.add(id);
    this.selectedIds.set(current);
  }

  isSelected(id: string) {
    return this.selectedIds().has(id);
  }

  goToChatRoom(id: string) {
    this.router.navigate(['/chat-room', id]);
  }

  goToCreateGroup() {
    this.router.navigate(['/create-group']);
  }
  handleBack() {
    this.router.navigate(['/messages']);
  }
}
