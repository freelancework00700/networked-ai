import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./settings').then((m) => m.Settings)
  },
  {
    path: 'account',
    loadComponent: () => import('./account-settings').then((m) => m.AccountSettings)
  },
  {
    path: 'change-account-info/:type',
    loadComponent: () => import('./change-account-info').then((m) => m.ChangeAccountInfo)
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./verify-otp').then((m) => m.VerifyOtp)
  },
  {
    path: 'payment-history',
    loadComponent: () => import('./payment-history').then((m) => m.PaymentHistory)
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions').then((m) => m.Permissions)
  }
] as Routes;