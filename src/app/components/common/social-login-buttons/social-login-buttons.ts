import { inject, Component } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'social-login-buttons',
  styleUrl: './social-login-buttons.scss',
  templateUrl: './social-login-buttons.html'
})
export class SocialLoginButtons {
  // services
  navCtrl = inject(NavController);
  authService = inject(AuthService);

  async loginWithGoogle() {
    try {
      const { user, isNewUser } = await this.authService.signInWithGoogle();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/profile', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error) {
      console.error('Google login error', error);
    }
  }

  async loginWithApple() {
    try {
      const { user, isNewUser } = await this.authService.signInWithApple();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/profile', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error) {
      console.error('Apple login error', error);
    }
  }

  async loginWithFacebook() {
    try {
      const { user, isNewUser } = await this.authService.signInWithFacebook();

      // new user -> profile page
      // existing user -> home page
      if (isNewUser) {
        this.navCtrl.navigateForward('/profile', { state: { user: JSON.parse(JSON.stringify(user)) } });
      } else {
        this.navCtrl.navigateForward('/');
      }
    } catch (error) {
      console.error('Facebook login error', error);
    }
  }
}
