import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SelectModal, SelectOption } from './select-modal';
import { ModalController } from '@ionic/angular/standalone';
import { input, OnInit, inject, Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'select-input',
  styleUrl: './select-input.scss',
  templateUrl: './select-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class SelectInput implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);

  // inputs
  required = input(true);
  label = input('Select');
  isSubmitted = input(true);
  controlName = input('select');
  placeholder = input('Select');
  options = input<SelectOption[]>([]);
  modalTitle = input<string>('');

  selectedValue = signal<string>('');

  get modalTitleValue(): string {
    return this.modalTitle() || this.label();
  }

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

    // Initialize selectedValue from form control if it has a value
    if (this.control.value) {
      this.selectedValue.set(this.control.value);
    } else if (this.options().length > 0) {
      // If no value exists and options are available, select the first option by default
      const firstOption = this.options()[0];
      this.selectedValue.set(firstOption.value);
      this.control.setValue(firstOption.value);
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

  async openSelectModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: SelectModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: this.modalTitleValue,
        options: this.options(),
        initialValue: this.selectedValue() || this.control.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedValue.set(data);
      this.control.setValue(data);
      this.control.markAsTouched();
    }
  }

  get displayValue(): string {
    if (!this.selectedValue()) {
      return this.getPlaceholder;
    }
    const selectedOption = this.options().find((opt) => opt.value === this.selectedValue());
    return selectedOption ? selectedOption.label : this.getPlaceholder;
  }
}
