import { IonChip } from '@ionic/angular/standalone';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'chip',
  imports: [IonChip],
  styleUrl: './chip.scss',
  templateUrl: './chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Chip {
  height = input<string>('44px');
  width = input<string>('auto');
  type = input<string>('percentage');
  selectedType = output<string>();
  color = input<string>('');
  onChange(type: string): void {
    this.selectedType.emit(type);
  }
}
