import { Button } from '@/components/form/button';
import { OtpInput } from '@/components/common/otp-input';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { signal, computed, inject, Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'verify-otp',
  styleUrl: './verify-otp.scss',
  templateUrl: './verify-otp.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, OtpInput, IonHeader, IonToolbar, IonContent]
})
export class VerifyOtp implements OnInit {
  // services
  navCtrl = inject(NavController);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  email = signal('');
  mobile = signal('');
  emailOtp = signal('');
  mobileOtp = signal('');
  isLoading = signal(false);
  isInvalidCode = signal(false);
  successTitle = signal('');
  successDescription = signal('');
  updateType = signal<'email' | 'phone' | ''>('');

  // computed
  hasBoth = computed(() => !!this.email() && !!this.mobile());
  canVerify = computed(() => {
    if (this.hasBoth()) {
      return this.emailOtp().length === 6 && this.mobileOtp().length === 6;
    } else if (this.email()) {
      return this.emailOtp().length === 6;
    } else if (this.mobile()) {
      return this.mobileOtp().length === 6;
    }
    return false;
  });

  ngOnInit(): void {
    // Get data from route state
    const state = this.router.currentNavigation()?.extras?.state as {
      email?: string;
      mobile?: string;
      phoneNumber?: string;
      successTitle?: string;
      successDescription?: string;
      type?: 'email' | 'phone';
    };

    if (state) {
      if (state.email) {
        this.email.set(state.email);
        this.updateType.set('email');
      }
      if (state.mobile || state.phoneNumber) {
        this.mobile.set(state.mobile || state.phoneNumber || '');
        this.updateType.set('phone');
      }
      if (state.successTitle) this.successTitle.set(state.successTitle);
      if (state.successDescription) this.successDescription.set(state.successDescription);
      if (state.type) this.updateType.set(state.type);
    }
  }

  onEmailOtpChange(otp: string): void {
    this.emailOtp.set(otp);
    this.isInvalidCode.set(false);
  }

  onMobileOtpChange(otp: string): void {
    this.mobileOtp.set(otp);
    this.isInvalidCode.set(false);
  }

  async onResendOtp(): Promise<void> {
    try {
      this.isLoading.set(true);
      if (this.email()) await this.authService.sendOtp({ email: this.email() });
      if (this.mobile()) await this.authService.sendOtp({ mobile: this.mobile() });
      this.toasterService.showSuccess('OTP resent successfully.');
    } catch (error: any) {
      this.toasterService.showError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerify(): Promise<void> {
    if (!this.canVerify()) {
      this.toasterService.showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      this.isLoading.set(true);
      this.isInvalidCode.set(false);

      // Verify OTP
      if (this.hasBoth()) {
        await this.authService.verifyOtp({ email: this.email(), code: this.emailOtp() });
        await this.authService.verifyOtp({ mobile: this.mobile(), code: this.mobileOtp() });
      } else {
        const code = this.email() ? this.emailOtp() : this.mobileOtp();
        await this.authService.verifyOtp({ email: this.email(), mobile: this.mobile(), code });
      }

      // Update user with new email or phone after successful verification
      if (this.updateType()) {
        const payload: any = {};
        if (this.updateType() === 'email' && this.email()) {
          payload.email = this.email();
        } else if (this.updateType() === 'phone' && this.mobile()) {
          payload.mobile = this.mobile();
        }

        if (Object.keys(payload).length > 0) {
          const userPayload = this.userService.generateUserPayload(payload);
          await this.userService.updateCurrentUser(userPayload);
        }
      }

      // Show success modal if config is provided
      if (this.successTitle()) {
        const shouldNavigateToAccount = this.updateType() === 'email' || this.updateType() === 'phone';

        await this.modalService.openSuccessModal({
          title: this.successTitle(),
          description: this.successDescription() || '',
          buttonLabel: 'Close',
          navigateTo: shouldNavigateToAccount ? '/settings/account' : undefined
        });
      } else {
        this.navCtrl.back();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      this.isInvalidCode.set(true);
      this.toasterService.showError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
