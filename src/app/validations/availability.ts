import { Observable, of } from 'rxjs';
import { UserService } from '@/services/user.service';
import { switchMap, catchError, debounceTime, map } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';

export function availability(
  userService: UserService,
  type: 'username' | 'email' | 'mobile',
  getValueFn?: () => string | undefined,
  checkExistence = false
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    // get the value - use custom function if provided (for mobile with country code), otherwise use control value
    const value = getValueFn ? getValueFn() : control.value;
    if (!value) {
      return of(checkExistence ? { notFound: true } : { taken: true }); // default error based on mode
    }

    // normalize value based on type
    const normalizedValue = type === 'email' || type === 'username' ? value.toLowerCase() : value;

    return of(normalizedValue).pipe(
      debounceTime(300),
      switchMap((val) => userService.checkAvailability(val)),
      map((isAvailable) => {
        if (checkExistence) {
          // check if email exists (for login): if available (not taken/doesn't exist), return notFound error
          // if unavailable (taken/exists), return null (valid)
          return isAvailable ? { notFound: true } : null;
        } else {
          // check if email is available (for signup): if available (not taken), return null (valid)
          // if unavailable (taken/exists), return taken error
          return isAvailable ? null : { taken: true };
        }
      }),
      catchError(() => of(checkExistence ? { notFound: true } : { taken: true })) // default error based on mode
    );
  };
}
