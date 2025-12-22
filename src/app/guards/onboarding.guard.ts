import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KEYS, LocalStorageService } from '@/services/localstorage.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  // check if user has completed onboarding
  const onboarded = localStorageService.getItem(KEYS.ONBOARDED);

  // if not onboarded, redirect to onboarding page
  if (!onboarded || onboarded !== 'true') {
    // only redirect if not already on onboarding page to avoid infinite loop
    if (state.url !== '/onboarding') {
      router.navigate(['/onboarding']);
      return false;
    }
    return true; // allow access to onboarding page
  }

  // if already onboarded and trying to access onboarding, redirect to home
  if (state.url === '/onboarding') {
    router.navigate(['/']);
    return false;
  }

  return true; // allow access to other routes
};
