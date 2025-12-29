import { DatePipe } from '@angular/common';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ModalService } from '@/services/modal.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, OnInit, inject, Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'date-input',
  styleUrl: './date-input.scss',
  templateUrl: './date-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IconField, InputIcon, InputTextModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class DateInput implements OnInit {
  // services
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private parentContainer = inject(ControlContainer);

  // inputs
  label = input('');
  readonly = input(true);
  required = input(true);
  placeholder = input('');
  showLabel = input(true);
  isSubmitted = input(true);
  initialValue = input<string>('');
  min = input<string | null>(null);
  max = input<string | null>(null);
  controlName = input.required<string>();

  // getter for date value
  get dateValue(): Date | null {
    const value = this.control?.value;
    if (!value || value === '') {
      return null;
    }

    try {
      // parse YYYY-MM-DD format
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get getPlaceholder(): string {
    return this.placeholder() || `Select ${this.label().toLowerCase()}`;
  }

  get isControlInvalid(): boolean {
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  ngOnInit(): void {
    const validators = this.required() ? [Validators.required] : [];
    this.parentFormGroup.addControl(this.controlName(), this.fb.control(this.initialValue(), validators));

    // check validation if there's a value (edit scenario)
    const subscription = this.control.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe(() => {
      this.checkValidation();
      this.cdr.markForCheck(); // Trigger change detection for formatted date display
      subscription.unsubscribe();
    });

    // Subscribe to value changes to update formatted date display
    this.control.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  checkValidation(): void {
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }

  async openDateModal(): Promise<void> {
    const value = this.control?.value || '';
    const date = await this.modalService.openDateTimeModal('date', value, this.min() || undefined, this.max() || undefined);
    if (date) {
      this.control.setValue(date);
      this.control.markAsTouched();
    }
  }
}
