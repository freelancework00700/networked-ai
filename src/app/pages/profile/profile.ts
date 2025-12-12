import { Button } from '@/components/form/button';
import { inject, Component } from '@angular/core';
import { NavController, IonHeader, IonToolbar, IonContent, IonIcon } from '@ionic/angular/standalone';
import { InputIcon } from 'primeng/inputicon';

@Component({
  imports: [IonIcon, IonContent, IonToolbar, IonHeader, Button, InputIcon],
  selector: 'profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html'
})
export class Profile {
  // services
  private navCtrl = inject(NavController);

  goToEditProfile(): void {
    this.navCtrl.navigateForward('/profile/edit');
  }
}
