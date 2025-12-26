import { Component, signal } from '@angular/core';
import { Button } from '@/components/form/button';
@Component({
  imports: [Button],
  selector: 'profile-setup-user-suggestion',
  styleUrl: './profile-setup-user-suggestion.scss',
  templateUrl: './profile-setup-user-suggestion.html'
})
export class ProfileSetupUserSuggestion {
  // signals
  selectedSuggestions = signal<Set<string>>(new Set());

  // constants
  readonly networkSuggestions = [
    { id: '1', name: 'Kathryn Murphy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '2', name: 'Esther Howard', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '3', name: 'Arlene McCoy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '4', name: 'Darlene Robertson', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '5', name: 'Ronald Richards', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '6', name: 'Albert Flores', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '7', name: 'Eleanor Pena', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '8', name: 'Savannah Nguyen', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' }
  ];

  addSuggestion(id: string): void {
    const selected = new Set(this.selectedSuggestions());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedSuggestions.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedSuggestions().has(id);
  }
}
