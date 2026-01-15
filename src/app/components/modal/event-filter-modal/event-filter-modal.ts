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
  latitude?: string;
  longitude?: string;
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
  latitude = signal<string>('');
  longitude = signal<string>('');
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
    const latitude = this._initialValues.latitude || '';
    const longitude = this._initialValues.longitude || '';

    this.form().patchValue({ location, eventDate });
    this.distanceSignal.set(distance);
    this.latitude.set(latitude);
    this.longitude.set(longitude);
  }

  get initialValues(): FilterValues {
    return this._initialValues;
  }

  reset() {
    this.form().reset();
    this.distanceSignal.set(20);
    this.latitude.set('');
    this.longitude.set('');
  }

  onRangeChange(event: any) {
    this.distanceSignal.set(event.detail.value);
  }

  async openLocationModal() {
    const location = this.form().get('location')?.value || '';
    const { address, latitude, longitude } = await this.modalService.openLocationModal(location);
    if (address) {
      this.form().patchValue({ location: address });
      this.latitude.set(latitude || '');
      this.longitude.set(longitude || '');
    }
  }

  async openDateModal() {
    const currentDate = this.form().get('eventDate')?.value || '';

    // Allow all dates including past dates - no min or max restriction
    const date = await this.modalService.openDateTimeModal('date', currentDate, undefined, undefined);
    if (date) {
      this.form().patchValue({ eventDate: date });
    }
  }

  apply() {
    const formValue = this.form().getRawValue();
    this.modalService.close({
      location: formValue.location,
      eventDate: formValue.eventDate,
      distance: this.distanceSignal(),
      latitude: this.latitude(),
      longitude: this.longitude()
    });
  }

  close() {
    this.modalService.close();
  }
}
