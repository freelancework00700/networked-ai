import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, catchError, map } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';

export function usernameValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((username) => {
        // Static mock implementation
        const takenUsernames = ['testuser1'];
        const isTaken = takenUsernames.includes(username.toLowerCase());

        return new Observable<ValidationErrors | null>((observer) => {
          setTimeout(() => {
            observer.next(isTaken ? { usernameTaken: true } : null);
            observer.complete();
          }, 500);
        });
      }),
      catchError(() => of(null))
    );
  };
}
