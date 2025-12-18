import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonRange, ModalController } from '@ionic/angular/standalone';
import { inject, signal, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'location-filter-modal',
  styleUrl: './location-filter-modal.scss',
  templateUrl: './location-filter-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonRange, Button, IonIcon, TextInput, ReactiveFormsModule]
})
export class LocationFilterModal {
  // services
  private fb = inject(FormBuilder);
  modalService = inject(ModalService);

  // signals
  distance = signal(20);
  form = signal<FormGroup>(this.fb.group({}));

  reset() {
    this.form().reset();
    this.distance.set(20);
    this.modalService.close();
  }

  onRangeChange(event: any) {
    this.distance.set(event.detail.value);
  }

  async openLocationModal() {
    const location = this.form().get('location')?.value || '';
    const { address } = await this.modalService.openLocationModal(location);
    this.form().patchValue({ location: address });
  }
}
