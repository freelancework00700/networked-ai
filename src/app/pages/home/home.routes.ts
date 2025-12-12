import { Home } from './home';
import { Routes } from '@angular/router';
import { TabLayout } from '@/layout/tab-layout';
import { onboardingGuard } from '@/guards/onboarding.guard';

export default [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [
      { path: '', component: Home }
    ]
  }
] as Routes;
