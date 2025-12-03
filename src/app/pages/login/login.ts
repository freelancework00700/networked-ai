import { Content } from '@/layout/content';
import { Button } from '@/components/form/button';
import { NgOtpInputComponent } from 'ng-otp-input';
import { AuthService } from '@/services/auth.service';
import { signal, inject, Component } from '@angular/core';
import { EmailInput } from '@/components/form/email-input';
import { MobileInput } from '@/components/form/mobile-input';
import { PasswordInput } from '@/components/form/password-input';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface LoginForm {
  phone_number?: FormControl<string | null>;
  email?: FormControl<string | null>;
  password?: FormControl<string | null>;
}

@Component({
  selector: 'login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [
    Button, 
    Content, 
    EmailInput, 
    MobileInput, 
    PasswordInput, 
    ReactiveFormsModule, 
    NgOtpInputComponent
  ]
})
export class Login {
  // services
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  
  // signals
  otp = signal<string | null>(null);
  isSubmitted = signal<boolean>(false);
  activeTab = signal<'email' | 'mobile'>('email');
  loginForm = signal<FormGroup<LoginForm>>(this.fb.group({}));
  
  // variables
  otpConfig = {
    length: 6,
    placeholder: '',
    allowNumbersOnly: true
  };

  async login() {
    this.isSubmitted.set(true);
    console.log('form', this.loginForm().value);
    // const result = await this.authService.signInWithEmailAndPassword('ravi.disolutions@gmail.com', 'Test@123');
    // console.log('result', result);
  }

  async loginWithGoogle() {
    try {
      const result = await this.authService.signInWithGoogle();
      console.log('Google login result', result);
    } catch (error) {
      console.error('Google login error', error);
    }
  }

  async loginWithApple() {
    try {
      console.log('Apple login - to be implemented');
    } catch (error) {
      console.error('Apple login error', error);
    }
  }

  async loginWithFacebook() {
    try {
      const result = await this.authService.signInWithFacebook();
      console.log('Facebook login result', result);
    } catch (error) {
      console.error('Facebook login error', error);
    }
  }

  setActiveTab(tab: 'email' | 'mobile') {
    this.activeTab.set(tab);
  }

  navigateToSignUp(event: Event) {
    event.preventDefault();
    console.log('Navigate to sign up');
  }

  openTermsOfService(event: Event) {
    event.preventDefault();
    console.log('Open terms of service');
  }

  openPrivacyPolicy(event: Event) {
    event.preventDefault();
    console.log('Open privacy policy');
  }
}
