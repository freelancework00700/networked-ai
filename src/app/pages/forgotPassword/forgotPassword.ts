import { Component, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonFooter, IonModal, ModalController, IonSpinner } from '@ionic/angular/standalone';
import { Button } from '@/components/form/button';
import { EmailInput } from '@/components/form/email-input';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PasswordInput } from '@/components/form/password-input';

interface ForgotPasswordForm {
  email?: FormControl<string | null>;
  newPassword?: FormControl<string | null>;
  confirmPassword?: FormControl<string | null>;
}

@Component({
  selector: 'forgotPassword',
  styleUrl: './forgotPassword.scss',
  templateUrl: './forgotPassword.html',
  imports: [IonFooter, IonToolbar, IonContent, RouterModule, IonHeader, Button, EmailInput, ReactiveFormsModule, PasswordInput, IonModal, IonSpinner]
})
export class ForgotPassword {
  // services
  fb = inject(FormBuilder);
  router = inject(Router);
  modalController = inject(ModalController);

  // signals
  forgotPasswordForm = signal<FormGroup<ForgotPasswordForm>>(this.fb.group({}));
  currentStep = signal<1 | 2 | 3>(1);
  isModalOpen = signal(false);
  isLoading = signal(true);
  
  // timeout reference for clearing
  private loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  // methods
  goToStep2() {
    this.currentStep.set(2);
  }

  goToStep1() {
    this.currentStep.set(1);
  }
  goToStep3() {
    this.currentStep.set(3);
  }

  goBack() {
    if (this.currentStep() === 2) {
      this.goToStep1();
    } else if (this.currentStep() === 3) {
      this.goToStep2();
    } else {
      this.router.navigate(['/login']);
    }
  }

  async openLoadingModal() {
    this.isModalOpen.set(true);
    this.isLoading.set(true);
    
    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // After 2 seconds, switch to success state
    this.loadingTimeout = setTimeout(() => {
      if (this.isModalOpen()) {
        this.isLoading.set(false);
      }
      this.loadingTimeout = null;
    }, 1000);
  }

  closeModal() {
    // Clear the timeout if modal is closed during loading
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    
    this.isModalOpen.set(false);
    this.isLoading.set(true); // Reset loading state for next time
  }

  navigateToLogin() {
    this.isModalOpen.set(false);
    this.isLoading.set(true); // Reset loading state for next time
    
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }
}
