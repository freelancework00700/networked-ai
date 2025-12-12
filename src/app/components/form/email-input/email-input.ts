import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '@/services/user.service';
import { availability } from '@/validations/availability';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, signal, OnInit, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

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
  checkAvailability = input(false);
  placeholder = input('user@email.com');

  // services
  private userService = inject(UserService);

  // signals
  isChecking = signal(false);

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

  get getErrorMessage(): string | null {
    if (!this.isSubmitted()) return null;

    const control = this.control;
    if (!control.touched) return null;

    if (control.errors?.['required']) {
      return 'Please enter your email address.';
    } else if (control.errors?.['email']) {
      return 'Please enter a valid email address.';
    } else if (control.errors?.['taken']) {
      return 'This email is already taken.';
    } else {
      return null;
    }
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }
    validators.push(Validators.email);

    const asyncValidators = this.checkAvailability() ? [availability(this.userService, 'email')] : [];

    this.parentFormGroup.addControl(
      this.controlName(),
      this.fb.control('', {
        validators,
        asyncValidators,
        updateOn: 'change'
      })
    );

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
