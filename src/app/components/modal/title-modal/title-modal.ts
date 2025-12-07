import { Button } from '@/components/form/button';
import { Input, signal, inject, Component } from '@angular/core';
import { IonPicker, ModalController, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';

@Component({
  selector: 'title-modal',
  styleUrl: './title-modal.scss',
  templateUrl: './title-modal.html',
  imports: [Button, IonPicker, IonPickerColumn, IonPickerColumnOption]
})
export class TitleModal {
  // inputs
  @Input() value = 'Mr.';

  // services
  modalCtrl = inject(ModalController);

  options = signal([
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' }
  ]);

  async dismiss() {
    await this.modalCtrl.dismiss(this.value);
  }
}
