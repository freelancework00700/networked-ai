import { Routes } from '@angular/router';
import { EditProfile } from '@/pages/profile/edit-profile';
import { ProfileSetup } from '@/pages/profile/profile-setup';
import { ProfilePreferences } from '@/pages/profile/profile-preferences';
import { BusinessCardPage } from '@/pages/profile/business-card';
import { authGuard } from '@/guards/auth.guard';

export default [
  { path: 'edit', component: EditProfile, canActivate: [authGuard] },
  { path: 'setup', component: ProfileSetup, canActivate: [authGuard] },
  { path: 'preferences', component: ProfilePreferences, canActivate: [authGuard] },
  { path: 'business-card', component: BusinessCardPage, canActivate: [authGuard] }
] as Routes;
