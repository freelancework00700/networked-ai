import { Button } from '@/components/form/button';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'search-empty-state',
  styleUrl: './search-empty-state.scss',
  templateUrl: './search-empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchEmptyState {
  // inputs
  icon = input<string>('pi-search');
  title = input<string>('No Results Found');
  buttonText = input<string>('Clear Search');
  subtitle = input<string>('Check your spelling or try searching for a different keyword.');

  // outputs
  clearSearch = output<void>();

  onClearSearch(): void {
    this.clearSearch.emit();
  }
}
