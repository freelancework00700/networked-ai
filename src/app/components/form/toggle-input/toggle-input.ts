import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { input, OnInit, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'toggle-input',
  styleUrl: './toggle-input.scss',
  templateUrl: './toggle-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitchModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class ToggleInput implements OnInit {
  // inputs
  required = input(false);
  label = input('');
  isSubmitted = input(true);
  controlName = input.required<string>();
  initialValue = input(false);

  // services
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);

  get control(): AbstractControl | null {
    return this.parentFormGroup.get(this.controlName());
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get isControlInvalid(): boolean {
    return !!(this.control?.invalid && this.control?.touched && this.required() && this.isSubmitted());
  }

  ngOnInit(): void {
    // For boolean toggle, use requiredTrue if required, otherwise no validators
    const validators = this.required() ? [Validators.requiredTrue] : [];
    this.parentFormGroup.addControl(this.controlName(), this.fb.control(this.initialValue(), validators));
  }
}
