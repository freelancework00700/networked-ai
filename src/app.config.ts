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
import { provideNgxStripe } from 'ngx-stripe';
import { providePrimeNG } from 'primeng/config';
import { environment } from './environments/environment';
import { apiInterceptor } from '@/interceptors/api.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { withFetch, provideHttpClient, withInterceptors } from '@angular/common/http';

// custom image loader that supports placeholders with grey fallback
const imageLoaderAndPlaceholder = (config: ImageLoaderConfig): string => {
  // ngOptimizedImage makes placeholder requests with small width (typically 30px)
  // check if this is a placeholder request (small width <= 100px)
  const isPlaceholderRequest = config.width && config.width <= 100;
  const greyColor = 'var(--neutral-05)';

  if (isPlaceholderRequest && config.loaderParams && 'thumbnail' in config.loaderParams) {
    // placeholder request with thumbnail provided - use it for blur-up effect
    if (config.loaderParams['thumbnail']) {
      return config.loaderParams['thumbnail'] as string;
    }
    // placeholder request but no thumbnail - return grey placeholder
    const size = config.width || 30;
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${greyColor}"/>
      </svg>`
    )}`;
  }

  // for placeholder requests without thumbnail in loaderParams, also return grey
  if (isPlaceholderRequest) {
    const size = config.width || 30;
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${greyColor}"/>
      </svg>`
    )}`;
  }

  //for regular images (main image load), return the original URL
  return config.src;
};

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
    { provide: IMAGE_LOADER, useValue: imageLoaderAndPlaceholder },
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    providePrimeNG({ theme: { preset: CustomPreset, options: { darkModeSelector: '.app-dark' } } }),
    provideNgxStripe() 
  ]
};
