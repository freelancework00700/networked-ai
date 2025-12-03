import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const authGuard: CanActivateFn = async (route, state) => {
  const navCtrl = inject(NavController);
  const { user } = await FirebaseAuthentication.getCurrentUser();

  if (user) {
    return true; // allow access if the user is authenticated
  } else {
    // store the attempted url as a query parameter for redirection after login
    const attemptedUrl = state.url; // capture the attempted url

    // only add redirect if the attempted route is not "/"
    if (attemptedUrl !== '/' && !attemptedUrl.startsWith('/login') && !attemptedUrl.startsWith('/not-found')) {
      navCtrl.navigateForward(`/login?redirect=${encodeURIComponent(attemptedUrl)}`);
    } else {
      navCtrl.navigateForward('/login');
    }

    return false; // deny access and redirect to login
  }
};
