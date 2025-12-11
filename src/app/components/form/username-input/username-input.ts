import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { UserService } from '@/services/user.service';
import { availability } from '@/validations/availability';
import { input, signal, inject, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'username-input',
  styleUrl: './username-input.scss',
  templateUrl: './username-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputTextModule, InputIconModule, IconFieldModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class UsernameInput implements OnInit {
  // inputs
  required = input(true);
  label = input('Username');
  isSubmitted = input(true);
  controlName = input('username');
  checkAvailability = input(true);
  placeholder = input('ethan_cortazzo');

  // signals
  isChecking = signal(false);

  // services
  private userService = inject(UserService);

  constructor(
    private fb: FormBuilder,
    private parentContainer: ControlContainer
  ) {}

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  get isUsernameValid(): boolean {
    const control = this.control;
    return control && control.value && control.valid && !this.isChecking();
  }

  ngOnInit() {
    const asyncValidators = this.checkAvailability() ? [availability(this.userService, 'username')] : [];

    this.parentFormGroup.addControl(
      this.controlName(),
      this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          Validators.pattern(/^(?!.*\.\.)(?!.*\.$)(?!^\.)(?!^.*\.$)[a-zA-Z0-9_.]+$/)
        ],
        asyncValidators,
        updateOn: 'change'
      })
    );

    // check username status
    this.control?.statusChanges?.subscribe((status) => {
      this.isChecking.set(status === 'PENDING');
    });
  }

  get getErrorMessage() {
    if (!this.isSubmitted()) return null;

    const control = this.control;
    if (!control.touched) return null;

    if (control.errors?.['required']) {
      return 'Please provide your username.';
    } else if (control.errors?.['taken']) {
      return 'This username has been taken.';
    } else if (control.errors?.['minlength']) {
      return 'Username must be at least 6 characters.';
    } else if (control.errors?.['maxlength']) {
      return 'Username cannot be longer than 30 characters.';
    } else if (control.errors?.['pattern']) {
      return 'Username can include letters, numbers, underscores, or periods, but no consecutive or trailing periods.';
    } else {
      return null;
    }
  }
}
