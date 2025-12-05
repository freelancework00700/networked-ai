import { Input, Component } from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  imports: [IonSpinner],
  selector: 'loading-modal',
  styleUrl: './loading-modal.scss',
  templateUrl: './loading-modal.html'
})
export class LoadingModal {
  // inputs
  @Input() message = 'Loading...';
}
