import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { OtpInput } from '@/components/common/otp-input';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { Input, inject, signal, computed, Component } from '@angular/core';

@Component({
  selector: 'verify-otp-modal',
  styleUrl: './verify-otp-modal.scss',
  templateUrl: './verify-otp-modal.html',
  imports: [Button, OtpInput, IonFooter, IonToolbar]
})
export class VerifyOtpModal {
  // inputs
  @Input() email = '';
  @Input() mobile = '';

  // signals
  emailOtp = signal('');
  mobileOtp = signal('');
  isLoading = signal(false);
  isInvalidOtp = signal(false);

  // services
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // computed
  hasBoth = computed(() => !!this.email && !!this.mobile);
  canVerify = computed(() => {
    if (this.hasBoth()) {
      return this.emailOtp().length === 6 && this.mobileOtp().length === 6;
    } else if (this.email) {
      return this.emailOtp().length === 6;
    } else if (this.mobile) {
      return this.mobileOtp().length === 6;
    }

    return false;
  });

  async resendOtp() {
    try {
      this.isLoading.set(true);
      if (this.email) await this.authService.sendOtp({ email: this.email });
      if (this.mobile) await this.authService.sendOtp({ mobile: this.mobile });

      this.toasterService.showSuccess('OTP resent successfully.');
    } catch (error: any) {
      this.toasterService.showError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async verifyOtp() {
    if (!this.canVerify()) {
      this.toasterService.showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      let verified = false;
      this.isLoading.set(true);

      if (this.hasBoth()) {
        const emailVerified = await this.authService.verifyOtp({ email: this.email, code: this.emailOtp() });
        const mobileVerified = await this.authService.verifyOtp({ mobile: this.mobile, code: this.mobileOtp() });
        verified = emailVerified && mobileVerified;
      } else {
        const code = this.email ? this.emailOtp() : this.mobileOtp();
        verified = await this.authService.verifyOtp({ email: this.email, mobile: this.mobile, code });
      }

      // if verification failed, show error and return false
      if (!verified) {
        this.isInvalidOtp.set(true);
        return;
      }

      // close modal and return true after successful verification
      await this.modalService.close(verified);
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to verify verification code.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
