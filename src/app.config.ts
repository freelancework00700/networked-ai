import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  RouteReuseStrategy,
  withInMemoryScrolling,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation
} from '@angular/router';
import { appRoutes } from './app.routes';
import CustomPreset from './custom-preset';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { withFetch, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

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
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    providePrimeNG({ theme: { preset: CustomPreset, options: { darkModeSelector: '.app-dark' } } })
  ]
};
