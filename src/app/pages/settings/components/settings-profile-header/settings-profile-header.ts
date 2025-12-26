import { IonIcon } from '@ionic/angular/standalone';
import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'settings-profile-header',
  styleUrl: './settings-profile-header.scss',
  templateUrl: './settings-profile-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon]
})
export class SettingsProfileHeader {
  // inputs
  name = input.required<string>();
  points = input<number>(0);
  imageUrl = input('');
  showEditProfile = input(true);

  // outputs
  editProfileClick = output<void>();
  qrCodeClick = output<void>();

  onEditProfileClick(): void {
    this.editProfileClick.emit();
  }

  onQrCodeClick(): void {
    this.qrCodeClick.emit();
  }
}

