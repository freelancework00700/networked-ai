import { Routes } from '@angular/router';
import { authGuard } from '@/guards/auth.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./settings').then((m) => m.Settings),
    canActivate: [authGuard]
  },
  {
    path: 'account',
    loadComponent: () => import('./account-settings').then((m) => m.AccountSettings),
    canActivate: [authGuard]
  },
  {
    path: 'change-account-info/:type',
    loadComponent: () => import('./change-account-info').then((m) => m.ChangeAccountInfo),
    canActivate: [authGuard]
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./verify-otp').then((m) => m.VerifyOtp),
    canActivate: [authGuard]
  },
  {
    path: 'payment-history',
    loadComponent: () => import('./payment-history').then((m) => m.PaymentHistory),
    canActivate: [authGuard]
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions').then((m) => m.Permissions),
    canActivate: [authGuard]
  }
] as Routes;
