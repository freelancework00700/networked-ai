import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { OtpInput } from '@/components/common/otp-input';
import { ToasterService } from '@/services/toaster.service';
import { Component, inject, Input, signal } from '@angular/core';

@Component({
  selector: 'verify-otp-modal',
  imports: [OtpInput, Button],
  styleUrl: './verify-otp-modal.scss',
  templateUrl: './verify-otp-modal.html'
})
export class VerifyOtpModal {
  // inputs
  @Input() mobile = '';
  @Input() type: 'email' | 'mobile' = 'mobile';

  // signals
  otp = signal('');
  isLoading = signal(false);

  // services
  authService = inject(AuthService);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  async resendOtp() {
    try {
      this.isLoading.set(true);
      if (this.type === 'mobile') {
        await this.authService.sendOtpForPhoneLogin(this.mobile);
        this.toasterService.showSuccess('OTP resent successfully.');
      }
    } catch (error: any) {
      this.toasterService.showError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async verifyOtp() {
    const otp = this.otp();
    if (!otp || otp.length !== 6) {
      this.toasterService.showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      this.isLoading.set(true);
      if (this.type === 'mobile') {
        await this.authService.verifyPhoneOTP(this.otp()!);
        await this.modalService.close(true);
      }
    } catch (error: any) {
      this.toasterService.showError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
