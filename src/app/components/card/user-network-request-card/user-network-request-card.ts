import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [Button, IonIcon],
  selector: 'user-network-request-card',
  styleUrl: './user-network-request-card.scss',
  templateUrl: './user-network-request-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserNetworkRequestCard {
  // inputs
  user = input.required<any>();

  // outputs
  accept = output<string>();
  reject = output<string>();

  onAccept(): void {
    this.accept.emit(this.user().id);
  }

  onReject(): void {
    this.reject.emit(this.user().id);
  }
}
