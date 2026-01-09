import { Routes } from '@angular/router';
import { Event } from '@/pages/event/event';
import { EventQr } from '@/pages/event/event-qr';
import { GuestList } from '@/pages/event/guest-list';
import { AllEvents } from '@/pages/home/all-events';
import { CityEvents } from '@/pages/home/city-events';
import { CreateEvent } from '@/pages/event/create-event';
import { EventAnalytics } from '@/pages/event/event-analytics';
import { EventUserList } from '@/pages/event/components/event-user-list';
import { QuestionnaireResponse } from '@/pages/event/questionnaire-response';
import { AnalyticsUserList } from '@/pages/event/components/analytics-user-list';
import { QuestionnaireUserList } from '@/pages/event/components/questionnaire-user-list';

export default [
  { path: '', component: CreateEvent },

  { path: 'all', component: AllEvents },
  { path: 'city', component: CityEvents },
  { path: 'edit/:id', component: CreateEvent },

  { path: 'qr/:id', component: EventQr },
  { path: 'guests/:id', component: GuestList },
  { path: 'analytics/:id', component: EventAnalytics },
  { path: 'analytics/guests/:id', component: AnalyticsUserList },
  { path: 'questionnaire-response/:id', component: QuestionnaireResponse },
  { path: 'questionnaire-response/guests/:id', component: QuestionnaireUserList },
  { path: ':id/guests', component: EventUserList },

  { path: ':slug', component: Event }
] as Routes;
