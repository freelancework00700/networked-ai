import { Routes } from '@angular/router';
import { TabLayout } from '@/layout/tab-layout';
import { onboardingGuard } from '@/guards/onboarding.guard';
import { Messages } from './messages';

export default [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [{ path: '', component: Messages }]
  }
] as Routes;
