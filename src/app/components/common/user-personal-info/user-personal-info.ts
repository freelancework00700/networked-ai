import { IUserForm } from '@/interfaces/IUserForm';
import { TextInput } from '@/components/form/text-input';
import { EmailInput } from '@/components/form/email-input';
import { MobileInput } from '@/components/form/mobile-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordInput } from '@/components/form/password-input';
import { UsernameInput } from '@/components/form/username-input';
import { input, output, Component, ViewChild } from '@angular/core';
import { UserSettingToggle } from '@/components/form/user-setting-toggle';

@Component({
  selector: 'user-personal-info',
  styleUrl: './user-personal-info.scss',
  templateUrl: './user-personal-info.html',
  imports: [TextInput, EmailInput, MobileInput, PasswordInput, UsernameInput, UserSettingToggle, ReactiveFormsModule]
})
export class UserPersonalInfo {
  // inputs
  emailVerified = input(false);
  isSubmitted = input.required<boolean>();
  showPasswordInput = input.required<boolean>();
  formGroup = input.required<FormGroup<IUserForm>>();

  // outputs
  openDateModal = output<void>();
  openTitleModal = output<void>();
  openLocationModal = output<void>();
  openAccountTypeModal = output<void>();

  // view child
  @ViewChild(MobileInput) mobileInput?: MobileInput;

  getPhoneNumber(): string | undefined {
    return this.mobileInput?.getPhoneNumber();
  }
}
