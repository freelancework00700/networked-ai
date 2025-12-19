import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@/services/auth.service';
import { NavController } from '@ionic/angular/standalone';

export const guestGuard: CanActivateFn = async (route, state) => {
  const navCtrl = inject(NavController);
  const authService = inject(AuthService);
  const token = authService.getCurrentToken();

  if (token) {
    // user is logged in, redirect to home page
    navCtrl.navigateRoot('/');
    return false; // deny access to login pages
  } else {
    return true; // allow access to login pages for unauthenticated users
  }
};
