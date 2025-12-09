import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { IonIcon } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, OnInit, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'text-input',
  styleUrl: './text-input.scss',
  templateUrl: './text-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IconField, InputIcon, InputTextModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class TextInput implements OnInit {
  // inputs
  label = input('');
  iconName = input('');
  required = input(true);
  placeholder = input('');
  endIconName = input('');
  showLabel = input(true);
  readonly = input(false);
  initialValue = input('');
  isSubmitted = input(true);
  controlName = input.required<string>();

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

  get isControlInvalid(): boolean {
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  ngOnInit(): void {
    const validators = this.required() ? [Validators.required] : [];
    this.parentFormGroup.addControl(this.controlName(), this.fb.control(this.initialValue(), validators));

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
}
