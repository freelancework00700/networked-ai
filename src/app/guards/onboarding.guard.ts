import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavController } from '@ionic/angular/standalone';
import { KEYS, LocalStorageService } from '@/services/localstorage.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const navCtrl = inject(NavController);
  const platformId = inject(PLATFORM_ID);
  const localStorageService = inject(LocalStorageService);

  // on the server, localStorage is not available, so allow access
  // the guard will run again on the client where localStorage is available
  if (!isPlatformBrowser(platformId)) return true;

  // check if user has completed onboarding
  const onboarded = localStorageService.getItem(KEYS.ONBOARDED);

  // if not onboarded, redirect to onboarding page
  if (!onboarded || onboarded !== 'true') {
    // only redirect if not already on onboarding page to avoid infinite loop
    if (state.url !== '/onboarding') {
      navCtrl.navigateRoot('/onboarding');
      return false;
    }

    return true; // allow access to onboarding page
  }

  // if already onboarded and trying to access onboarding, redirect to home
  if (state.url === '/onboarding') {
    navCtrl.navigateRoot('/');
    return false;
  }

  return true; // allow access to other routes
};
