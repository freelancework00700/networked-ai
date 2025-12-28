import { Routes } from '@angular/router';
import { EditProfile } from '@/pages/profile/edit-profile';
import { ProfileSetup } from '@/pages/profile/profile-setup';
import { ProfilePreferences } from '@/pages/profile/profile-preferences';

export default [
  { path: 'edit', component: EditProfile },
  { path: 'setup', component: ProfileSetup },
  { path: 'preferences', component: ProfilePreferences }
] as Routes;
