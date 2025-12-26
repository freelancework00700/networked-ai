import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, inject, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'password-input',
  styleUrl: './password-input.scss',
  templateUrl: './password-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconField, InputIcon, PasswordModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class PasswordInput implements OnInit {
  // inputs
  required = input(true);
  showIcon = input(false);
  label = input('Password');
  isSubmitted = input(true);
  controlName = input('password');
  customError = input<string>('');

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

  get isControlInvalid(): boolean {
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }
    validators.push(Validators.minLength(8));

    this.parentFormGroup.addControl(this.controlName(), this.fb.control('', validators));

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

  // remove all spaces from the input value
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/\s+/g, '');

    // update the input value
    input.value = filteredValue;

    // update the form control value to trigger validation with filtered value
    this.control.setValue(filteredValue);
  }
}
