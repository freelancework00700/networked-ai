import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { KEYS, LocalStorageService } from '@/services/localstorage.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService);

  // URLs that should skip token addition (e.g., login)
  const skipUrls = ['api/auth/login', 'https://api.maptiler.com'];
  const shouldSkip = skipUrls.some((url) => req.url.includes(url));

  // check if URL is relative (starts with /) and not absolute (starts with http:// or https://)
  const isRelativeUrl = req.url.startsWith('/') && !req.url.startsWith('http://') && !req.url.startsWith('https://');

  // prepend base API URL for relative URLs
  const apiUrl = isRelativeUrl ? `${environment.apiUrl}${req.url}` : req.url;

  // skip token addition if URL is in skip list
  if (shouldSkip) {
    const clonedReq = req.clone({ url: apiUrl });
    return next(clonedReq);
  }

  // get the API token from storage
  const apiToken = localStorageService.getItem(KEYS.TOKEN);

  // clone the request with base URL and add the Authorization header if token exists
  const clonedReq = apiToken
    ? req.clone({
        url: apiUrl,
        setHeaders: {
          Authorization: `Bearer ${apiToken}`
        }
      })
    : req.clone({ url: apiUrl });

  return next(clonedReq);
};
