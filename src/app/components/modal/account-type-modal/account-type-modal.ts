import { Button } from '@/components/form/button';
import { Input, signal, inject, Component } from '@angular/core';
import { IonPicker, ModalController, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';
@Component({
  selector: 'account-type-modal',
  styleUrl: './account-type-modal.scss',
  templateUrl: './account-type-modal.html',
  imports: [Button, IonPicker, IonPickerColumn, IonPickerColumnOption]
})
export class AccountTypeModal {
  // inputs
  @Input() value = 'individual';

  // services
  modalCtrl = inject(ModalController);

  options = signal([
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' }
  ]);

  async dismiss() {
    await this.modalCtrl.dismiss(this.value);
  }
}
