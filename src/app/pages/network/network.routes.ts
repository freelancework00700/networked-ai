import { Network } from './network';
import { Routes } from '@angular/router';
import { TabLayout } from '@/layout/tab-layout';
import { onboardingGuard } from '@/guards/onboarding.guard';

export default [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [{ path: '', component: Network }]
  }
] as Routes;
