import { inject } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs that should skip token addition (e.g., login)
  const skipUrls = ['auth/login', 'https://api.maptiler.com', 'users/check'];
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

  // get the API token from the first user in the array
  const bearerToken = authService.getCurrentToken();

  // clone the request with base URL and add the Authorization header if token exists
  const clonedReq = bearerToken
    ? req.clone({
        url: apiUrl,
        setHeaders: {
          Authorization: `Bearer ${bearerToken}`
        }
      })
    : req.clone({ url: apiUrl });

  return next(clonedReq);
};
