import { Login } from '@/pages/login';
import { Routes } from '@angular/router';
import { Messages } from '@/pages/messages';
import { NotFound } from '@/pages/not-found';
import { Signup } from '@/pages/signup/signup';
import { Onboarding } from '@/pages/onboarding';
import { CreateEvent } from '@/pages/create-event';
import { ForgotPassword } from '@/pages/forgot-password';
import { onboardingGuard } from '@/guards/onboarding.guard';
import { NewChat } from '@/pages/messages/components/new-chat';
import { ChatRoom } from '@/pages/messages/components/chat-room';
import { ChatInfo } from '@/pages/messages/components/chat-info';
import { CreateGroup } from '@/pages/messages/components/create-group';

export const appRoutes: Routes = [
  { path: '', loadChildren: () => import('@/pages/home/home.routes') },
  { path: 'profile', loadChildren: () => import('@/pages/profile/profile.routes') },
  { path: 'messages', loadChildren: () => import('@/pages/messages/messages.routes') },
  { path: 'not-found', component: NotFound },
  { path: 'new-chat', component: NewChat },
  { path: 'chat-room/:id', component: ChatRoom },
  { path: 'chat-info/:id', component: ChatInfo },
  { path: 'create-group', component: CreateGroup },
  { path: 'create-event', component: CreateEvent },
  { path: 'create-group/:id', component: CreateGroup },
  { path: 'group-invitation/:id', component: ChatInfo },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'login', component: Login, canActivate: [onboardingGuard] },
  { path: 'signup', component: Signup, canActivate: [onboardingGuard] },
  { path: 'onboarding', component: Onboarding, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '/not-found' }
];
