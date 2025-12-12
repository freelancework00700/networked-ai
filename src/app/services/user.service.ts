import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of, Observable, firstValueFrom } from 'rxjs';
import { IUser, IUserResponse } from '@/interfaces/IUser';

@Injectable({ providedIn: 'root' })
export class UserService {
  // services
  private http = inject(HttpClient);

  private transformProfilePayload(formValue: any): IUser {
    const { first_name, last_name, account_type, ...rest } = formValue;

    // combine first_name and last_name into name
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined;

    return { ...rest, name, account_type: account_type.toLowerCase() };
  }

  async saveUser(payload: any): Promise<IUserResponse> {
    try {
      const transformedPayload = this.transformProfilePayload(payload);
      const response = await firstValueFrom(this.http.put<IUserResponse>(`/users`, transformedPayload));
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // check email, username, phone availability
  checkAvailability(value: string): Observable<boolean> {
    if (!value) {
      return of(false); // default to false (unavailable)
    }

    return this.http.get<boolean>(`/users/check/${value}`).pipe(
      map((response) => !response), // API returns false if available, true if taken
      catchError((error) => {
        console.error('Error checking availability:', error);
        return of(false); // default to false (unavailable) on error
      })
    );
  }
}
