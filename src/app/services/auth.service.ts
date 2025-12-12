import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { RecaptchaVerifier } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { IAuthResponse } from '@/interfaces/IAuth';
import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { environment } from 'src/environments/environment';
import { KEYS, LocalStorageService } from './localstorage.service';
import { FirebaseAuthError } from '@/utils/firebase-error-message';
import { User, FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // services
  private router = inject(Router);
  private http = inject(HttpClient);
  private firebaseService = inject(FirebaseService);
  private localStorageService = inject(LocalStorageService);

  // variables
  private verificationId: string | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  async signOut() {
    // log out from native device
    await FirebaseAuthentication.signOut();

    // clear verification id
    this.verificationId = null;

    // clear recaptcha verifier
    this.recaptchaVerifier = null;

    // clear API token
    this.localStorageService.removeItem(KEYS.TOKEN);
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
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

  async verifyPhoneOTP(verificationCode: string): Promise<{ user: User; isNewUser: boolean }> {
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

  async signInWithApple(): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const nativeResult = await FirebaseAuthentication.signInWithApple();
      return { user: nativeResult.user!, isNewUser: nativeResult?.additionalUserInfo?.isNewUser || false };
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async linkEmailToAccount(email: string): Promise<void> {
    try {
      // link email/password to current user
      await FirebaseAuthentication.linkWithEmailAndPassword({ email: email.trim().toLowerCase(), password: Date.now().toString() });

      // send verification email ( optional )
      await FirebaseAuthentication.sendEmailVerification();

      console.log('Email linked to account success');
    } catch (error) {
      console.error('Error linking email to account:', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await FirebaseAuthentication.sendPasswordResetEmail({ email });
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await FirebaseAuthentication.deleteUser();
    } catch (error) {
      console.error('Error deleting account: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async loginWithFirebaseToken(): Promise<IAuthResponse> {
    try {
      const { token: firebase_token } = await FirebaseAuthentication.getIdToken();
      const response = await firstValueFrom(this.http.post<IAuthResponse>(`${environment.apiUrl}/auth/login`, { firebase_token }));

      if (response?.data?.token) {
        this.localStorageService.setItem(KEYS.TOKEN, response.data.token);
      }

      return response;
    } catch (error) {
      console.error('Error logging in with Firebase token: ', error);
      throw error;
    }
  }
}
