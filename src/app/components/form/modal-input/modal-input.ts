import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DateModal } from '../../modal/date-modal';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { LocationModal } from '../../modal/location-modal/location-modal';
import { SelectModal, SelectOption } from '../../modal/select-modal/select-modal';
import { input, OnInit, inject, Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'modal-input',
  styleUrl: './modal-input.scss',
  templateUrl: './modal-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule, IconFieldModule, InputIconModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class ModalInput implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private parentContainer = inject(ControlContainer);

  // Common inputs
  required = input(true);
  label = input('');
  isSubmitted = input(true);
  placeholder = input('');
  showLabel = input(true);
  controlName = input.required<string>();
  type = input<'date' | 'time' | 'select' | 'location'>('date');

  // Type-specific inputs
  // For select
  options = input<SelectOption[]>([]);
  modalTitle = input<string>('');
  // For location
  iconName = input('');

  selectedValue = signal<string>('');

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
    // Don't show validation errors if control is disabled
    if (this.control?.disabled) {
      return false;
    }
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }

    this.parentFormGroup.addControl(this.controlName(), this.fb.control(null, validators));

    // Initialize selectedValue from form control if it has a value
    if (this.control.value) {
      this.selectedValue.set(this.control.value);
    } else {
      // Set default values based on type
      if (this.type() === 'select' && this.options().length > 0) {
        // Select first option by default
        const firstOption = this.options()[0];
        this.selectedValue.set(firstOption.value);
        this.control.setValue(firstOption.value);
      } else if (this.type() === 'date') {
        // Set today's date as default
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        this.selectedValue.set(defaultDate);
        this.control.setValue(defaultDate);
      } else if (this.type() === 'time') {
        // Set current time as default
        const now = new Date();
        const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        this.selectedValue.set(defaultTime);
        this.control.setValue(defaultTime);
      }
    }

    // Special handling for location - initialize latlang control
    if (this.type() === 'location' && !this.parentFormGroup.get('latlang')) {
      this.parentFormGroup.addControl('latlang', this.fb.group({ lat: [''], lng: [''] }));
    }

    // Watch for value changes
    const subscription = this.control.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe(() => {
      this.checkValidation();
      subscription.unsubscribe();
    });
  }

  checkValidation(): void {
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }

  async openModal(): Promise<void> {
    // Don't open modal if control is disabled
    if (this.control.disabled) {
      return;
    }

    let modal;
    const componentProps: any = {
      title: this.modalTitle() || this.label()
    };

    switch (this.type()) {
      case 'date':
        modal = await this.modalCtrl.create({
          component: DateModal,
          backdropDismiss: true,
          cssClass: 'auto-hight-modal',
          componentProps: {
            ...componentProps,
            initialDate: this.selectedValue() || this.control.value,
            type: 'date'
          }
        });
        break;

      case 'time':
        modal = await this.modalCtrl.create({
          component: DateModal,
          backdropDismiss: true,
          cssClass: 'auto-hight-modal',
          componentProps: {
            ...componentProps,
            initialDate: this.selectedValue() || this.control.value,
            type: 'time'
          }
        });
        break;

      case 'select':
        modal = await this.modalCtrl.create({
          component: SelectModal,
          backdropDismiss: true,
          cssClass: 'auto-hight-modal',
          componentProps: {
            ...componentProps,
            options: this.options(),
            initialValue: this.selectedValue() || this.control.value
          }
        });
        break;

      case 'location':
        modal = await this.modalCtrl.create({
          component: LocationModal,
          backdropDismiss: true,
          cssClass: 'auto-hight-modal',
          componentProps: {
            ...componentProps,
            initialLocation: this.selectedValue() || this.control.value
          }
        });
        break;
    }

    if (modal) {
      await modal.present();
      const { data } = await modal.onWillDismiss();

      if (data) {
        if (this.type() === 'location') {
          this.selectedValue.set(data.address);
          this.control.setValue(data.address);

          // Update latlang if provided
          if (data.lat && data.lng && this.parentFormGroup.get('latlang')) {
            (this.parentFormGroup.get('latlang') as FormGroup).patchValue({
              lat: data.lat,
              lng: data.lng
            });
          }
        } else {
          this.selectedValue.set(data);
          this.control.setValue(data);
        }
        this.control.markAsTouched();
      }
    }
  }

  get displayValue(): string {
    if (!this.selectedValue()) {
      return this.getPlaceholder;
    }

    switch (this.type()) {
      case 'time':
        return this.selectedValue();

      case 'date':
        const date = new Date(this.selectedValue());
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;

      case 'select':
        const selectedOption = this.options().find((opt) => opt.value === this.selectedValue());
        return selectedOption ? selectedOption.label : this.getPlaceholder;

      case 'location':
        return this.selectedValue();

      default:
        return this.getPlaceholder;
    }
  }
}
