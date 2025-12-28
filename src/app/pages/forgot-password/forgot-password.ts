import { maskEmail } from '@/utils/helper';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { validateFields } from '@/utils/form-validation';
import { inject, signal, Component } from '@angular/core';
import { EmailInput } from '@/components/form/email-input';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { PasswordInput } from '@/components/form/password-input';
import { NavigationService } from '@/services/navigation.service';
import { IonHeader, IonFooter, IonContent, IonToolbar } from '@ionic/angular/standalone';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

interface ForgotPasswordForm {
  email?: FormControl<string | null>;
  newPassword?: FormControl<string | null>;
  confirmPassword?: FormControl<string | null>;
}

@Component({
  selector: 'forgot-password',
  styleUrl: './forgot-password.scss',
  templateUrl: './forgot-password.html',
  imports: [Button, IonHeader, IonFooter, IonToolbar, IonContent, EmailInput, PasswordInput, ReactiveFormsModule]
})
export class ForgotPassword {
  // services
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);
  navigationService = inject(NavigationService);

  // signals
  isLoading = signal(false);
  isSubmitted = signal(false);
  step = signal<1 | 2 | 3>(1);
  maskedEmail = signal<string>('');
  forgotPasswordForm = signal<FormGroup<ForgotPasswordForm>>(this.fb.group({}));

  goBack() {
    if (this.step() === 2) {
      this.step.set(1);
    } else if (this.step() === 3) {
      this.step.set(2);
    } else {
      this.navigationService.back('/login');
    }
  }

  async sendResetPasswordLink() {
    this.isSubmitted.set(true);

    // validate email login form fields
    if (!(await validateFields(this.forgotPasswordForm(), ['email']))) {
      this.toasterService.showError('Please enter the email and password.');
      return;
    }

    try {
      // set loading state
      this.isLoading.set(true);
      await this.modalService.openLoadingModal('Sending reset password link...');

      // send reset password link
      const { email } = this.forgotPasswordForm().value;
      this.maskedEmail.set(maskEmail(email!));
      await this.authService.forgotPassword(email!);

      // open email app screen
      this.step.set(2);
    } catch (error: any) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to send reset password link.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
      await this.modalService.close();
    }
  }

  openEmailApp() {
    window.open('https://mail.google.com/mail/u/0/#search/do-not-reply%40net-worked.ai', '_blank');
  }
}
