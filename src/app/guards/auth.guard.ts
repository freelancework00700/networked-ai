import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const modalService = inject(ModalService);

  if (authService.getCurrentToken()) {
    return true;
  }

  const attemptedUrl = state.url;

  await modalService.openLoginModal(attemptedUrl);
  return false;
};
