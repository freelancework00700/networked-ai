import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { OtpInput } from '@/components/common/otp-input';
import { ToasterService } from '@/services/toaster.service';
import { Input, inject, signal, computed, Component } from '@angular/core';

@Component({
  imports: [Button, OtpInput],
  selector: 'verify-otp-modal',
  styleUrl: './verify-otp-modal.scss',
  templateUrl: './verify-otp-modal.html'
})
export class VerifyOtpModal {
  // inputs
  @Input() email = '';
  @Input() mobile = '';

  // signals
  emailOtp = signal('');
  mobileOtp = signal('');
  isLoading = signal(false);

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
      this.isLoading.set(true);
      if (this.hasBoth()) {
        await this.authService.verifyOtp({ email: this.email, code: this.emailOtp()});
        await this.authService.verifyOtp({ mobile: this.mobile, code: this.mobileOtp()});
      } else {
        const code = this.email ? this.emailOtp() : this.mobileOtp();
        await this.authService.verifyOtp({ email: this.email, mobile: this.mobile, code });
      }

      await this.modalService.close(true);
    } catch (error: any) {
      this.toasterService.showError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
