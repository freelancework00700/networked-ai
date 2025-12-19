import { Router } from '@angular/router';
import { IAuthUser } from '@/interfaces/IAuth';
import { Button } from '@/components/form/button';
import { IUserForm } from '@/interfaces/IUserForm';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { validateFields } from '@/utils/form-validation';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { UserPersonalInfo } from '@/components/common/user-personal-info';
import { ProfileImageInput } from '@/components/form/profile-image-input';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserAdditionalInfo } from '@/components/common/user-additional-info';
import { IonFooter, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { signal, inject, Component, viewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';

const PROFILE_STEPS = {
  PERSONAL_INFO: 1,
  ADDITIONAL_INFO: 2,
  PROFILE_IMAGE: 3,
  NETWORK_SUGGESTIONS: 4
};

interface State {
  user?: IAuthUser;
}

interface NetworkSuggestion {
  id: string;
  name: string;
  value: number;
  company: string;
  jobTitle: string;
}

@Component({
  selector: 'signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, IonContent, UserPersonalInfo, ProfileImageInput, UserAdditionalInfo, ReactiveFormsModule]
})
export class Signup implements AfterViewInit {
  // services
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  steps = signal([1, 2, 3, 4]);
  currentStep = signal<number>(PROFILE_STEPS.PERSONAL_INFO);

  emailLinked = signal(false);
  phoneLinked = signal(false);
  needsEmailLink = signal(false);
  needsPhoneLink = signal(false);

  isLoading = signal(false);
  isSubmitted = signal(false);
  selectedSuggestions = signal<Set<string>>(new Set());
  profileForm = signal<FormGroup<IUserForm>>(
    this.fb.group({
      latitude: [''],
      longitude: ['']
    }) as FormGroup<IUserForm>
  );
  emailVerified = signal(false); // don't verify email if social login
  isSocialLogin = signal(false); // if true, then save user instead of register

  // view child
  userPersonalInfo = viewChild(UserPersonalInfo);

  // variables
  readonly networkSuggestions: NetworkSuggestion[] = [
    { id: '1', name: 'Kathryn Murphy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '2', name: 'Esther Howard', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '3', name: 'Arlene McCoy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '4', name: 'Darlene Robertson', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '5', name: 'Ronald Richards', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '6', name: 'Albert Flores', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '7', name: 'Eleanor Pena', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '8', name: 'Savannah Nguyen', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' }
  ];

  async ngAfterViewInit(): Promise<void> {
    // auto fill email and disable email input if social login
    const state = this.router.currentNavigation()?.extras?.state as State;
    console.log('state as', state);
    if (state && state.user) {
      this.isSocialLogin.set(true);
      const { email } = state.user;
      if (email) {
        this.emailVerified.set(true);
        this.profileForm().patchValue({ email }, { emitEvent: false });
        this.profileForm().get('email')?.disable({ emitEvent: false });
      }
    }
  }

  private getStep1ValidationFields(): string[] {
    const fields = ['title', 'first_name', 'last_name', 'email', 'mobile', 'username', 'dob', 'account_type', 'address'];

    // add password for signup scenario
    if (!this.isSocialLogin()) {
      fields.push('password');
    }

    // remove email if already linked or being linked
    if (this.needsPhoneLink() || this.phoneLinked()) {
      const emailIndex = fields.indexOf('email');
      if (emailIndex > -1) fields.splice(emailIndex, 1);
    }

    // remove mobile if already linked or being linked
    if (this.needsEmailLink() || this.emailLinked()) {
      const mobileIndex = fields.indexOf('mobile');
      if (mobileIndex > -1) fields.splice(mobileIndex, 1);
    }

    return fields;
  }

  private async handleSubmit(): Promise<void> {
    const payload = this.profileForm().getRawValue() as Partial<IAuthUser>;
    payload.mobile = this.userPersonalInfo()?.getPhoneNumber();

    // save user if social login, otherwise register
    if (this.isSocialLogin()) {
      await this.authService.loginWithFirebaseToken();
      await this.userService.updateCurrentUser(payload);
    } else {
      await this.authService.register(payload);
    }
  }

  addSuggestion(id: string): void {
    const selected = new Set(this.selectedSuggestions());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedSuggestions.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedSuggestions().has(id);
  }

  async save(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.isSubmitted.set(true);

      if (this.currentStep() === PROFILE_STEPS.PERSONAL_INFO) {
        if (!(await validateFields(this.profileForm(), this.getStep1ValidationFields()))) {
          this.toasterService.showError('Please fill all required fields.');
          return;
        }
        this.currentStep.set(PROFILE_STEPS.ADDITIONAL_INFO);
      } else if (this.currentStep() === PROFILE_STEPS.ADDITIONAL_INFO) {
        this.currentStep.set(PROFILE_STEPS.PROFILE_IMAGE);
      } else if (this.currentStep() === PROFILE_STEPS.PROFILE_IMAGE) {
        const email = this.profileForm().get('email')?.value;
        const mobile = this.userPersonalInfo()?.getPhoneNumber();

        // if email is verified via social login, skip email OTP
        if (this.emailVerified() && email) {
          if (mobile) {
            await this.authService.sendOtp({ mobile });
            const result = await this.modalService.openOtpModal('', mobile);
            if (!result) return;
          }
        } else {
          // send otp for both email and mobile when new registration
          await this.sendVerificationCode();
          const result = await this.modalService.openOtpModal(email || '', mobile || '');
          if (!result) return;
        }

        await this.handleSubmit();
        this.currentStep.set(PROFILE_STEPS.NETWORK_SUGGESTIONS);
      } else {
        this.navCtrl.navigateRoot('/');
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to save/register user.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async sendVerificationCode(): Promise<void> {
    try {
      const email = this.profileForm().get('email')?.value;
      const mobile = this.userPersonalInfo()?.getPhoneNumber();
      if (!email && !mobile) {
        throw new Error('Email or mobile number is required for verification.');
      }

      if (email) await this.authService.sendOtp({ email });
      if (mobile) await this.authService.sendOtp({ mobile });
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to send verification code.');
      throw new Error(message);
    }
  }

  goBack(): void {
    if (this.currentStep() === PROFILE_STEPS.PERSONAL_INFO) {
      this.navCtrl.navigateBack('/');
    } else {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  async openTitleModal(): Promise<void> {
    const value = this.profileForm().get('title')?.value || 'Mr.';
    const title = await this.modalService.openTitleModal(value);
    this.profileForm().patchValue({ title });
  }

  async openDateModal(): Promise<void> {
    const value = this.profileForm().get('dob')?.value || '';
    const dob = await this.modalService.openDateTimeModal('date', value);
    this.profileForm().patchValue({ dob });
  }

  async openAccountTypeModal(): Promise<void> {
    const value = this.profileForm().get('account_type')?.value || 'Individual';
    const account_type = await this.modalService.openAccountTypeModal(value as 'Individual' | 'Business');
    this.profileForm().patchValue({ account_type });
  }

  async openLocationModal(): Promise<void> {
    const currentAddress = this.profileForm().get('address')?.value || '';
    const { address, latitude, longitude } = await this.modalService.openLocationModal(currentAddress);
    this.profileForm().patchValue({ address, latitude, longitude });
  }
}
