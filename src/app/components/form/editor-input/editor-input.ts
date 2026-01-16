import { Editor } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { input, OnInit, Inject, inject, DOCUMENT, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ValidatorFn, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'editor-input',
  styleUrl: './editor-input.scss',
  templateUrl: './editor-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Editor, ReactiveFormsModule, CommonModule, IonSpinner],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class EditorInput implements OnInit {
  // inputs
  required = input(true);
  label = input('');
  isSubmitted = input(true);
  controlName = input.required<string>();
  placeholder = input('');
  showGenerateButton = input(false);
  isCustomize = input(false);
  isGenerating = input(false);
  onGenerateClick = input<() => void>();

  constructor(
    private fb: FormBuilder,
    private parentContainer: ControlContainer,
    @Inject(DOCUMENT) private document: Document
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

  private htmlContentValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return { emptyContent: true };
      }

      // Create a temporary DOM element to parse HTML
      const tempDiv = this.document.createElement('div');
      tempDiv.innerHTML = control.value;

      // Get text content and trim whitespace
      const textContent = tempDiv.textContent?.trim() || tempDiv.innerText?.trim() || '';

      // Check if content is empty or just whitespace
      if (!textContent || textContent.length === 0) {
        return { emptyContent: true };
      }

      return null;
    };
  }

  ngOnInit(): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }

    this.parentFormGroup.addControl(this.controlName(), this.fb.control('', [...validators, this.htmlContentValidator()]));

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
