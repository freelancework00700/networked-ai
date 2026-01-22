import { Button } from '@/components/form/button';
import { EmailInput } from '@/components/form/email-input';
import { MobileInput } from '@/components/form/mobile-input';
import { TextInput } from '@/components/form/text-input';
import { UsernameInput } from '@/components/form/username-input';
import { PasswordInput } from '@/components/form/password-input';
import { ToasterService } from '@/services/toaster.service';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { validateFields } from '@/utils/form-validation';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '@/services/navigation.service';
import { signal, computed, inject, Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl, AbstractControl, Validators } from '@angular/forms';

type AccountInfoType = 'email' | 'phone' | 'username' | 'password';

interface ChangeAccountInfoForm {
  currentValue?: FormControl<string | null>;
  newValue?: FormControl<string | null>;
  confirmNewValue?: FormControl<string | null>;
}

@Component({
  selector: 'change-account-info',
  styleUrl: './change-account-info.scss',
  templateUrl: './change-account-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    EmailInput,
    MobileInput,
    TextInput,
    UsernameInput,
    PasswordInput,
    IonHeader,
    IonToolbar,
    IonContent,
    ReactiveFormsModule
  ]
})
export class ChangeAccountInfo implements OnInit {
  // services
  private fb = inject(FormBuilder);
  navigationService = inject(NavigationService);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  router = inject(Router);

  // view child
  @ViewChild('newPhoneInput', { read: MobileInput }) newPhoneInput?: MobileInput;

  // signals
  type = signal<AccountInfoType>('email');
  currentValue = signal('');
  isLoading = signal(false);
  isSubmitted = signal(false);
  form = signal<FormGroup<ChangeAccountInfoForm>>(this.fb.group<ChangeAccountInfoForm>({}));
  wrongCurrentPassword = signal(false);
  passwordsDontMatch = signal(false);

  // computed
  isEmail = computed(() => this.type() === 'email');
  isPhone = computed(() => this.type() === 'phone');
  isUsername = computed(() => this.type() === 'username');
  isPassword = computed(() => this.type() === 'password');
  title = computed(() => {
    if (this.isEmail()) return 'Update Your Email';
    if (this.isPhone()) return 'Update Your Phone Number';
    if (this.isPassword()) return 'Change Password';
    return 'Update Your Username';
  });
  currentLabel = computed(() => {
    if (this.isEmail()) return 'Current Email';
    if (this.isPhone()) return 'Current Phone Number';
    if (this.isPassword()) return 'Current Password';
    return 'Current Username';
  });
  newLabel = computed(() => {
    if (this.isEmail()) return 'New Email';
    if (this.isPhone()) return 'New Phone Number';
    if (this.isPassword()) return 'New Password';
    return 'New Username';
  });
  confirmButtonLabel = computed(() => {
    if (this.isUsername()) return 'Confirm and Save';
    if (this.isPassword()) return 'Save';
    return 'Confirm';
  });

  ngOnInit(): void {
    // Get type from route params
    const typeParam = this.route.snapshot.paramMap.get('type') as AccountInfoType;
    if (typeParam && ['email', 'phone', 'username', 'password'].includes(typeParam)) {
      this.type.set(typeParam);
    }

    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state || history.state;

    console.log('state', state);

    if (state) {
      if (this.isEmail()) {
        this.currentValue.set(state.email || 'user@gmail.com');
      } else if (this.isPhone()) {
        this.currentValue.set(state.phone || '1234567890');
      } else {
        this.currentValue.set(state.username || 'sandra_t');
      }
    }
    // Initialize current values based on type
    // this.initializeCurrentValue();
    this.initializeForm();
  }

  private initializeForm(): void {
    if (!this.isPassword()) {
      const form = this.fb.group<ChangeAccountInfoForm>({
        currentValue: this.fb.control({ value: this.currentValue(), disabled: true })
      });
      this.form.set(form);
    }
  }

  get newValueControl(): AbstractControl | null {
    return this.form().get('newValue');
  }

  async onConfirm(): Promise<void> {
    this.isSubmitted.set(true);
    this.wrongCurrentPassword.set(false);
    this.passwordsDontMatch.set(false);

    const form = this.form();

    // Handle password change separately
    if (this.isPassword()) {
      const password = form.get('currentValue')?.value || '';
      const new_password = form.get('newValue')?.value || '';
      const confirm_password = form.get('confirmNewValue')?.value;

      // Validate password fields
      if (!(await validateFields(form, ['currentValue', 'newValue', 'confirmNewValue']))) {
        return;
      }

      // Check if passwords match
      if (new_password !== confirm_password) {
        this.passwordsDontMatch.set(true);
        return;
      }

      try {
        this.isLoading.set(true);
        // TODO: Implement API call to change password
        await this.authService.changePassword(password, new_password);

        // Show success modal
        await this.modalService.openSuccessModal({
          title: 'Password Successfully Updated',
          description: "You've updated your password. Use this for login next time.",
          buttonLabel: 'Close'
        });
      } catch (error: any) {
        console.error('Error changing password:', error);
        this.toasterService.showError(error.message || 'Failed to change password. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
      return;
    }

    // Handle email, phone, and username
    const fields = ['newValue'];

    // Validate form based on type
    if (this.isEmail() || this.isPhone()) {
      if (!(await validateFields(form, fields))) {
        return;
      }
    }

    // Get new value
    let newValue: string | null | undefined;
    if (this.isPhone()) {
      newValue = this.newPhoneInput?.getPhoneNumber();
    } else {
      newValue = form.get('newValue')?.value;
    }

    if (!newValue) {
      return;
    }

    // Check if new value is different from current
    if (newValue === this.currentValue()) {
      const errorMsg = this.isEmail()
        ? 'New email must be different from current email.'
        : this.isPhone()
          ? 'New phone number must be different from current phone number.'
          : 'New username must be different from current username.';
      this.toasterService.showError(errorMsg);
      return;
    }

    try {
      this.isLoading.set(true);

      if (this.isEmail()) {
        console.log('newValue', newValue);
        // Send OTP to new email
        // await this.authService.sendOtp({ email: newValue });
        this.navigationService.navigateForward('/settings/verify-otp', false, {
            email: newValue,
            successTitle: 'Email Successfully Updated',
            successDescription: "You've verified your new email address. Use this for quick login next time."
        });
      } else if (this.isPhone()) {
        // Send OTP to new phone number
        // await this.authService.sendOtp({ mobile: newValue });
        this.navigationService.navigateForward('/settings/verify-otp', false, {
            mobile: newValue,
            successTitle: 'Phone Number Successfully Updated',
            successDescription: "You've verified your new phone number. Use this for quick login next time."
        });
      } else {
        // Username - direct update (no OTP)
        // TODO: Implement API call to update username
        await this.modalService.openSuccessModal({
          title: 'Username Successfully Updated',
          buttonLabel: 'Close'
        });
      }
    } catch (error: any) {
      console.error(`Error updating ${this.type()}:`, error);
      const errorMsg =
        error.message || `Failed to update ${this.type()}. Please try again.`;
      this.toasterService.showError(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}