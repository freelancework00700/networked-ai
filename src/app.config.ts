import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  RouteReuseStrategy,
  withInMemoryScrolling,
  withComponentInputBinding
} from '@angular/router';
import { appRoutes } from './app.routes';
import CustomPreset from './custom-preset';
import { providePrimeNG } from 'primeng/config';
import { apiInterceptor } from '@/interceptors/api.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { withFetch, provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    provideIonicAngular(),
    provideZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    provideAnimationsAsync(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    providePrimeNG({ theme: { preset: CustomPreset, options: { darkModeSelector: '.app-dark' } } })
  ]
};
