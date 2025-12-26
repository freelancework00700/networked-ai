import { Subscription } from 'rxjs';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { OtpInput } from '@/components/common/otp-input';
import { validateFields } from '@/utils/form-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailInput } from '@/components/form/email-input';
import { ToasterService } from '@/services/toaster.service';
import { MobileInput } from '@/components/form/mobile-input';
import { BaseApiService } from '@/services/base-api.service';
import { PasswordInput } from '@/components/form/password-input';
import { SocialLoginButtons } from '@/components/common/social-login-buttons';
import { signal, inject, Component, viewChild, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonContent, NavController, ModalController } from '@ionic/angular/standalone';

interface LoginForm {
  email?: FormControl<string | null>;
  mobile?: FormControl<string | null>;
  password?: FormControl<string | null>;
}

type LoginMethod = 'email' | 'mobile';

@Component({
  selector: 'login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [Button, IonIcon, OtpInput, IonContent, EmailInput, MobileInput, PasswordInput, SocialLoginButtons, ReactiveFormsModule]
})
export class Login implements OnInit, OnDestroy {
  // services
  router = inject(Router);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  navCtrl = inject(NavController);
  authService = inject(AuthService);
  modalCtrl = inject(ModalController);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  // view child
  mobileInput = viewChild(MobileInput);

  // signals
  isInvalidOtp = signal(false);
  otpSent = signal<boolean>(false);
  phoneNumber = signal<string>('');
  otp = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  activeTab = signal<LoginMethod>('email');
  loginForm = signal<FormGroup<LoginForm>>(this.fb.group<LoginForm>({}));

  // subscriptions
  private queryParamsSubscription!: Subscription;

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      const method = params.get('method');
      if (method === 'mobile') {
        this.activeTab.set('mobile');
      } else {
        this.activeTab.set('email');
      }
    });
  }

  switchLoginMethod(method: LoginMethod) {
    // don't switch if the method is already active
    if (this.activeTab() === method) return;

    // reset otp state when switching back to phone input
    if (method === 'mobile') {
      this.otp.set(null);
      this.otpSent.set(false);
      this.phoneNumber.set('');
      this.isSubmitted.set(false);
    }

    // set the active tab
    this.activeTab.set(method);

    // navigate to the login page with the new method
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { method },
      queryParamsHandling: 'merge'
    });
  }

  private async loginWithEmail() {
    try {
      // validate email and password
      if (!(await validateFields(this.loginForm(), ['email', 'password']))) return;

      // set loading state
      this.isLoading.set(true);
      await this.modalService.openLoadingModal('Signing you in...');

      // login with email and password
      const { email, password } = this.loginForm().value;
      await this.authService.login({ email: email!, password: password! });
      this.navCtrl.navigateForward('/');
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to login.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
      await this.modalService.close();
    }
  }

  private async sendOtp() {
    // get full phone number and validate phone number
    const mobile = this.mobileInput()?.getPhoneNumber();
    if (!(await validateFields(this.loginForm(), ['mobile'])) || !mobile) return;

    try {
      this.isLoading.set(true);
      await this.authService.sendOtp({ mobile });

      // store phone number and create masked version
      this.otpSent.set(true);
      this.phoneNumber.set(mobile);
      this.isSubmitted.set(false); // reset submission state for otp input
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to send OTP.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async verifyOtp() {
    const otp = this.otp();
    if (!otp || otp.length !== 6) {
      this.toasterService.showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      this.isLoading.set(true);
      await this.modalService.openLoadingModal('Signing you in...');
      await this.authService.login({ mobile: this.phoneNumber(), otp });
      this.navCtrl.navigateForward('/');
    } catch (error) {
      this.isInvalidOtp.set(true);
      const message = BaseApiService.getErrorMessage(error, 'Invalid or expired OTP.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
      await this.modalService.close();
    }
  }

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

  async resendOtp() {
    if (!this.phoneNumber()) return;

    try {
      this.isLoading.set(true);
      await this.authService.sendOtp({ mobile: this.phoneNumber() });
      this.toasterService.showSuccess('OTP resent successfully.');
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to resend OTP.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy() {
    this.queryParamsSubscription?.unsubscribe();
  }
}
