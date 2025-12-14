import { Observable, of } from 'rxjs';
import { UserService } from '@/services/user.service';
import { switchMap, catchError, debounceTime, map } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';

export function availability(
  userService: UserService,
  type: 'username' | 'email' | 'mobile',
  getValueFn?: () => string | undefined
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    // get the value - use custom function if provided (for mobile with country code), otherwise use control value
    const value = getValueFn ? getValueFn() : control.value;
    if (!value) {
      return of({ taken: true }); // default to true (taken) if no value
    }

    // normalize value based on type
    const normalizedValue = type === 'email' || type === 'username' ? value.toLowerCase() : value;

    return of(normalizedValue).pipe(
      debounceTime(300),
      switchMap((val) => userService.checkAvailability(val)),
      map((isAvailable) => (isAvailable ? null : { taken: true })),
      catchError(() => of({ taken: true })) // default to true (taken) on error
    );
  };
}
