import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { Messages } from '@/pages/messages';
import { NotFound } from '@/pages/not-found';
import { Signup } from '@/pages/signup/signup';
import { TabLayout } from '@/layout/tab-layout';
import { Onboarding } from '@/pages/onboarding';
import { Profile } from '@/pages/profile/profile';
import { Network } from '@/pages/network/network';
import { CreateEvent } from '@/pages/create-event';
import { EventAnalytics } from '@/pages/event-analytics';
import { ForgotPassword } from '@/pages/forgot-password';
import { EditProfile } from '@/pages/profile/edit-profile';
import { onboardingGuard } from '@/guards/onboarding.guard';
import { NewChat } from '@/pages/messages/components/new-chat';
import { ChatRoom } from '@/pages/messages/components/chat-room';
import { ChatInfo } from '@/pages/messages/components/chat-info';
import { AddNetwork } from '@/pages/network/components/add-network';
import { CreateGroup } from '@/pages/messages/components/create-group';
import { UserList } from '@/pages/event-analytics/components/user-list';

export const appRoutes: Routes = [
  {
    path: '',
    component: TabLayout,
    canActivate: [onboardingGuard],
    children: [
      { path: '', component: Home },
      { path: 'profile', component: Profile },
      { path: 'network', component: Network },
      { path: 'messages', component: Messages }
    ]
  },
  { path: 'new-chat', component: NewChat },
  { path: 'not-found', component: NotFound },
  { path: 'add-network', component: AddNetwork },
  { path: 'user-list/:id', component: UserList },
  { path: 'chat-room/:id', component: ChatRoom },
  { path: 'chat-info/:id', component: ChatInfo },
  { path: 'create-group', component: CreateGroup },
  { path: 'profile/edit', component: EditProfile },
  { path: 'create-event', component: CreateEvent },
  { path: 'create-group/:id', component: CreateGroup },
  { path: 'group-invitation/:id', component: ChatInfo },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'event-analytics/:id', component: EventAnalytics },
  { path: 'login', component: Login, canActivate: [onboardingGuard] },
  { path: 'signup', component: Signup, canActivate: [onboardingGuard] },
  { path: 'onboarding', component: Onboarding, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '/not-found' }
];
