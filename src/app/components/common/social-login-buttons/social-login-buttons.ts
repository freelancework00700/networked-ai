import { inject, Component } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { ToasterService } from '@/services/toaster.service';

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
      const { user, isNewUser } = await this.authService.signInWithGoogle();
      await this.authService.loginWithFirebaseToken();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/signup', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error: any) {
      console.error('Google login error', error);
      this.toasterService.showError(error.message || 'Failed to sign in with Google.');
    } finally {
      await this.modalService.close();
    }
  }

  async loginWithApple() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      const { user, isNewUser } = await this.authService.signInWithApple();
      await this.authService.loginWithFirebaseToken();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/signup', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error: any) {
      console.error('Apple login error', error);
      this.toasterService.showError(error.message || 'Failed to sign in with Apple.');
    } finally {
      await this.modalService.close();
    }
  }

  async loginWithFacebook() {
    try {
      await this.modalService.openLoadingModal('Signing you in...');
      const { user, isNewUser } = await this.authService.signInWithFacebook();
      await this.authService.loginWithFirebaseToken();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/signup', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error: any) {
      console.error('Facebook login error', error);
      this.toasterService.showError(error.message || 'Failed to sign in with Facebook.');
    } finally {
      await this.modalService.close();
    }
  }
}
