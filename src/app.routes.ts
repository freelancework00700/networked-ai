import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { NotFound } from '@/pages/not-found';
import { TabLayout } from '@/layout/tab-layout';
import { Onboarding } from '@/pages/onboarding';
import { Profile } from '@/pages/profile/profile';
import { ForgotPassword } from '@/pages/forgotPassword';
import { CreateEvent } from '@/pages/create-event/create-event';

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
  { path: 'create-event', component: CreateEvent },
  { path: 'not-found', component: NotFound },
  { path: '**', redirectTo: '/not-found' }
];
