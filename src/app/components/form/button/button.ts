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

  // outputs
  click = output<void>();
}
