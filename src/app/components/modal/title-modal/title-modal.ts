import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, signal, inject, Component } from '@angular/core';
import { IonFooter, IonPicker, IonHeader, IonToolbar, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';

@Component({
  selector: 'title-modal',
  styleUrl: './title-modal.scss',
  templateUrl: './title-modal.html',
  imports: [Button, IonFooter, IonHeader, IonPicker, IonToolbar, IonPickerColumn, IonPickerColumnOption]
})
export class TitleModal {
  // services
  private modalService = inject(ModalService);

  // inputs
  @Input() value = 'Mr.';

  // signals
  options = signal([
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' }
  ]);

  async dismiss() {
    await this.modalService.close(this.value);
  }
}
