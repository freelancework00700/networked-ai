import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // static routes - can be pre-rendered at build time
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: 'signup',
    renderMode: RenderMode.Server
  },
  {
    path: 'onboarding',
    renderMode: RenderMode.Server
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Server
  },
  {
    path: 'terms',
    renderMode: RenderMode.Server
  },
  {
    path: 'policy',
    renderMode: RenderMode.Server
  },
  {
    path: 'notification',
    renderMode: RenderMode.Server
  },
  {
    path: 'not-found',
    renderMode: RenderMode.Prerender
  },
  // dynamic routes with params - must use server-side rendering
  {
    path: 'chat-room',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat-info',
    renderMode: RenderMode.Server
  },
  {
    path: 'create-group/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'comments/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/guests/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'group-invitation/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/questionnaire-response/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/questionnaire-response/guests/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/analytics/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/analytics/guests/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/rsvp-approval/:eventId',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/guests/:eventId/:section',
    renderMode: RenderMode.Server
  },
  // routes without params - can be server-rendered
  {
    path: 'event',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/city',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/all',
    renderMode: RenderMode.Server
  },
  {
    path: 'new-chat',
    renderMode: RenderMode.Server
  },
  {
    path: 'create-group',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile/preferences',
    renderMode: RenderMode.Server
  },
  {
    path: 'add-network',
    renderMode: RenderMode.Server
  },
  {
    path: 'new-post',
    renderMode: RenderMode.Server
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings/account',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings/change-account-info/:type',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings/verify-otp',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings/payment-history',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings/permissions',
    renderMode: RenderMode.Client
  },
  {
    path: 'subscription/plans',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/create',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/manage/:planId',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/user/:userId',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/:planId',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/:planId/events',
    renderMode: RenderMode.Server
  },
  {
    path: 'subscription/:planId/subscribers',
    renderMode: RenderMode.Server
  },
  {
    path: ':username',
    renderMode: RenderMode.Client
  },
  // catch-all for any other routes
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
