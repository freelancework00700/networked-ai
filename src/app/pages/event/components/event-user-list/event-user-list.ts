import { IUser } from '@/interfaces/IUser';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Searchbar } from '@/components/common/searchbar';
import { SocketService } from '@/services/socket.service';
import { EmptyState } from '@/components/common/empty-state';
import { UserCardList } from '@/components/card/user-card-list';
import { NavigationService } from '@/services/navigation.service';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'event-user-list',
  styleUrl: './event-user-list.scss',
  templateUrl: './event-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonHeader, IonContent, CommonModule, Searchbar, EmptyState, UserCardList]
})
export class EventUserList implements OnInit, OnDestroy {
  navigationService = inject(NavigationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private socketService = inject(SocketService);
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

    this.setupNetworkConnectionListener();
  }

  private setupNetworkConnectionListener(): void {
    this.socketService.onAfterRegistration(() => {
      this.socketService.on('network:connection:update', this.networkConnectionHandler);
    });
  }

  private networkConnectionHandler = (payload: IUser) => {
    if (!payload || !payload.id) return;

    const userId = payload.id;
    const newStatus = payload.connection_status;

    this.users.update((users) => users.map((user) => (user.id === userId ? { ...user, connection_status: newStatus } : user)));
  };

  ngOnDestroy(): void {
    this.socketService.off('network:connection:update', this.networkConnectionHandler);
  }
}
