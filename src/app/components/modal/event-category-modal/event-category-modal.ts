import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, inject, signal, Component } from '@angular/core';
import { IonPicker, IonFooter, IonHeader, IonToolbar, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';

@Component({
  selector: 'event-category-modal',
  styleUrl: './event-category-modal.scss',
  templateUrl: './event-category-modal.html',
  imports: [Button, IonFooter, IonHeader, IonPicker, IonToolbar, IonPickerColumn, IonPickerColumnOption]
})
export class EventCategoryModal {
  // services
  private modalService = inject(ModalService);

  // inputs
  @Input() value: string = 'business';

  options = signal([
    { value: 'business', label: 'Business' },
    { value: 'networking', label: 'Networking' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' }
  ]);

  async dismiss() {
    await this.modalService.close(this.value);
  }
}
