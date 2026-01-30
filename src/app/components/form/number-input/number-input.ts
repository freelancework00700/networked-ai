import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'number-input',
  styleUrl: './number-input.scss',
  templateUrl: './number-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconField, InputIcon, InputTextModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class NumberInput {
  // inputs
  label = input('');
  showLabel = input(true);
  iconName = input<string>('');
  required = input(true);
  placeholder = input('');
  isSubmitted = input(true);
  isSpace = input(false);
  allowDecimal = input(false);
  position = input<'left' | 'right'>('left');
  controlName = input.required<string>();
  max = input<number | undefined>(undefined);
  min = input<number | undefined>(undefined);

  constructor(
    private fb: FormBuilder,
    private parentContainer: ControlContainer
  ) {}

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get getPlaceholder(): string {
    return this.placeholder() || `Enter ${this.label().toLowerCase()}`;
  }

  get pattern(): string {
    return this.allowDecimal() ? '^[0-9]*\\.?[0-9]*$' : '^[0-9]*$';
  }

  get getErrorMessage(): string | null {
    if (!this.isSubmitted()) return null;

    const control = this.control;
    if (control.valid || !control.touched) return null;

    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) {
      return 'Please enter a value.';
    } else if (errors['pattern']) {
      return this.allowDecimal() ? 'Only numeric or decimal values are allowed.' : 'Only numeric values are allowed.';
    } else if (errors['min']) {
      return `Value should be at least ${this.min()}.`;
    } else if (errors['max']) {
      return `Value should not exceed ${this.max()}.`;
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    const validators = [Validators.pattern(this.pattern)];
    if (this.required()) {
      validators.push(Validators.required);
    }

    if (this.min() !== undefined) {
      validators.push(Validators.min(this.min()!));
    }

    if (this.max() !== undefined) {
      validators.push(Validators.max(this.max()!));
    }

    if (this.parentFormGroup.get(this.controlName())) {
      this.control.setValidators(validators);
      this.control.updateValueAndValidity();
    } else {
      this.parentFormGroup.addControl(this.controlName(), this.fb.control('', validators));
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

  // allow only integer numbers or decimal numbers
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let filteredValue = input.value;

    if (this.allowDecimal()) {
      // allow only numbers and one decimal point
      filteredValue = filteredValue.replace(/[^0-9.]/g, '');

      // ensure only one decimal point
      const parts = filteredValue.split('.');

      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      // allow only numbers
      filteredValue = filteredValue.replace(/[^0-9]/g, '');
    }

    // update the input value
    input.value = filteredValue;

    // update the form control value to trigger validation with filtered value
    this.control.setValue(filteredValue);
  }
}
