import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { NotFound } from '@/pages/not-found';
import { TabLayout } from '@/layout/tab-layout';
import { Onboarding } from '@/pages/onboarding';
import { Profile } from '@/pages/profile/profile';
import { CreateEvent } from '@/pages/create-event';
import { ForgotPassword } from '@/pages/forgot-password';
import { onboardingGuard } from '@/guards/onboarding.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [{ path: '', component: Home }]
  },
  { path: 'profile', component: Profile },
  { path: 'not-found', component: NotFound },
  { path: 'create-event', component: CreateEvent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'login', component: Login, canActivate: [onboardingGuard] },
  { path: 'onboarding', component: Onboarding, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '/not-found' }
];
