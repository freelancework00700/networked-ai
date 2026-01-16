import { input, output, Component, inject, signal, computed, effect, DestroyRef, ChangeDetectionStrategy, afterNextRender, afterEveryRender, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Subject, debounceTime, distinctUntilChanged, switchMap, from } from 'rxjs';
import { EmptyState } from '@/components/common/empty-state';
import { UserCardList } from '@/components/card/user-card-list';
import { NetworkService } from '@/services/network.service';
import { SocketService } from '@/services/socket.service';
import { IUser } from '@/interfaces/IUser';
import { NetworkConnectionUpdate } from '@/interfaces/socket-events';

@Component({
  selector: 'network-list-view',
  imports: [EmptyState, UserCardList, IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent],
  styleUrl: './network-list-view.scss',
  templateUrl: './network-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkListView implements OnDestroy {
  // inputs
  searchQuery = input<string>('');
  latitude = input<string>('');
  longitude = input<string>('');
  radius = input<number>(20);
  userId = input<string | null>(null);

  // outputs
  clearSearch = output<void>();

  // services
  private networkService = inject(NetworkService);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  // signals
  users = signal<IUser[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  isLoadingMore = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  currentUser = input<any>(null);

  hasMore = computed(() => this.currentPage() < this.totalPages());

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
      this.users.set([]);
      this.currentPage.set(1);
        this.totalPages.set(0);
        this.loadConnections(1, false);
      }
    });

    // // Effect to reload connections when location filter changes
    effect(() => {
      const lat = this.latitude();
      const lng = this.longitude();
      const rad = this.radius();
      
      // Only reload if we have location data
      if (lat && lng) {
        this.users.set([]);
        this.currentPage.set(1);
        this.totalPages.set(0);
        this.loadConnections(1, false);
      }
    });

    // Debounced search handler
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmedQuery = query.trim();

          // Reset pagination for new search/load
          this.currentPage.set(1);
          this.totalPages.set(0);

          this.loadConnections(1, false, trimmedQuery || undefined);

          return from(Promise.resolve([]));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Watch searchQuery changes and emit to subject (this triggers debounced search)
    effect(() => {
      const query = this.searchQuery();
      this.searchSubject.next(query);
    });

    this.setupNetworkConnectionListener();
  }

  private setupNetworkConnectionListener(): void {
    this.socketService.onAfterRegistration(() => {
      this.socketService.on('network:connection:update', this.networkConnectionHandler);
    });
  }

  private networkConnectionHandler = (payload: NetworkConnectionUpdate) => {
    if (!payload || !payload.id) return;

    const userId = payload.id;
    const newStatus = payload.connection_status;

    this.users.update((users) =>
      users.map((user) =>
        user.id === userId
          ? { ...user, connection_status: newStatus }
          : user
      )
    );
  };

  ngOnDestroy(): void {
    this.socketService.off('network:connection:update', this.networkConnectionHandler);
  }

  async loadConnections(page: number = 1, append: boolean = false, search?: string): Promise<void> {
    try {
      if (page === 1) this.isLoading.set(true);

      const lat = this.latitude();
      const lng = this.longitude();
      const rad = this.radius();
      const userId = this.userId();

      const result = await this.networkService.getMyConnections({
        page,
        limit: 15,
        search: search || undefined,
        latitude: lat || undefined,
        longitude: lng || undefined,
        radius: (lat && lng) ? rad : undefined,
        userId: userId || undefined
      });

      const users = result.data || [];

      if (append) {
        this.users.update((current) => [...current, ...users]);
      } else {
        this.users.set(users);
      }

      this.currentPage.set(result.pagination?.currentPage || 1);
      this.totalPages.set(result.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;
    const search = this.searchQuery().trim();

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);

      const nextPage = this.currentPage() + 1;

      await this.loadConnections(nextPage, true, search || undefined);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  };

  async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      this.clearSearch.emit();
      await this.loadConnections(1, false);
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      event.target.complete();
    }
  }
}