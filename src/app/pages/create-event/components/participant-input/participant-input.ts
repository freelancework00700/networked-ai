import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { IonSearchbar } from '@ionic/angular/standalone';
import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  thumbnail?: string;
  email?: string;
  phone?: string;
}
@Component({
  selector: 'participant-input',
  styleUrl: './participant-input.scss',
  templateUrl: './participant-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonSearchbar, Button]
})
export class ParticipantInput {
  label = input<string>('');
  type = input<'co-host' | 'sponsor' | 'speaker'>('co-host');
  selectedUsers = input<User[]>([]);

  usersChange = output<User[]>();

  // Static mock data - 10 users
  private mockUsers: User[] = [
    { uid: '1', firstName: 'John', lastName: 'Doe', thumbnail: 'assets/images/profile.jpeg', email: 'john@example.com' },
    { uid: '2', firstName: 'Jane', lastName: 'Smith', thumbnail: 'assets/images/profile.jpeg', email: 'jane@example.com' },
    { uid: '3', firstName: 'Mike', lastName: 'Johnson', thumbnail: 'assets/images/profile.jpeg', email: 'mike@example.com' },
    { uid: '4', firstName: 'Sarah', lastName: 'Williams', thumbnail: 'assets/images/profile.jpeg', email: 'sarah@example.com' },
    { uid: '5', firstName: 'David', lastName: 'Brown', thumbnail: 'assets/images/profile.jpeg', email: 'david@example.com' },
    { uid: '6', firstName: 'Emily', lastName: 'Davis', thumbnail: 'assets/images/profile.jpeg', email: 'emily@example.com' },
    { uid: '7', firstName: 'Chris', lastName: 'Miller', thumbnail: 'assets/images/profile.jpeg', email: 'chris@example.com' },
    { uid: '8', firstName: 'Anna', lastName: 'Wilson', thumbnail: 'assets/images/profile.jpeg', email: 'anna@example.com' },
    { uid: '9', firstName: 'Tom', lastName: 'Moore', thumbnail: 'assets/images/profile.jpeg', email: 'tom@example.com' },
    { uid: '10', firstName: 'Lisa', lastName: 'Taylor', thumbnail: 'assets/images/profile.jpeg', email: 'lisa@example.com' }
  ];

  showInput = signal<boolean>(false);
  internalUsers = signal<(User | null)[]>([]);
  searchInputs = signal<Record<number, string>>({});
  filteredUsers = signal<Record<number, User[]>>({});

  // Computed to check if all slots are filled
  allSlotsFilled = computed(() => {
    const users = this.internalUsers();
    return users.length > 0 && !users.some((u) => u === null);
  });

  // Computed to check if searchbar is visible
  isSearchbarVisible = computed(() => {
    return this.showInput() && this.internalUsers().some((u) => u === null);
  });

  constructor() {
    // React to changes in selectedUsers input
    effect(() => {
      const users = this.selectedUsers();
      this.initializeUsers(users);
    });
  }

  private initializeUsers(users: User[]): void {
    // Initialize with provided users or empty array
    if (users && users.length > 0) {
      this.internalUsers.set([...users]);
      this.showInput.set(true);
    } else {
      this.internalUsers.set([]);
      this.showInput.set(false);
    }
  }

  onAddClick(): void {
    this.showInput.set(true);
    this.addInput();
  }

  addInput(): void {
    // Always add a new null placeholder for new input (don't replace existing ones)
    const currentUsers = this.internalUsers();
    const newIndex = currentUsers.length;

    // Add new entry to the end
    this.internalUsers.update((users) => [...users, null]);

    // Initialize search input and filtered users for the new index
    this.searchInputs.update((inputs) => ({ ...inputs, [newIndex]: '' }));
    this.filteredUsers.update((users) => ({ ...users, [newIndex]: [] }));
  }

  onSearchInputEvent(index: number, event: Event): void {
    const customEvent = event as CustomEvent;
    const value = customEvent.detail?.value || '';
    this.onSearchInput(index, value);
  }

  onSearchInput(index: number, value: string): void {
    this.searchInputs.update((inputs) => ({ ...inputs, [index]: value }));

    if (!value || value.trim() === '') {
      this.filteredUsers.update((users) => ({ ...users, [index]: [] }));
      return;
    }

    const searchTerm = value.toLowerCase();
    const currentUsers = this.internalUsers();
    const filtered = this.mockUsers.filter((user) => {
      // Exclude already selected users
      const isSelected = currentUsers.some((u) => u && u.uid === user.uid);
      if (isSelected) return false;

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';

      return fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
    });

    this.filteredUsers.update((users) => ({ ...users, [index]: filtered }));
  }

  onSelectUser(index: number, user: User): void {
    const currentUsers = this.internalUsers();

    // Check if user is already selected (prevent duplicates)
    const isAlreadySelected = currentUsers.some((u) => u && u.uid === user.uid);
    if (isAlreadySelected) {
      return; // Don't allow duplicate selection
    }

    // Always add the user as a new entry at the end (don't replace the empty slot at index)
    this.internalUsers.update((users) => [...users, user]);

    // Clear filtered results for the current search index (keep the search input for the empty slot)
    this.filteredUsers.update((users) => {
      const newUsers = { ...users };
      delete newUsers[index];
      return newUsers;
    });

    // Clear the search input for the current index so the empty slot is ready for new input
    this.searchInputs.update((inputs) => {
      const newInputs = { ...inputs };
      newInputs[index] = '';
      return newInputs;
    });

    const validUsers = this.internalUsers().filter((u) => u !== null) as User[];
    this.usersChange.emit(validUsers);
  }

  onClear(index: number): void {
    const currentUsers = this.internalUsers();
    const userToRemove = currentUsers[index];

    this.internalUsers.update((users) => {
      const updated = [...users];
      updated.splice(index, 1);
      return updated;
    });

    // Reindex search inputs and filtered users
    this.searchInputs.update((inputs) => {
      const newInputs: Record<number, string> = {};
      Object.keys(inputs).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          newInputs[keyNum] = inputs[keyNum];
        } else if (keyNum > index) {
          newInputs[keyNum - 1] = inputs[keyNum];
        }
      });
      return newInputs;
    });

    this.filteredUsers.update((users) => {
      const newUsers: Record<number, User[]> = {};
      Object.keys(users).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          newUsers[keyNum] = users[keyNum];
        } else if (keyNum > index) {
          newUsers[keyNum - 1] = users[keyNum];
        }
      });
      return newUsers;
    });

    // If no users left, hide the input section
    if (this.internalUsers().length === 0) {
      this.showInput.set(false);
    }

    const validUsers = this.internalUsers().filter((u) => u !== null) as User[];
    this.usersChange.emit(validUsers);
  }

  getSearchInput(index: number): string {
    return this.searchInputs()[index] || '';
  }

  getFilteredUsers(index: number): User[] {
    return this.filteredUsers()[index] || [];
  }

  getUsers(): (User | null)[] {
    return this.internalUsers();
  }

  getItemLabel(index: number): string {
    // Convert label to singular form and remove (s) if present
    // Handle labels like "Co-Host(s)", "Sponsor(s)", "Speaker(s)" -> "Host", "Sponsor", "Speaker"
    let baseLabel = this.label().replace(/\(s\)/g, '').trim();

    // Handle "Co-Host(s)" -> "Host"
    if (baseLabel.toLowerCase().includes('co-host')) {
      baseLabel = 'Host';
    }

    return `${baseLabel} ${index + 1}`;
  }
}
