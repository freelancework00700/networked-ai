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
  label = input<string>('');
  isLoading = input<boolean>(false);
  variant = input<'outlined' | 'text' | undefined>(undefined);

  // outputs
  click = output<void>();

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.click.emit();
  }
}
