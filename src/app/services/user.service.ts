import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { signal, Injectable } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { IUser, VibeItem, IUserResponse } from '@/interfaces/IUser';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  // signal state for current user
  currentUser = signal<IUser | null>(null);

  // split name into first_name and last_name
  private splitName(name?: string): { first_name: string; last_name: string } {
    if (!name) return { first_name: '', last_name: '' };

    const nameParts = name.split(' ');
    return {
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || ''
    };
  }

  // combine first_name and last_name into name
  private combineName(first_name?: string | null, last_name?: string | null): string {
    const parts = [first_name, last_name].filter(Boolean);
    return parts.join(' ').trim();
  }

  userToFormData(user: IUser): Record<string, any> {
    const { name, ...userWithoutName } = user;
    const { first_name, last_name } = this.splitName(name);

    const formData: Record<string, any> = {};

    Object.entries(userWithoutName).forEach(([key, value]) => {
      if (value !== undefined) {
        formData[key] = value ?? null;
      }
    });

    formData['last_name'] = last_name || null;
    formData['first_name'] = first_name || null;

    return formData;
  }

  formDataToUser(formData: Record<string, any> & { first_name?: string | null; last_name?: string | null }): Partial<IUser> {
    const { first_name, last_name, ...userData } = formData;

    const name = this.combineName(first_name, last_name);
    if (name) {
      (userData as Partial<IUser>).name = name;
    }

    return userData as Partial<IUser>;
  }

  async getCurrentUser(force = false): Promise<typeof this.currentUser> {
    if (force || !this.currentUser()) {
      try {
        const response = await this.get<IUserResponse>('/users/me');
        if (response?.data?.user) {
          this.currentUser.set(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
      }
    }

    return this.currentUser;
  }

  async updateCurrentUser(payload: Partial<IUser>): Promise<IUserResponse> {
    const response = await this.putFormData<IUserResponse>('/users', payload);

    if (response?.data?.user) {
      this.currentUser.set(response.data.user);
    }

    return response;
  }

  // check email, username, phone availability
  checkAvailability(value: string): Observable<boolean> {
    if (!value) {
      return of(false); // default to false (unavailable)
    }

    return this.getObservable<boolean>(`/users/check/${value}`).pipe(
      map((response) => !response), // API returns false if available, true if taken
      catchError((error) => {
        console.error('Error checking availability:', error);
        return of(false); // default to false (unavailable) on error
      })
    );
  }

  // get vibes
  async getVibes(): Promise<VibeItem[]> {
    try {
      const response = await this.get<{ data?: VibeItem[] }>('/vibe');
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching vibes:', error);
      throw error;
    }
  }

  // get hobbies
  async getHobbies(): Promise<VibeItem[]> {
    try {
      const response = await this.get<{ data?: VibeItem[] }>('/hobbies');
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching hobbies:', error);
      throw error;
    }
  }

  // get interests
  async getInterests(): Promise<VibeItem[]> {
    try {
      const response = await this.get<{ data?: VibeItem[] }>('/interests');
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    }
  }
}
