import { Button } from '@/components/form/button';
import { inject, Component } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';

@Component({
  imports: [Button],
  selector: 'profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile {
  // services
  private navCtrl = inject(NavController);

  goToEditProfile(): void {
    this.navCtrl.navigateForward('/profile/edit');
  }
}
