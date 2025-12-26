import { NgOtpInputComponent } from 'ng-otp-input';
import { maskEmail, maskPhoneNumber } from '@/utils/helper';
import { input, output, signal, Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-input',
  styleUrl: './otp-input.scss',
  imports: [NgOtpInputComponent],
  templateUrl: './otp-input.html'
})
export class OtpInput implements OnInit {
  // inputs
  email = input('');
  mobile = input('');
  isLoading = input(false);
  isInvalidOtp = input(false);

  // outputs
  resendOtp = output<void>();
  emailOtpChange = output<string>();
  mobileOtpChange = output<string>();

  // signals
  maskedEmail = signal<string>('');
  maskedMobile = signal<string>('');
  otpConfig = signal({ length: 6, placeholder: '', allowNumbersOnly: true });

  ngOnInit(): void {
    this.maskedEmail.set(maskEmail(this.email()));
    this.maskedMobile.set(maskPhoneNumber(this.mobile()));
  }
}
