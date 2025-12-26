import { inject, Component } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';

@Component({
  selector: 'social-login-buttons',
  styleUrl: './social-login-buttons.scss',
  templateUrl: './social-login-buttons.html'
})
export class SocialLoginButtons {
  // services
  navCtrl = inject(NavController);
  authService = inject(AuthService);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  async loginWithGoogle() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      await this.authService.signInWithGoogle();
      const { data } = await this.authService.socialLogin();
      if (data.is_new_user) {
        this.navCtrl.navigateForward('/profile-setup');
      } else {
        this.navCtrl.navigateForward('/');
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
      await this.authService.signInWithApple();
      const { data } = await this.authService.socialLogin();
      if (data.is_new_user) {
        this.navCtrl.navigateForward('/profile-setup');
      } else {
        this.navCtrl.navigateForward('/');
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
      await this.authService.signInWithFacebook();
      const { data } = await this.authService.socialLogin();
      if (data.is_new_user) {
        this.navCtrl.navigateForward('/profile-setup');
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to sign in with Facebook.');
      this.toasterService.showError(message);
    } finally {
      await this.modalService.close();
    }
  }
}
