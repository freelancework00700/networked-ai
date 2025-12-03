import intlTelInput, { Iti } from 'intl-tel-input';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { input, inject, OnInit, Component, ViewChild, ElementRef, afterNextRender, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mobile-input',
  styleUrl: './mobile-input.scss',
  templateUrl: './mobile-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputIconModule, IconFieldModule, InputTextModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class MobileInput implements OnInit {
  // inputs
  required = input(true);
  isSubmitted = input(true);
  label = input('Mobile Number');
  controlName = input('phone_number');

  // variables
  iti!: Iti;
  @ViewChild('mobileNumberInput', { static: false }) mobileNumberInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private parentContainer: ControlContainer
  ) {
    // initialize intl-tel-input after the view is ready
    afterNextRender(() => this.initializeIntlTelInput());
  }

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get getErrorMessage(): string | null {
    if (!this.isSubmitted()) return null;

    const control = this.control;
    if (!control.touched) return null;

    if (control.errors?.['required']) {
      return 'Please enter your mobile number.';
    } else if (!this.iti?.isValidNumber()) {
      return 'Please enter a valid mobile number.';
    } else {
      return null;
    }
  }

  private initializeIntlTelInput(): void {
    // check if input element exists
    if (this.mobileNumberInput) {
      const mobileNumberInput = this.mobileNumberInput.nativeElement;

      // initialize intl-tel-input package
      this.iti = intlTelInput(mobileNumberInput, {
        initialCountry: 'in',
        separateDialCode: true,
        countryOrder: ['in', 'us'],
        loadUtils: () => import('node_modules/intl-tel-input/build/js/utils.js')
      });

      // wait for iti to be fully initialized
      this.iti.promise.then(() => {
        // keep iti in sync with form control
        const subscription = this.control.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe((val) => {
          if (this.control?.value) this.iti.setNumber(val);
          subscription.unsubscribe();
        });

        // handle country change and trigger validation
        mobileNumberInput.addEventListener('countrychange', () => {
          this.control?.updateValueAndValidity();
        });
      });
    }
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }

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

  // allow only integer numbers
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/[^0-9]/g, '');

    // update the input value
    input.value = filteredValue;

    // update the form control value to trigger validation with filtered value
    this.control.setValue(filteredValue);
  }

  getPhoneNumber(): string {
    return this.iti?.getNumber();
  }
}
