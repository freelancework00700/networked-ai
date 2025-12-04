import { TextInput } from '../text-input';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'social-input',
  styleUrl: './social-input.scss',
  templateUrl: './social-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TextInput],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class SocialInput implements OnInit {
  @Input() controlName = 'socials';

  constructor(
    private formBuilder: FormBuilder,
    private parentContainer: ControlContainer
  ) {}

  get control(): FormArray | null {
    return this.parentFormGroup.get(this.controlName) as FormArray;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  ngOnInit() {
    if (!this.control) {
      this.parentFormGroup.addControl(
        this.controlName,
        this.formBuilder.group({
          x: [''],
          fb: [''],
          ig: [''],
          li: [''],
          sc: [''],
          web: ['']
        })
      );
    }
  }
}
