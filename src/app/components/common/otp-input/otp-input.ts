import { maskPhoneNumber } from '@/utils/helper';
import { NgOtpInputComponent } from 'ng-otp-input';
import { input, output, signal, Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-input',
  styleUrl: './otp-input.scss',
  imports: [NgOtpInputComponent],
  templateUrl: './otp-input.html'
})
export class OtpInput implements OnInit {
  // inputs
  mobile = input.required<string>();
  isLoading = input.required<boolean>();

  // outputs
  resendOtp = output<void>();
  otpChange = output<string>();

  // signals
  maskedMobile = signal<string>('');
  otpConfig = signal({ length: 6, placeholder: '', allowNumbersOnly: true });

  ngOnInit(): void {
    this.maskedMobile.set(maskPhoneNumber(this.mobile()));
  }
}
