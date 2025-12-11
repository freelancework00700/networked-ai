import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { inject, input, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'incognito-mode-input',
  styleUrl: './incognito-mode-input.scss',
  templateUrl: './incognito-mode-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitchModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class IncognitoModeInput implements OnInit {
  // inputs
  controlName = input('settings');

  // services
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get settingsFormGroup(): FormGroup {
    return this.parentFormGroup.get(this.controlName()) as FormGroup;
  }

  get isEnabled(): boolean {
    const settingsGroup = this.settingsFormGroup;
    return settingsGroup?.get('hide_location')?.value === true;
  }

  ngOnInit(): void {
    const settingsControl = this.parentFormGroup.get(this.controlName());

    if (!settingsControl) {
      this.parentFormGroup.addControl(
        this.controlName(),
        this.fb.group({
          hide_location: [false]
        })
      );
    }
  }
}
