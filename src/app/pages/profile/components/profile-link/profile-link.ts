import { IonIcon } from '@ionic/angular/standalone';
import { signal, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [IonIcon],
  selector: 'profile-link',
  styleUrl: './profile-link.scss',
  templateUrl: './profile-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileLink {
  isExpanded = signal(false);

  toggleLinks(): void {
    this.isExpanded.update((value) => !value);
  }
}
