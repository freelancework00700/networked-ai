import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const guestGuard: CanActivateFn = async (route, state) => {
  const navCtrl = inject(NavController);
  const { user } = await FirebaseAuthentication.getCurrentUser();

  if (user) {
    // user is logged in, redirect to home page
    navCtrl.navigateRoot('/');
    return false; // deny access to login pages
  } else {
    return true; // allow access to login pages for unauthenticated users
  }
};
