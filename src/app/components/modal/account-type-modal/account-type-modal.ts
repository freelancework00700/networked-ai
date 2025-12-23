import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, signal, inject, Component } from '@angular/core';
import { IonPicker, IonHeader, IonFooter, IonToolbar, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';
@Component({
  selector: 'account-type-modal',
  styleUrl: './account-type-modal.scss',
  templateUrl: './account-type-modal.html',
  imports: [IonFooter, IonToolbar, IonHeader, Button, IonPicker, IonPickerColumn, IonPickerColumnOption]
})
export class AccountTypeModal {
  // inputs
  @Input() value: 'Individual' | 'Business' = 'Individual';

  // services
  private modalService = inject(ModalService);

  options = signal([
    { value: 'Individual', label: 'Individual' },
    { value: 'Business', label: 'Business' }
  ]);

  async dismiss() {
    await this.modalService.close(this.value);
  }
}
