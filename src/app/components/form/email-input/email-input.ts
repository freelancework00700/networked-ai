import { of } from 'rxjs';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '@/services/user.service';
import { AuthService } from '@/services/auth.service';
import { availability } from '@/validations/availability';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, signal, OnInit, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'email-input',
  styleUrl: './email-input.scss',
  templateUrl: './email-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputIcon, IconField, InputTextModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class EmailInput implements OnInit {
  // inputs
  required = input(true);
  label = input('Email');
  showIcon = input(false);
  isSubmitted = input(true);
  controlName = input('email');
  showVerifiedIcon = input(false);
  placeholder = input('user@email.com');
  checkIfExists = input(false); // for login - shows error if email doesn't exist
  checkIfTaken = input(false); // for signup - shows error if email is already taken

  // services
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // signals
  isChecking = signal(false);
  shouldValidate = signal(false);

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

  get isEmailValid(): boolean {
    // if verified icon is not shown, no need to validate
    if (!this.showVerifiedIcon()) return false;

    const control = this.control;
    if (!control || !control.value || this.isChecking()) return false;

    // if there are validation errors, it's invalid
    if (this.getErrorMessage) return false;

    // if control is disabled, return true
    if (control.disabled) return true;

    // if control is enabled, check validity
    return control.valid;
  }

  get getErrorMessage(): string | null {
    const control = this.control;
    if (!control.touched) return null;

    if (control.errors?.['required']) {
      return 'Please enter your email address.';
    } else if (control.errors?.['email'] || control.errors?.['pattern']) {
      return 'Please enter a valid email address.';
    } else if (control.errors?.['taken']) {
      return 'This email is already taken.';
    } else if (control.errors?.['notFound']) {
      return 'No account found with this email.';
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.email);
      validators.push(Validators.required);
      validators.push(Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/));
    }

    const asyncValidators: AsyncValidatorFn[] = [];
    if (this.checkIfTaken() || this.checkIfExists()) {
      // create a wrapper validator that only runs when explicitly validated (form submission)
      const availabilityValidator = availability(this.userService, this.authService, 'email', undefined, this.checkIfExists());
      asyncValidators.push((control: AbstractControl) => {
        // Don't run the API call if shouldValidate flag is false
        if (!this.shouldValidate()) {
          return of(null);
        }

        // don't run the API call if there is an error message
        if (!!this.getErrorMessage) {
          return of(null);
        }

        return availabilityValidator(control);
      });
    }

    // Check if control already exists
    const existingControl = this.parentFormGroup.get(this.controlName());
    const existingValue = existingControl?.value || '';
    const isDisabled = existingControl?.disabled || false;

    // Remove it first to ensure clean state
    if (existingControl) {
      this.parentFormGroup.removeControl(this.controlName());
    }

    // Create new control, preserving existing value if it exists
    const newControl = this.fb.control(existingValue, {
      validators,
      asyncValidators,
      updateOn: 'change'
    });

    // If the existing control was disabled, disable the new one too
    if (isDisabled) newControl.disable({ emitEvent: false });
    this.parentFormGroup.addControl(this.controlName(), newControl);

    // check email status
    this.control?.statusChanges?.subscribe((status) => {
      this.isChecking.set(status === 'PENDING');
    });

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

  // remove all spaces and convert to lowercase
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/\s+/g, '').toLowerCase();

    // update the input value
    input.value = filteredValue;

    // update the form control value to trigger validation with filtered value
    this.control.setValue(filteredValue);
  }
}
