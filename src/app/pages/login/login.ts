import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { OtpInput } from '@/components/common/otp-input';
import { validateFields } from '@/utils/form-validation';
import { EmailInput } from '@/components/form/email-input';
import { ToasterService } from '@/services/toaster.service';
import { MobileInput } from '@/components/form/mobile-input';
import { PasswordInput } from '@/components/form/password-input';
import { signal, inject, Component, ViewChild } from '@angular/core';
import { SocialLoginButtons } from '@/components/common/social-login-buttons';
import { IonContent, NavController, ModalController } from '@ionic/angular/standalone';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

interface LoginForm {
  email?: FormControl<string | null>;
  mobile?: FormControl<string | null>;
  password?: FormControl<string | null>;
}

@Component({
  selector: 'login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [Button, OtpInput, IonContent, EmailInput, MobileInput, PasswordInput, SocialLoginButtons, ReactiveFormsModule]
})
export class Login {
  // services
  fb = inject(FormBuilder);
  navCtrl = inject(NavController);
  authService = inject(AuthService);
  modalCtrl = inject(ModalController);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  // view child
  @ViewChild(MobileInput) mobileInput?: MobileInput;

  // signals
  otpSent = signal<boolean>(false);
  phoneNumber = signal<string>('');
  otp = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  activeTab = signal<'email' | 'mobile'>('email');
  loginForm = signal<FormGroup<LoginForm>>(this.fb.group<LoginForm>({}));

  async login() {
    this.isSubmitted.set(true);

    if (this.activeTab() === 'email') {
      await this.loginWithEmail();
    } else {
      if (!this.otpSent()) {
        await this.sendOtp();
      } else {
        await this.verifyOtp();
      }
    }
  }

  private async loginWithEmail() {
    try {
      // validate email login form fields
      const fields = ['email', 'password'];
      if (!(await validateFields(this.loginForm(), fields))) {
        this.toasterService.showError('Please enter the email and password.');
        return;
      }

      // set loading state
      this.isLoading.set(true);
      await this.modalService.openLoadingModal('Signing you in...');

      // login with email and password
      const { email, password } = this.loginForm().value;
      const { user, isNewUser } = await this.authService.signInWithEmailAndPassword(email!, password!);
      await this.authService.loginWithFirebaseToken();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/profile', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error: any) {
      console.error(error);
      this.toasterService.showError(error.message || 'Login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
      await this.modalService.close();
    }
  }

  private async sendOtp() {
    // get full phone number with country code from mobile input
    const fullPhoneNumber = this.mobileInput?.getPhoneNumber();

    // validate phone number step-1 fields
    if (!(await validateFields(this.loginForm(), ['mobile'])) || !fullPhoneNumber) {
      this.toasterService.showError('Please enter a valid phone number.');
      return;
    }

    try {
      this.isLoading.set(true);
      await this.authService.sendOtpForPhoneLogin(fullPhoneNumber);

      // store phone number and create masked version
      this.phoneNumber.set(fullPhoneNumber);
      this.otpSent.set(true);
      this.isSubmitted.set(false); // reset submission state for otp input
    } catch (error: any) {
      console.error(error);
      this.toasterService.showError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async verifyOtp() {
    // validate otp step-2 fields
    const otp = this.otp();
    if (!otp || otp.length !== 6) {
      this.toasterService.showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      this.isLoading.set(true);
      await this.modalService.openLoadingModal('Signing you in...');

      // verify otp
      const { user, isNewUser } = await this.authService.verifyOTP(otp);
      await this.authService.loginWithFirebaseToken();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/profile', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      this.toasterService.showError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
      await this.modalService.close();
    }
  }

  async resendOtp() {
    if (!this.phoneNumber()) {
      return;
    }

    try {
      this.isLoading.set(true);
      await this.authService.sendOtpForPhoneLogin(this.phoneNumber());
      this.toasterService.showSuccess('OTP resent successfully.');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      this.toasterService.showError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  switchToPhoneInput() {
    // reset otp state when switching back to phone input
    this.otp.set(null);
    this.otpSent.set(false);
    this.phoneNumber.set('');
    this.isSubmitted.set(false);
  }
}
