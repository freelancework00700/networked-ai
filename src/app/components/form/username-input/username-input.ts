import { Button } from '../button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { usernameValidator } from '@/validations/usernameValidation';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { Output, EventEmitter, inject, OnInit, Component, ChangeDetectionStrategy, ChangeDetectorRef, input } from '@angular/core';

@Component({
  selector: 'username-input',
  styleUrl: './username-input.scss',
  templateUrl: './username-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinnerModule, InputTextModule, InputIconModule, IconFieldModule, ReactiveFormsModule, Button],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class UsernameInput implements OnInit {
  required = input(true);
  isCheckingUserName = false;
  label = input('Username');
  controlName = input('username');
  @Output() verificationStateChange = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private parentContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) {}

  get control(): AbstractControl | null {
    return this.parentFormGroup.get(this.controlName());
  }

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  hasValue = false;
  isVerified = false;

  ngOnInit() {
    this.parentFormGroup.addControl(
      this.controlName(),
      this.formBuilder.control('', {
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
        asyncValidators: [usernameValidator()],
        updateOn: 'change'
      })
    );

    // Track value changes
    this.control?.valueChanges.subscribe((value) => {
      this.hasValue = !!value && value.length > 0;
      // Reset verified state when value changes
      if (this.hasValue) {
        this.isVerified = false;
        this.verificationStateChange.emit(false);
      }
    });
  }

  private updateVerificationState() {
    if (!this.control) return;

    const status = this.control.status;
    const hasValue = !!this.control.value;
    const errors = this.control.errors;

    this.isCheckingUserName = status === 'PENDING';

    const previousVerifiedState = this.isVerified;

    // Verified state: valid, has value, not pending, no errors, and has been touched
    this.isVerified = status === 'VALID' && hasValue && !this.isCheckingUserName && !errors && (this.control.touched || this.control.dirty);

    // Emit verification state change if it changed
    if (previousVerifiedState !== this.isVerified) {
      this.verificationStateChange.emit(this.isVerified);
    }

    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
  }

  confirmUsername() {
    if (this.control) {
      this.control.markAsTouched();
      this.control.updateValueAndValidity();

      // Update verification state immediately to show spinner if validation is pending
      this.updateVerificationState();

      // Subscribe to status changes to update when async validation completes
      const statusSubscription = this.control.statusChanges.subscribe(() => {
        this.updateVerificationState();
        // Unsubscribe once validation is no longer pending
        if (this.control?.status !== 'PENDING') {
          statusSubscription.unsubscribe();
        }
      });
    }
  }

  get getUsernameErrorMessage() {
    const errors = this.control?.errors;

    // Check for validation errors first (these take priority)
    if (this.control?.touched && errors?.['required']) {
      return 'Please provide your username.';
    }

    if (errors?.['usernameTaken']) {
      return 'This username has been taken.';
    }

    if (errors?.['minlength']) {
      return 'Username must be at least 6 characters.';
    }

    if (errors?.['maxlength']) {
      return 'Max 12 characters.';
    }

    if (errors?.['pattern']) {
      return 'Only alphanumeric characters, dots (.), and underscores (_) are allowed.';
    }

    // Show error if username is not verified (has value but not verified, and no other errors)
    if (this.hasValue && !this.isVerified && !this.isCheckingUserName && this.control?.touched && !errors) {
      return 'Please verify your username.';
    }

    return null; // no errors
  }

  get hasError(): boolean {
    return (!!this.getUsernameErrorMessage && this.control?.touched) || false;
  }

  get hasValidationError(): boolean {
    const errors = this.control?.errors;
    if (!errors || !this.control?.touched) return false;

    // Check for actual validation errors (not the "not verified" state)
    return !!(errors['required'] || errors['usernameTaken'] || errors['minlength'] || errors['maxlength'] || errors['pattern']);
  }

  get showConfirmButton(): boolean {
    return this.hasValue && !this.isCheckingUserName && !this.isVerified && !this.hasValidationError;
  }

  trim() {
    this.parentFormGroup.get(this.controlName())?.setValue(this.parentFormGroup.get(this.controlName())?.value.trimStart());
  }
}
