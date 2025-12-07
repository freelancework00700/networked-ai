import { Button } from '@/components/form/button';
import { Component, inject, signal } from '@angular/core';
import { ModalController, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';

@Component({
  selector: 'event-category-modal',
  styleUrl: './event-category-modal.scss',
  templateUrl: './event-category-modal.html',
  imports: [Button, IonPicker, IonPickerColumn, IonPickerColumnOption]
})
export class EventCategoryModal {
  // services
  modalCtrl = inject(ModalController);

  // signals
  selectedValue = signal<string>('');

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
    await this.modalCtrl.dismiss(this.selectedValue());
  }

  onPickerChange(event: CustomEvent): void {
    const value = event.detail.value;
    this.selectedValue.set(value);
  }
}
