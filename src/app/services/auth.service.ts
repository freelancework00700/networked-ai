import {
  signOut,
  deleteUser,
  RecaptchaVerifier,
  PhoneAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { FirebaseAuthError } from '@/utils/firebase-error-message';
import { User, FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // services
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private firebaseService = inject(FirebaseService);

  // variables
  private verificationId: string | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // initialize Firebase Auth state listener
  initializeOnAuthStateChanged(): void {
    this.firebaseService.auth.onAuthStateChanged(async (user) => {
      // hide splash screen
      await SplashScreen.hide();

      if (user) {
        console.log('firebase logged in: ', user);
      } else {
        await this.signOut();
        const currentUrl = this.router.url;
        // check if we're not already on the login page (check path without query params)
        const currentPath = currentUrl.split('?')[0];
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/not-found')) {
          // without redirect query param
          if (currentPath === '/') {
            this.router.navigate(['/login']);
          }

          // with redirect query param
          else {
            const redirectUrl = encodeURIComponent(currentUrl);
            this.router.navigate(['/login'], { queryParams: { redirect: redirectUrl } });
          }
        }
      }
    });
  }

  async signOut() {
    // log out from native device
    await FirebaseAuthentication.signOut();

    // log out from web app
    await signOut(this.firebaseService.auth);

    // clear verification id
    this.verificationId = null;

    // clear recaptcha verifier
    this.recaptchaVerifier = null;
  }

  async sendOtpForPhoneLogin(phoneNumber: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        // add event listener for phone code sent
        await FirebaseAuthentication.addListener('phoneCodeSent', async (event) => {
          await FirebaseAuthentication.removeAllListeners();
          this.verificationId = event.verificationId;
          resolve(true);
        });

        // add event listener for phone verification failed
        await FirebaseAuthentication.addListener('phoneVerificationFailed', async (error) => {
          await FirebaseAuthentication.removeAllListeners();
          reject(new Error(FirebaseAuthError(error)));
        });

        // create recaptcha verifier
        if (!this.recaptchaVerifier) {
          this.recaptchaVerifier = new RecaptchaVerifier(this.firebaseService.auth, 'recaptcha-container', { size: 'invisible' });
        }
        await this.recaptchaVerifier.render();

        // send otp to phone number
        await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber, recaptchaVerifier: this.recaptchaVerifier! });
      } catch (error) {
        console.error('error: ', error);
        reject(new Error(FirebaseAuthError(error)));
      }
    });
  }

  async verifyOTP(verificationCode: string): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.confirmVerificationCode({ verificationId: this.verificationId!, verificationCode });
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async sendOtpForPhoneLink(phoneNumber: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        // add event listener for phone code sent
        await FirebaseAuthentication.addListener('phoneCodeSent', async (event) => {
          await FirebaseAuthentication.removeAllListeners();
          this.verificationId = event.verificationId;
          resolve(true);
        });

        // add event listener for phone verification failed
        await FirebaseAuthentication.addListener('phoneVerificationFailed', async (error) => {
          await FirebaseAuthentication.removeAllListeners();
          reject(new Error(FirebaseAuthError(error)));
        });

        // create recaptcha verifier
        if (!this.recaptchaVerifier) {
          this.recaptchaVerifier = new RecaptchaVerifier(this.firebaseService.auth, 'recaptcha-container', { size: 'invisible' });
        }
        await this.recaptchaVerifier.render();

        // send otp to phone number
        await FirebaseAuthentication.linkWithPhoneNumber({ phoneNumber, recaptchaVerifier: this.recaptchaVerifier! });
      } catch (error) {
        console.error('Error sending phone number verification code:', error);
        throw new Error(FirebaseAuthError(error));
      }
    });
  }

  async verifyOtpAndLinkPhoneNumber(otp: string): Promise<void> {
    try {
      const credential = PhoneAuthProvider.credential(this.verificationId!, otp);
      await linkWithCredential(this.firebaseService.auth.currentUser!, credential);
      console.log('Phone number linked to account success');
    } catch (error) {
      console.error('Error linking phone number to account:', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async signInWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.signInWithGoogle();
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async signInWithFacebook(): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.signInWithFacebook();
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async linkEmailToAccount(email: string): Promise<void> {
    try {
      // link email/password to current user
      const credential = EmailAuthProvider.credential(email.trim().toLowerCase(), Date.now().toString());
      const { user } = await linkWithCredential(this.firebaseService.auth.currentUser!, credential);

      // send verification email ( optional )
      sendEmailVerification(user);

      console.log('Email linked to account success');
    } catch (error) {
      console.error('Error linking email to account:', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await deleteUser(this.firebaseService.auth.currentUser!);
      this.navCtrl.navigateRoot('/login');
    } catch (err) {
      console.warn('Failed to delete user from DB (ignored):', err);
    }
  }
}
