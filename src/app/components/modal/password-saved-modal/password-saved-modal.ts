import { inject, Component } from '@angular/core';
import { Button } from '@/components/form/button';
import { IonFooter, IonToolbar, NavController, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'password-saved-modal',
  imports: [Button, IonFooter, IonToolbar],
  styleUrl: './password-saved-modal.scss',
  templateUrl: './password-saved-modal.html'
})
export class PasswordSavedModal {
  // services
  navCtrl = inject(NavController);
  modalCtrl = inject(ModalController);

  async dismiss() {
    await this.modalCtrl.dismiss();
    this.navCtrl.navigateBack('/login');
  }
}
