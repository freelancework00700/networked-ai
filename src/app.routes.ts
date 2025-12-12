import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { NotFound } from '@/pages/not-found';
import { Signup } from '@/pages/signup/signup';
import { Onboarding } from '@/pages/onboarding';
import { CreateEvent } from '@/pages/create-event';
import { ForgotPassword } from '@/pages/forgot-password';
import { onboardingGuard } from '@/guards/onboarding.guard';

export const appRoutes: Routes = [
  { path: '', loadChildren: () => import('@/pages/home/home.routes') },
  { path: 'profile', loadChildren: () => import('@/pages/profile/profile.routes') },
  { path: 'not-found', component: NotFound },
  { path: 'create-event', component: CreateEvent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'login', component: Login, canActivate: [onboardingGuard] },
  { path: 'signup', component: Signup, canActivate: [onboardingGuard] },
  { path: 'onboarding', component: Onboarding, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '/not-found' }
];
