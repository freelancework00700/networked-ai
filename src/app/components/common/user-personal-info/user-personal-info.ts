import { IUser } from '@/interfaces/IUser';
import { IUserForm } from '@/interfaces/IUserForm';
import { ModalService } from '@/services/modal.service';
import { validateFields } from '@/utils/form-validation';
import { DateInput } from '@/components/form/date-input';
import { TextInput } from '@/components/form/text-input';
import { EmailInput } from '@/components/form/email-input';
import { MobileInput } from '@/components/form/mobile-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsernameInput } from '@/components/form/username-input';
import { input, inject, Component, ViewChild } from '@angular/core';
import { UserSettingToggle } from '@/components/form/user-setting-toggle';

@Component({
  selector: 'user-personal-info',
  styleUrl: './user-personal-info.scss',
  templateUrl: './user-personal-info.html',
  imports: [TextInput, DateInput, EmailInput, MobileInput, UsernameInput, UserSettingToggle, ReactiveFormsModule]
})
export class UserPersonalInfo {
  // inputs
  isSubmitted = input.required<boolean>();
  formGroup = input.required<FormGroup<IUserForm>>();

  // services
  private modalService = inject(ModalService);

  // view child
  @ViewChild(MobileInput) mobileInput?: MobileInput;

  // constants
  private readonly validationFields = ['title', 'first_name', 'last_name', 'email', 'mobile', 'username', 'dob', 'account_type', 'address'];

  getPhoneNumber(): string | undefined {
    return this.mobileInput?.getPhoneNumber();
  }

  // validate all personal info fields
  async validate(): Promise<boolean> {
    return await validateFields(this.formGroup(), this.validationFields);
  }

  // initialize fields based on user data (disable email/mobile if already set)
  initializeFields(userData: IUser | null): void {
    if (!userData) return;

    // disable email if already set
    if (userData.email) {
      this.formGroup().get('email')?.disable({ emitEvent: false });
    }

    // disable mobile if already set
    if (userData.mobile) {
      this.formGroup().get('mobile')?.disable({ emitEvent: false });
    }
  }

  async openTitleModal(): Promise<void> {
    const value = this.formGroup().get('title')?.value || 'Mr.';
    const title = await this.modalService.openTitleModal(value);
    this.formGroup().patchValue({ title });
  }

  async openAccountTypeModal(): Promise<void> {
    const value = this.formGroup().get('account_type')?.value || 'Individual';
    const account_type = await this.modalService.openAccountTypeModal(value as 'Individual' | 'Business');
    this.formGroup().patchValue({ account_type });
  }

  async openLocationModal(): Promise<void> {
    const currentAddress = this.formGroup().get('address')?.value || '';
    const { address, latitude, longitude } = await this.modalService.openLocationModal(currentAddress);
    this.formGroup().patchValue({ address, latitude, longitude });
  }
}
