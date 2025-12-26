import { Button } from '@/components/form/button';
import { PasswordInput } from '@/components/form/password-input';
import { IonFooter, IonHeader, IonToolbar, ModalController, NavController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { validateFields } from '@/utils/form-validation';
import { ToasterService } from '@/services/toaster.service';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';

interface DeleteAccountForm {
  password?: FormControl<string | null>;
}

@Component({
  selector: 'delete-account-modal',
  templateUrl: './delete-account-modal.html',
  styleUrl: './delete-account-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, PasswordInput, IonHeader, IonToolbar, IonFooter, ReactiveFormsModule]
})
export class DeleteAccountModal {
  // services
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  private toasterService = inject(ToasterService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  // signals
  isLoading = signal(false);
  isSubmitted = signal(false);
  form = signal<FormGroup<DeleteAccountForm>>(this.fb.group<DeleteAccountForm>({}));

  cancel(): void {
    this.modalCtrl.dismiss();
  }

  onForgotPassword(): void {
    this.modalCtrl.dismiss();
    this.navCtrl.navigateForward('/forgot-password');
  }

  async confirm(): Promise<void> {
    this.isSubmitted.set(true);

    const form = this.form();
    if (!(await validateFields(form, ['password']))) {
      this.toasterService.showError('Please enter your password.');
      return;
    }

    try {
      this.isLoading.set(true);
      
      // Close the delete account modal
      await this.modalCtrl.dismiss();
      
      // Show success modal - navigation will happen when user clicks close
      await this.modalService.openSuccessModal({
        title: 'Your Account Has Been Deleted.',
        buttonLabel: 'Close',
        navigateTo: '/login'
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      this.toasterService.showError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}