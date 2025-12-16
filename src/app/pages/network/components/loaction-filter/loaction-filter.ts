import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { IonRange, ModalController } from '@ionic/angular/standalone';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'loaction-filter',
  styleUrl: './loaction-filter.scss',
  templateUrl: './loaction-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonRange, Button, CommonModule, TextInput, ReactiveFormsModule]
})
export class LoactionFilter {
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);
  private modalCtrl = inject(ModalController);
  locationIcon = 'assets/svg/locationIcon.svg';
  distance = signal<number>(20);
  form = signal<FormGroup>(
    this.fb.group({
      location: ['', [Validators.required]]
    })
  );

  reset() {
    this.form.set(
      this.fb.group({
        location: ['', [Validators.required]]
      })
    );
    this.distance.set(20);
    this.modalService.close();
  }

  apply() {
    this.modalCtrl.dismiss(this.distance());
    this.modalService.close();
  }

  onRangeChange(event: any) {
    this.distance.set(event.detail.value);
  }

  openLocationModal() {
    this.modalService.openLocationModal().then((result) => {
      if (result) {
        this.form().get('location')?.setValue(result.address);
      }
    });
  }
}
