import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { inject, signal, Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IonRange, IonFooter, IonHeader, IonToolbar } from '@ionic/angular/standalone';

interface LocationFilterValues {
  location?: string;
  latitude?: string;
  longitude?: string;
  radius?: number;
}

@Component({
  selector: 'location-filter-modal',
  styleUrl: './location-filter-modal.scss',
  templateUrl: './location-filter-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonRange, TextInput, IonHeader, IonFooter, IonToolbar, ReactiveFormsModule]
})
export class LocationFilterModal {
  // services
  private fb = inject(FormBuilder);
  modalService = inject(ModalService);

  readonly barHeights = [12.5, 25, 25, 37.5, 37.5, 50, 62.5, 87.5, 100, 75, 100, 75, 87.5, 100, 87.5, 75, 50, 37.5, 25, 25, 25];
  readonly totalBars = 21;
  readonly maxDistance = 50;

  // signals
  distance = signal(20);
  selectedLatitude = signal<string>('');
  selectedLongitude = signal<string>('');
  form = signal<FormGroup>(
    this.fb.group({
      location: ['']
    })
  );

  _initialValues: LocationFilterValues = {};

  @Input() set initialValues(value: LocationFilterValues | undefined) {
    this._initialValues = value || {};
    const location = this._initialValues.location || '';
    const latitude = this._initialValues.latitude || '';
    const longitude = this._initialValues.longitude || '';
    const radius = this._initialValues.radius || 20;

    this.form().patchValue({ location });
    this.selectedLatitude.set(latitude);
    this.selectedLongitude.set(longitude);
    this.distance.set(radius);
  }

  reset() {
    this.form().reset();
    this.distance.set(20);
    this.selectedLatitude.set('');
    this.selectedLongitude.set('');
    // Return null to indicate reset/clear filters
    this.modalService.close(null);
  }

  onRangeChange(event: any) {
    this.distance.set(event.detail.value);
  }

  isBarActive(barIndex: number): boolean {
    const dist = this.distance();
    const progress = dist / this.maxDistance;
    const activeCount = progress * this.totalBars;
    return barIndex < activeCount;
  }

  async openLocationModal() {
    const location = this.form().get('location')?.value || '';
    const { address, latitude, longitude } = await this.modalService.openLocationModal(location);
    if (address) {
      this.form().patchValue({ location: address });
      this.selectedLatitude.set(latitude || '');
      this.selectedLongitude.set(longitude || '');
    }
  }

  apply() {
    this.modalService.close({
      location: this.form().get('location')?.value || '',
      radius: this.distance(),
      latitude: this.selectedLatitude(),
      longitude: this.selectedLongitude()
    });
  }
}
