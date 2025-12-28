import { inject, Component } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { NavigationService } from '@/services/navigation.service';

@Component({
  selector: 'social-login-buttons',
  styleUrl: './social-login-buttons.scss',
  templateUrl: './social-login-buttons.html'
})
export class SocialLoginButtons {
  // services
  authService = inject(AuthService);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);
  navigationService = inject(NavigationService);

  async loginWithGoogle() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      const { data } = await this.authService.signInWithGoogle();
      if (data.is_new_user) {
        this.navigationService.navigateForward('/profile/setup', true);
      } else {
        this.navigationService.navigateForward('/', true);
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to sign in with Google.');
      this.toasterService.showError(message);
    } finally {
      await this.modalService.close();
    }
  }

  async loginWithApple() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      const { data } = await this.authService.signInWithApple();
      if (data.is_new_user) {
        this.navigationService.navigateForward('/profile/setup', true);
      } else {
        this.navigationService.navigateForward('/', true);
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to sign in with Apple.');
      this.toasterService.showError(message);
    } finally {
      await this.modalService.close();
    }
  }

  async loginWithFacebook() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      const { data } = await this.authService.signInWithFacebook();
      if (data.is_new_user) {
        this.navigationService.navigateForward('/profile/setup', true);
      } else {
        this.navigationService.navigateForward('/', true);
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to sign in with Facebook.');
      this.toasterService.showError(message);
    } finally {
      await this.modalService.close();
    }
  }
}
