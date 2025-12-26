import { inject, Injectable } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { KEYS, LocalStorageService } from './localstorage.service';
import { FirebaseAuthError } from '@/utils/firebase-error-message';
import { ISendOtpPayload, IVerifyOtpPayload } from '@/interfaces/IAuth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { IAuthUser, IAuthResponse, ILoginPayload, IRegisterPayload } from '@/interfaces/IAuth';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  // services
  private localStorageService = inject(LocalStorageService);

  // user management methods
  private getUsers(): IAuthUser[] {
    const usersJson = this.localStorageService.getItem(KEYS.USERS);
    if (!usersJson) return [];
    try {
      return JSON.parse(usersJson);
    } catch {
      return [];
    }
  }

  private setUsers(users: IAuthUser[]): void {
    this.localStorageService.setItem(KEYS.USERS, JSON.stringify(users));
  }

  private addUser(user: IAuthUser): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.unshift(user);
    }
    this.setUsers(users);
  }

  private removeUser(userId: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.setUsers(users);
  }

  getCurrentToken(): string | null {
    const users = this.getUsers();
    return users.length > 0 && users[0].token ? users[0].token : null;
  }

  getCurrentUserId(): string | null {
    const user = this.getFirstUser();
    return user?.id || null;
  }

  private getFirstUser(): IAuthUser | null {
    const users = this.getUsers();
    return users.length > 0 ? users[0] : null;
  }

  async signOut() {
    // get current user's id to remove from users array
    const user = this.getFirstUser();
    if (user?.id) {
      this.removeUser(user.id);
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await FirebaseAuthentication.signInWithGoogle();
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async signInWithFacebook(): Promise<void> {
    try {
      await FirebaseAuthentication.signInWithFacebook();
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async signInWithApple(): Promise<void> {
    try {
      await FirebaseAuthentication.signInWithApple();
    } catch (error) {
      console.error('error: ', error);
      throw new Error(FirebaseAuthError(error));
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {}

  async login(payload: ILoginPayload): Promise<IAuthResponse> {
    const response = await this.post<IAuthResponse>('/auth/login', payload);

    if (response?.data?.token && response?.data?.user) {
      const userWithToken = {
        ...response.data.user,
        token: response.data.token
      };
      this.addUser(userWithToken);
    }

    return response;
  }

  async socialLogin(): Promise<IAuthResponse> {
    const { token: firebase_token } = await FirebaseAuthentication.getIdToken();
    const response = await this.post<IAuthResponse>('/auth/social-login', { firebase_token });

    if (response?.data?.token && response?.data?.user) {
      const userWithToken = {
        ...response.data.user,
        token: response.data.token
      };

      this.addUser(userWithToken);
    }

    return response;
  }

  async sendOtp({ email, mobile }: ISendOtpPayload): Promise<void> {
    const payload: ISendOtpPayload = {};
    if (email) payload.email = email;
    if (mobile) payload.mobile = mobile;

    await this.post('/auth/send-verification-otp', payload);
  }

  async verifyOtp({ email, mobile, code }: IVerifyOtpPayload): Promise<boolean> {
    const payload: IVerifyOtpPayload = { code };
    if (email) payload.email = email;
    if (mobile) payload.mobile = mobile;

    return await this.post<boolean>('/auth/verify-otp', payload);
  }

  async register(payload: IRegisterPayload): Promise<void> {
    const response = await this.post<IAuthResponse>('/auth/register', payload);

    if (response?.data?.token && response?.data?.user) {
      const userWithToken = {
        ...response.data.user,
        token: response.data.token
      };

      this.addUser(userWithToken);
    }
  }
}
