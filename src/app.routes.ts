import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { NotFound } from '@/pages/not-found';
import { TabLayout } from '@/layout/tab-layout';
import { Profile } from '@/pages/profile/profile';
import { ForgotPassword } from '@/pages/forgotPassword';
import { Onboarding } from '@/pages/onboarding';

export const appRoutes: Routes = [
  {
    path: '',
    component: TabLayout,
    children: [{ path: '', component: Home }]
  },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'onboarding', component: Onboarding },
  { path: 'profile', component: Profile },
  { path: 'not-found', component: NotFound },
  { path: '**', redirectTo: '/not-found' }
];
