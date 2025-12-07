import { Observable, of } from 'rxjs';
import { switchMap, catchError, debounceTime } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';

export function usernameValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((username) => {
        // static mock implementation
        const takenUsernames = ['testuser1'];
        const isTaken = takenUsernames.includes(username.toLowerCase());
        return of(isTaken ? { usernameTaken: true } : null);
      }),
      catchError(() => of(null))
    );
  };
}
