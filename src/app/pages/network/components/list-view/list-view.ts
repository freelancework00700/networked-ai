import { Router } from '@angular/router';
import { Button } from '@/components/form/button';
import { Component, inject, input, output } from '@angular/core';

@Component({
  selector: 'list-view',
  imports: [Button],
  templateUrl: './list-view.html',
  styleUrl: './list-view.scss'
})
export class ListView {
  clearSearch = output<void>();
  private router = inject(Router);
  filteredSuggestions = input<any[]>([]);

  addSuggestion(id: string) {
    if (this.isSelected(id)) {
      this.router.navigate(['/chat-room', id]);
    } else {
      console.log('Add');
    }
  }

  isSelected(id: string) {
    return this.filteredSuggestions().find((item) => item.id === id)?.networked;
  }
}
