import { IonSearchbar } from '@ionic/angular/standalone';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'searchbar',
  imports: [IonSearchbar],
  styleUrl: './searchbar.scss',
  templateUrl: './searchbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Searchbar {
  placeholder = input<string>('');
  debounce = input<number>(500);
  value = input<string>('');
  onInput = output<CustomEvent<any>>();

  onInputChange(event: CustomEvent<any>): void {
    this.onInput.emit(event);
  }
}
