import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'searchbar',
  styleUrl: './searchbar.scss',
  templateUrl: './searchbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconField, InputIcon, InputTextModule]
})
export class Searchbar {
  // inputs
  isSearching = input(false);
  placeholder = input('Search...');
  searchQuery = input.required<string>();

  // outputs
  clear = output<void>();
  searchChange = output<string>();

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchChange.emit(query);
  }

  onClearClick(): void {
    this.clear.emit();
  }
}
