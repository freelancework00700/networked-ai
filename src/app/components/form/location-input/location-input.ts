import { CommonModule } from '@angular/common';
import { LocationModal } from './location-modal';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { input, OnInit, inject, Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'location-input',
  styleUrl: './location-input.scss',
  templateUrl: './location-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule, IconFieldModule, InputIconModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class LocationInput implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);

  // inputs
  required = input(true);
  label = input('Location');
  isSubmitted = input(true);
  controlName = input('location');
  placeholder = input('Select Location');
  iconName = input('pi-map-marker');

  selectedLocation = signal<string>('');

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get getPlaceholder(): string {
    return this.placeholder() || `Enter ${this.label().toLowerCase()}`;
  }

  get isControlInvalid(): boolean {
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }

    this.parentFormGroup.addControl(this.controlName(), this.fb.control(null, validators));

    // Initialize langLocation control if it doesn't exist
    if (!this.parentFormGroup.get('langLocation')) {
      this.parentFormGroup.addControl('langLocation', this.fb.group({ lat: [''], lng: [''] }));
    }

    // Initialize selectedLocation from form control if it has a value
    if (this.control.value) {
      this.selectedLocation.set(this.control.value);
    }

    // check validation if there's an value (edit scenario)
    const subscription = this.control.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe(() => {
      this.checkValidation();
      subscription.unsubscribe();
    });
  }

  checkValidation(): void {
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }

  async openLocationModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LocationModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: this.label(),
        initialLocation: this.selectedLocation() || this.control.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedLocation.set(data.address);
      this.control.setValue(data.address);
      this.control.markAsTouched();

      // Update langLocation if provided
      if (data.lat && data.lng && this.parentFormGroup.get('langLocation')) {
        (this.parentFormGroup.get('langLocation') as FormGroup).patchValue({
          lat: data.lat,
          lng: data.lng
        });
      }
    }
  }

  get displayLocation(): string {
    if (!this.selectedLocation()) {
      return this.getPlaceholder;
    }
    return this.selectedLocation();
  }
}
