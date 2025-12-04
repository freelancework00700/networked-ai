import { CommonModule } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'incognito-mode-input',
  templateUrl: './incognito-mode-input.html',
  styleUrl: './incognito-mode-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitchModule, ReactiveFormsModule, CommonModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class IncognitoModeInput implements OnInit {
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);

  controlName = 'incognito_mode';

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get isEnabled(): boolean {
    const control = this.parentFormGroup.get(this.controlName);
    return control?.value === true;
  }

  ngOnInit(): void {
    // Initialize control if it doesn't exist
    if (!this.parentFormGroup.get(this.controlName)) {
      this.parentFormGroup.addControl(this.controlName, this.fb.control(false));
    }
  }
}
