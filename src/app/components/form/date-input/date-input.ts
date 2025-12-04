import { DateModal } from './date-modal';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { input, OnInit, inject, Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'date-input',
  styleUrl: './date-input.scss',
  templateUrl: './date-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class DateInput implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private parentContainer = inject(ControlContainer);

  // inputs
  required = input(true);
  label = input('Date of Birth');
  isSubmitted = input(true);
  controlName = input('date');
  placeholder = input('Select Date');

  selectedDate = signal<string>('');

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

    // Initialize selectedDate from form control if it has a value
    if (this.control.value) {
      this.selectedDate.set(this.control.value);
    } else {
      // If no value exists, set today's date as default
      const today = new Date();
      const defaultDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      this.selectedDate.set(defaultDate);
      this.control.setValue(defaultDate);
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

  async openDateModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DateModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: 'Date of Birth',
        initialDate: this.selectedDate() || this.control.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedDate.set(data);
      this.control.setValue(data);
      this.control.markAsTouched();
    }
  }

  get displayDate(): string {
    if (!this.selectedDate()) {
      return this.getPlaceholder;
    }

    const date = new Date(this.selectedDate());
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
