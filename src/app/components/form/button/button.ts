import { ButtonModule } from 'primeng/button';
import { input, output, Component } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [ButtonModule],
  styleUrl: './button.scss',
  templateUrl: './button.html'
})
export class Button {
  // inputs
  width = input('100%');
  height = input('unset');
  label = input<string>('');
  iconName = input<string>('');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  iconPos = input<'right' | 'left'>('left');
  color = input<'secondary' | 'primary'>('primary');
  variant = input<'outlined' | 'text' | undefined>(undefined);

  // outputs
  click = output<void>();

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.click.emit();
  }
}
