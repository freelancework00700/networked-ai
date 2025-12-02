import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { NotFound } from '@/pages/not-found';
import { TabLayout } from '@/layout/tab-layout';

export const appRoutes: Routes = [
  {
    path: '',
    component: TabLayout,
    children: [{ path: '', component: Home }]
  },
  { path: 'login', component: Login },
  { path: 'not-found', component: NotFound },
  { path: '**', redirectTo: '/not-found' }
];
