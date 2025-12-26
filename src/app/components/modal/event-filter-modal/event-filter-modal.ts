import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { inject, signal, Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IonIcon, IonRange, IonFooter, IonHeader, IonToolbar } from '@ionic/angular/standalone';

interface FilterValues {
  location?: string;
  eventDate?: string;
  distance?: number;
}

@Component({
  selector: 'event-filter-modal',
  styleUrl: './event-filter-modal.scss',
  templateUrl: './event-filter-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, IonRange, TextInput, IonHeader, IonFooter, IonToolbar, ReactiveFormsModule]
})
export class EventFilterModal {
  // services
  fb = inject(FormBuilder);
  modalService = inject(ModalService);

  // signals
  distanceSignal = signal(20);
  form = signal<FormGroup>(
    this.fb.group({
      location: [''],
      eventDate: ['']
    })
  );

  _initialValues: FilterValues = {};

  @Input() set initialValues(value: FilterValues | undefined) {
    this._initialValues = value || {};
    const location = this._initialValues.location || '';
    const eventDate = this._initialValues.eventDate || '';
    const distance = this._initialValues.distance || 20;

    this.form().patchValue({ location, eventDate });
    this.distanceSignal.set(distance);
  }

  get initialValues(): FilterValues {
    return this._initialValues;
  }

  reset() {
    this.form().reset();
    this.distanceSignal.set(20);
  }

  onRangeChange(event: any) {
    this.distanceSignal.set(event.detail.value);
  }

  async openLocationModal() {
    const result = await this.modalService.openCitySelectionModal();
    if (result) {
      this.form().patchValue({ location: result.fullName });
    }
  }

  async openDateModal() {
    const currentDate = this.form().get('eventDate')?.value || '';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const date = await this.modalService.openDateTimeModal('date', currentDate, todayStr);
    if (date) {
      this.form().patchValue({ eventDate: date });
    }
  }

  apply() {
    const formValue = this.form().getRawValue();
    this.modalService.close({
      location: formValue.location,
      eventDate: formValue.eventDate,
      distance: this.distanceSignal()
    });
  }

  close() {
    this.modalService.close();
  }
}
