import { Button } from '@/components/form/button';
import { inject, Component } from '@angular/core';
import { IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';

@Component({
  imports: [Button, IonFooter, IonToolbar],
  selector: 'phone-email-verified-modal',
  styleUrl: './phone-email-verified-modal.scss',
  templateUrl: './phone-email-verified-modal.html'
})
export class PhoneEmailVerifiedModal {
  // services
  modalCtrl = inject(ModalController);
}
