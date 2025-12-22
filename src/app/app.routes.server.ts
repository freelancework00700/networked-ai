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
    path: 'not-found',
    renderMode: RenderMode.Prerender
  },
  // dynamic routes with params - must use server-side rendering
  {
    path: 'event-qr/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event-analytics/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'guest-list/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'user-list/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat-room/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat-info/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'create-group/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'group-invitation/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'questionnaire-response/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'questionnaire-response/user-list/:id',
    renderMode: RenderMode.Server
  },
  // routes without params - can be server-rendered
  {
    path: 'create-event',
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
    path: 'comments/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'new-post',
    renderMode: RenderMode.Server
  },
  // catch-all for any other routes
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
