import { Button } from '@/components/form/button';
import { NgOtpInputComponent } from 'ng-otp-input';
import { AuthService } from '@/services/auth.service';
import { signal, inject, Component } from '@angular/core';
import { EmailInput } from '@/components/form/email-input';
import { MobileInput } from '@/components/form/mobile-input';
import { PasswordInput } from '@/components/form/password-input';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonModal, IonFooter, IonToolbar, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Content } from "@/layout/content";

interface LoginForm {
  phone_number?: FormControl<string | null>;
  email?: FormControl<string | null>;
  password?: FormControl<string | null>;
}

@Component({
  selector: 'login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
  imports: [Button, IonContent, IonModal, IonFooter, IonToolbar, IonSpinner, EmailInput, MobileInput, PasswordInput, ReactiveFormsModule, NgOtpInputComponent, Content]
})
export class Login {
  // services
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  // signals
  otp = signal<string | null>(null);
  isSubmitted = signal<boolean>(false);
  activeTab = signal<'email' | 'mobile'>('email');
  loginForm = signal<FormGroup<LoginForm>>(this.fb.group({}));
  isModalOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // variables
  otpConfig = {
    length: 6,
    placeholder: '',
    allowNumbersOnly: true
  };

  async login() {
    this.isSubmitted.set(true);
    console.log('form', this.loginForm().value);
    
    // If on mobile tab, show verification modal
    if (this.activeTab() === 'mobile') {
      this.isLoading.set(true);
      this.isModalOpen.set(true);
      
      // Simulate loading, then show success
      setTimeout(() => {
        this.isLoading.set(false);
      }, 1000);
    } else {
      // const result = await this.authService.signInWithEmailAndPassword('ravi.disolutions@gmail.com', 'Test@123');
      // console.log('result', result);
    }
  }
  
  closeModal() {
    this.isModalOpen.set(false);
  }
  
  navigateToLogin() {
    this.closeModal();
    // Navigate to login or handle post-verification logic
    console.log('Navigate to login after verification');
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

  navigateToForgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
