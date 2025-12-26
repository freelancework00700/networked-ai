import { of, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';
import { inject, Injectable } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { IUser, VibeItem, IUserResponse } from '@/interfaces/IUser';
import { IAuthUser } from '@/interfaces/IAuth';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  // services
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser;
  }

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

  getUserFromApiResponse(user: IUser): Record<string, any> {
    const { name, ...userWithoutName } = user;
    const { first_name, last_name } = this.splitName(name);

    const payload: Record<string, any> = {};

    Object.entries(userWithoutName).forEach(([key, value]) => {
      if (value !== undefined) {
        payload[key] = value ?? null;
      }
    });

    payload['last_name'] = last_name || null;
    payload['first_name'] = first_name || null;

    return payload;
  }

  generateUserPayload(payload: Record<string, any> & { first_name?: string | null; last_name?: string | null }): Partial<IUser> {
    const { first_name, last_name, ...user } = payload;

    // Filter out null, undefined, and empty string values
    const filteredUser: Partial<IUser> = {};
    Object.entries(user).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filteredUser[key as keyof IUser] = value;
      }
    });

    // Add name if it can be combined from first_name and last_name
    const name = this.combineName(first_name, last_name);
    if (name) {
      filteredUser.name = name;
    }

    return filteredUser;
  }

  async getCurrentUser(force = false): Promise<typeof this.authService.currentUser> {
    if (force || !this.authService.currentUser()) {
      try {
        const id = this.authService.getCurrentUserId();
        if (!id) {
          throw new Error('No current user ID found');
        }
        const user = await this.getUser(id);
        this.authService.updateCurrentUserData(user as IAuthUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
      }
    }

    return this.authService.currentUser;
  }

  async getUser(idOrUsername: string): Promise<IUser> {
    try {
      const response = await this.get<IUserResponse>(`/users/${encodeURIComponent(idOrUsername)}`);
      if (response?.data?.user) {
        return response.data.user;
      }
      throw new Error('User not found');
    } catch (error) {
      console.error('Error fetching user by ID or username:', error);
      throw error;
    }
  }

  async updateCurrentUser(payload: Partial<IUser>): Promise<IUserResponse> {
    const response = await this.put<IUserResponse>(`/users`, payload);
    
    if (response?.data?.user) {
      this.authService.updateCurrentUserData(response.data.user as IAuthUser);
    } else {
      await this.getCurrentUser(true);
    }
    
    return response;
  }

  // update preferences (vibes, interests, hobbies) while preserving all other user data
  async updatePreferences(vibes: string[], interests: string[], hobbies: string[]): Promise<IUserResponse> {
    // get current user data to preserve all existing fields
    const currentUser = await this.getCurrentUser();
    const userData = currentUser();

    if (!userData) {
      throw new Error('User data not found.');
    }

    // convert user data to payload format and merge with new preferences
    const payload = this.generateUserPayload(userData);
    
    // update with new preferences
    payload['vibe_ids'] = vibes;
    payload['hobby_ids'] = hobbies;
    payload['interest_ids'] = interests;

    return await this.updateCurrentUser(payload);
  }

  // check email, username, phone availability
  checkAvailability(value: string): Observable<boolean> {
    if (!value) {
      return of(false); // default to false (unavailable)
    }

    return this.getObservable<boolean>(`/users/check?value=${encodeURIComponent(value)}`).pipe(
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
