import { distinctUntilChanged } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TextareaModule } from 'primeng/textarea';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ControlContainer, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'text-area-input',
  styleUrl: './text-area-input.scss',
  imports: [ReactiveFormsModule, TextareaModule],
  templateUrl: './text-area-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class TextAreaInput {
  label = input('');
  rows = input(4);
  showLength = input(false);
  controlName = input.required<string>();
  required = input(true);
  placeholder = input('');
  constructor(
    private formBuilder: FormBuilder,
    private parentContainer: ControlContainer
  ) {}

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  get isControlInvalid() {
    return this.parentFormGroup.get(this.controlName())?.invalid && this.parentFormGroup.get(this.controlName())?.touched;
  }

  ngOnInit() {
    const validators = this.required() ? [Validators.required] : [];
    this.parentFormGroup.addControl(this.controlName(), this.formBuilder.control('', validators));

    // check validation if there's an value (edit scenario)
    const subscription = this.parentFormGroup
      .get(this.controlName())
      ?.valueChanges.pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => {
        this.checkValidation();
        subscription?.unsubscribe();
      });
  }

  checkValidation() {
    this.parentFormGroup.get(this.controlName())?.markAsTouched();
    this.parentFormGroup.get(this.controlName())?.updateValueAndValidity();
  }
}
