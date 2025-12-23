import { inject, Component } from '@angular/core';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { IonFooter, IonToolbar, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'password-saved-modal',
  styleUrl: './password-saved-modal.scss',
  imports: [Button, IonFooter, IonToolbar],
  templateUrl: './password-saved-modal.html'
})
export class PasswordSavedModal {
  // services
  navCtrl = inject(NavController);
  modalService = inject(ModalService);

  async dismiss() {
    await this.modalService.close();
    this.navCtrl.navigateBack('/login');
  }
}
