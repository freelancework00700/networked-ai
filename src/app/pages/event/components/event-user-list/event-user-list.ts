import { IUser } from '@/interfaces/IUser';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { Searchbar } from '@/components/common/searchbar';
import { Router, ActivatedRoute } from '@angular/router';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { IonContent, IonHeader, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit } from '@angular/core';

@Component({
  selector: 'event-user-list',
  styleUrl: './event-user-list.scss',
  templateUrl: './event-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonHeader, IonContent, CommonModule, Searchbar, Button, EmptyState]
})
export class EventUserList implements OnInit {
  navCtrl = inject(NavController);
  navigationService = inject(NavigationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  title = signal<string>('Host(s)');
  searchQuery = signal<string>('');
  eventTitle = signal<string>('');
  eventId = signal<string | null>(null);

  users = signal<IUser[]>([]);

  filteredUsers = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.users();

    return this.users().filter((user) => user.name?.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    // Get route params
    const eventId = this.route.snapshot.paramMap.get('eventId');
    const section = this.route.snapshot.paramMap.get('section');

    if (eventId) {
      this.eventId.set(eventId);
    }

    if (section) {
      this.title.set(decodeURIComponent(section));
    }

    let state: any = null;

    if (typeof window !== 'undefined' && window.history?.state) {
      state = window.history.state;
    } else if (typeof history !== 'undefined' && history.state) {
      state = history.state;
    }

    if (!state) {
      state = this.router.currentNavigation()?.extras?.state;
    }

    if (state && state.users && Array.isArray(state.users)) {
      this.users.set(state.users);
      if (state.role && !section) {
        this.title.set(state.role);
      }
      if (state.eventTitle) {
        this.eventTitle.set(state.eventTitle);
      }
    }
  }

  getUserImage(user: IUser): string {
    return (user.image_url as string) || user.thumbnail_url || 'assets/images/profile.jpeg';
  }

  getUserValue(user: IUser): number {
    return (user as any).total_gamification_points || (user as any).value || 0;
  }

  getUserJobTitle(user: IUser): string {
    return user.title || (user as any).jobTitle || '';
  }

  getUserCompany(user: IUser): string {
    return user.company_name || (user as any).company || '';
  }

  onMessage(user: IUser): void {
    // Handle message action
    console.log('Message user:', user);
  }

  onAdd(user: IUser): void {
    // Handle add action
    console.log('Add user:', user);
  }
}
