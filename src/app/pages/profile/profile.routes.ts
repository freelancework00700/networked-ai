import { Profile } from './profile';
import { Routes } from '@angular/router';
import { EditProfile } from './edit-profile';
import { TabLayout } from '@/layout/tab-layout';
import { onboardingGuard } from '@/guards/onboarding.guard';

export default [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [{ path: '', component: Profile }]
  }
] as Routes;
