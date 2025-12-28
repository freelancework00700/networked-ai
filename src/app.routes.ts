import { Home } from '@/pages/home';
import { Routes } from '@angular/router';
import { Messages } from '@/pages/messages';
import { NotFound } from '@/pages/not-found';
import { TabLayout } from '@/layout/tab-layout';
import { Profile } from '@/pages/profile/profile';
import { Network } from '@/pages/network/network';
import { onboardingGuard } from '@/guards/onboarding.guard';

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
  { path: 'profile', loadChildren: () => import('@/pages/profile/profile.routes') },

  // authentication routes (lazy loaded)
  {
    path: 'login',
    canActivate: [onboardingGuard],
    loadComponent: () => import('@/pages/login').then((m) => m.Login)
  },
  {
    path: 'signup',
    canActivate: [onboardingGuard],
    loadComponent: () => import('@/pages/signup/signup').then((m) => m.Signup)
  },
  {
    path: 'onboarding',
    canActivate: [onboardingGuard],
    loadComponent: () => import('@/pages/onboarding').then((m) => m.Onboarding)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('@/pages/forgot-password').then((m) => m.ForgotPassword)
  },
  // event routes (lazy loaded)
  {
    path: 'create-event',
    loadComponent: () => import('@/pages/create-event').then((m) => m.CreateEvent)
  },
  {
    path: 'city-events',
    loadComponent: () => import('@/pages/home/city-events').then((m) => m.CityEvents)
  },
  {
    path: 'all-events',
    loadComponent: () => import('@/pages/home/all-events').then((m) => m.AllEvents)
  },
  {
    path: 'event-qr/:id',
    loadComponent: () => import('@/pages/event-qr').then((m) => m.EventQr)
  },
  {
    path: 'event-analytics/:id',
    loadComponent: () => import('@/pages/event-analytics').then((m) => m.EventAnalytics)
  },
  {
    path: 'guest-list/:id',
    loadComponent: () => import('@/pages/guest-list').then((m) => m.GuestList)
  },
  {
    path: 'user-list/:id',
    loadComponent: () => import('@/pages/event-analytics/components/user-list').then((m) => m.UserList)
  },
  {
    path: 'questionnaire-response/:id',
    loadComponent: () => import('@/pages/questionnaire-response').then((m) => m.QuestionnaireResponse)
  },
  {
    path: 'questionnaire-response/user-list/:id',
    loadComponent: () => import('@/pages/questionnaire-response/components/questionnaire-user-list').then((m) => m.QuestionnaireUserList)
  },
  // message routes (lazy loaded)
  {
    path: 'new-chat',
    loadComponent: () => import('@/pages/messages/components/new-chat').then((m) => m.NewChat)
  },
  {
    path: 'chat-room/:id',
    loadComponent: () => import('@/pages/messages/components/chat-room').then((m) => m.ChatRoom)
  },
  {
    path: 'chat-info/:id',
    loadComponent: () => import('@/pages/messages/components/chat-info').then((m) => m.ChatInfo)
  },
  {
    path: 'create-group',
    loadComponent: () => import('@/pages/messages/components/create-group').then((m) => m.CreateGroup)
  },
  {
    path: 'create-group/:id',
    loadComponent: () => import('@/pages/messages/components/create-group').then((m) => m.CreateGroup)
  },
  {
    path: 'group-invitation/:id',
    loadComponent: () => import('@/pages/messages/components/chat-info').then((m) => m.ChatInfo)
  },
  // profile routes (lazy loaded)
  {
    path: 'profile/edit',
    loadComponent: () => import('@/pages/profile/edit-profile').then((m) => m.EditProfile)
  },
  {
    path: 'profile/preferences',
    loadComponent: () => import('@/pages/profile/profile-preferences').then((m) => m.ProfilePreferences)
  },
  // network routes (lazy loaded)
  {
    path: 'add-network',
    loadComponent: () => import('@/pages/network/components/add-network').then((m) => m.AddNetwork)
  },
  {
    path: 'comments/:id',
    loadComponent: () => import('@/pages/new-post/components/post-comments').then((m) => m.PostComments)
  },
  {
    path: 'new-post',
    loadComponent: () => import('@/pages/new-post').then((m) => m.NewPost)
  },
  {
    path: 'terms',
    loadComponent: () => import('@/pages/terms-of-service').then((m) => m.TermsOfService)
  },
  {
    path: 'policy',
    loadComponent: () => import('@/pages/privacy-policy').then((m) => m.PrivacyPolicy)
  },
  {
    path: 'about-achievements',
    loadComponent: () => import('@/pages/about-achievements').then((m) => m.AboutAchievements)
  },
  {
    path: 'achievements',
    loadComponent: () => import('@/pages/profile/components/profile-achievement').then((m) => m.ProfileAchievement)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('@/pages/leaderboard').then((m) => m.Leaderboard)
  },
  // subscription routes (lazy loaded)
  {
    path: 'create-plan',
    loadComponent: () => import('@/pages/create-plan').then((m) => m.CreatePlan)
  },
  {
    path: 'notification',
    loadComponent: () => import('@/pages/notification').then((m) => m.Notification)
  },
  {
    path: 'event/detail',
    loadComponent: () => import('@/pages/create-event/event-detail').then((m) => m.EventDetail)
  },
  {
    path: 'settings',
    loadChildren: () => import('@/pages/settings/settings.routes').then((m) => m.default)
  },
  {
    path: 'subscription-plans',
    loadComponent: () => import('@/pages/subscription-plans').then((m) => m.SubscriptionPlans)
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('@/pages/subscriptions').then((m) => m.Subscriptions)
  },
  // Not found (keep eager as it's small and always needed)
  { path: 'not-found', component: NotFound },
  { path: '**', redirectTo: '/not-found' }
];
